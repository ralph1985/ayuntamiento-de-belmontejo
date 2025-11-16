import type { APIRoute } from 'astro';
import contactInfo from '@js/contact';

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const DEFAULT_CONTACT_FORM_SENDER = 'onboarding@resend.dev' as const;
const CONTACT_FORM_SENDER =
  contactInfo.contact?.formSender ?? DEFAULT_CONTACT_FORM_SENDER;
const CONTACT_FORM_RECIPIENT = contactInfo.contact?.formRecipient;

type ContactFormPayload = {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
};

const jsonResponse = (data: unknown, status = 200): globalThis.Response =>
  new globalThis.Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });

const sanitizeText = (value: string, maxLength: number): string => {
  const trimmed = value.trim();
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
};

const escapeHtml = (unsafe: string): string =>
  unsafe.replace(
    /[&<>"']/g,
    match =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[match] ?? match
  );

const toHtml = (payload: Required<ContactFormPayload>): string => `
  <p><strong>Nombre:</strong> ${escapeHtml(payload.name)}</p>
  <p><strong>Correo:</strong> ${escapeHtml(payload.email)}</p>
  <p><strong>Teléfono:</strong> ${escapeHtml(payload.phone)}</p>
  <p><strong>Asunto:</strong> ${escapeHtml(payload.subject)}</p>
  <p><strong>Mensaje:</strong></p>
  <p>${escapeHtml(payload.message).replace(/\n/g, '<br />')}</p>
`;

const validatePayload = (
  data: ContactFormPayload
):
  | { success: false; error: string }
  | { success: true; payload: Required<ContactFormPayload> } => {
  if (!data) {
    return { success: false, error: 'Solicitud inválida' };
  }

  const name = sanitizeText(data.name ?? '', 120);
  const email = sanitizeText(data.email ?? '', 160);
  const phone = sanitizeText(data.phone ?? '', 60);
  const subject = sanitizeText(data.subject ?? 'Consulta desde la web', 150);
  const message = sanitizeText(data.message ?? '', 5000);

  if (!name || !email || !phone || !message) {
    return { success: false, error: 'Todos los campos son obligatorios' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Correo electrónico inválido' };
  }

  return {
    success: true,
    payload: { name, email, phone, subject, message },
  };
};

const ensureConfig = () => {
  if (!RESEND_API_KEY || !CONTACT_FORM_SENDER || !CONTACT_FORM_RECIPIENT) {
    throw new Error(
      'Configuración de Resend incompleta. Revisa RESEND_API_KEY y los campos formSender/formRecipient en los datos de contacto.'
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    ensureConfig();
  } catch (error) {
    return jsonResponse(
      { success: false, error: (error as Error).message },
      500
    );
  }

  let data: ContactFormPayload;
  try {
    data = (await request.json()) as ContactFormPayload;
  } catch {
    return jsonResponse(
      { success: false, error: 'No se pudo leer la solicitud' },
      400
    );
  }

  const validation = validatePayload(data);
  if (!validation.success) {
    return jsonResponse({ success: false, error: validation.error }, 400);
  }

  const { payload } = validation;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: CONTACT_FORM_SENDER,
        to: [CONTACT_FORM_RECIPIENT],
        reply_to: payload.email,
        subject: `Contacto web: ${payload.subject}`,
        html: toHtml(payload),
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message =
        errorBody?.message ??
        'No se pudo enviar el correo. Inténtalo de nuevo más tarde.';
      return jsonResponse({ success: false, error: message }, 502);
    }

    return jsonResponse({ success: true });
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        error: 'Error interno al enviar el mensaje',
        details:
          process.env.NODE_ENV === 'development' ? `${error}` : undefined,
      },
      500
    );
  }
};
