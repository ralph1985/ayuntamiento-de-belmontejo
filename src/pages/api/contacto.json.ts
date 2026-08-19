import type { APIRoute } from 'astro';
import contactInfo from '@js/contact';

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const RECAPTCHA_SECRET_KEY = import.meta.env.RECAPTCHA_SECRET_KEY;
const MESSAGE_MAX_LENGTH = 1000;
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
  recaptchaToken?: string;
  privacyConsent?: boolean;
  website?: string;
};

const jsonResponse = (
  data: unknown,
  status = 200,
  headers: Record<string, string> = {}
): globalThis.Response =>
  new globalThis.Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });

const stripControlCharacters = (
  value: string,
  allowNewlines: boolean
): string => {
  let cleaned = '';

  for (const char of value) {
    const code = char.charCodeAt(0);
    const isControl = code <= 0x1f || code === 0x7f;
    const isLineFeed = char === '\n';

    if (!isControl) {
      cleaned += char;
      continue;
    }

    if (allowNewlines && isLineFeed) {
      cleaned += char;
    }
  }

  return cleaned;
};

// El contador vive en la instancia serverless actual. Es una defensa ligera
// y complementaria a reCAPTCHA, no un límite global entre todas las instancias.
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const rateLimitBuckets = new Map<string, number[]>();

const getClientIp = (request: globalThis.Request): string => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() ?? 'unknown';
  }

  return request.headers.get('x-real-ip') ?? 'unknown';
};

type RateLimitResult = {
  limited: boolean;
  remaining: number;
  resetAt: number;
};

const applyRateLimit = (ip: string): RateLimitResult => {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = rateLimitBuckets.get(ip) ?? [];
  const recentRequests = timestamps.filter(
    timestamp => timestamp > windowStart
  );
  const resetAt =
    (recentRequests.length ? Math.min(...recentRequests) : now) +
    RATE_LIMIT_WINDOW_MS;

  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitBuckets.set(ip, recentRequests);
    return {
      limited: true,
      remaining: 0,
      resetAt,
    };
  }

  recentRequests.push(now);
  rateLimitBuckets.set(ip, recentRequests);
  const remaining = RATE_LIMIT_MAX_REQUESTS - recentRequests.length;

  return {
    limited: false,
    remaining,
    resetAt,
  };
};

const logContactEvent = (
  event:
    | 'configuration-error'
    | 'honeypot'
    | 'rate-limited'
    | 'recaptcha-error'
    | 'validation-error'
    | 'resend-error'
    | 'success'
): void => {
  const message = `[contact-form] ${event}`;

  if (event === 'configuration-error' || event.endsWith('error')) {
    // eslint-disable-next-line no-console
    console.error(message);
    return;
  }

  if (event === 'honeypot' || event === 'rate-limited') {
    // eslint-disable-next-line no-console
    console.warn(message);
    return;
  }

  // eslint-disable-next-line no-console
  console.info(message);
};

const toRateLimitHeaders = (
  result: RateLimitResult
): Record<string, string> => ({
  'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
  'X-RateLimit-Remaining': Math.max(result.remaining, 0).toString(),
  'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString(),
});

const sanitizeText = (
  value: string,
  maxLength: number,
  { allowNewlines = false }: { allowNewlines?: boolean } = {}
): string => {
  const withoutControlChars = stripControlCharacters(value, allowNewlines);
  const trimmed = withoutControlChars.trim();
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
  <p><strong>Correo:</strong> ${
    payload.email ? escapeHtml(payload.email) : 'No proporcionado'
  }</p>
  <p><strong>Teléfono:</strong> ${
    payload.phone ? escapeHtml(payload.phone) : 'No proporcionado'
  }</p>
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
  const subject = sanitizeText(data.subject ?? '', 150);
  const rawMessage = sanitizeText(data.message ?? '', MESSAGE_MAX_LENGTH, {
    allowNewlines: true,
  });
  const privacyConsent = Boolean(data.privacyConsent);

  if (!name) {
    return { success: false, error: 'El nombre es obligatorio.' };
  }

  if (!email && !phone) {
    return {
      success: false,
      error: 'Indica al menos un correo electrónico o un teléfono.',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    return { success: false, error: 'Correo electrónico inválido.' };
  }

  if (!subject) {
    return { success: false, error: 'El asunto es obligatorio.' };
  }

  if (!rawMessage) {
    return { success: false, error: 'Escribe tu mensaje.' };
  }

  if (rawMessage.length > MESSAGE_MAX_LENGTH) {
    return {
      success: false,
      error: `El mensaje no puede superar los ${MESSAGE_MAX_LENGTH} caracteres.`,
    };
  }

  const message = sanitizeText(rawMessage, MESSAGE_MAX_LENGTH);

  if (!privacyConsent) {
    return {
      success: false,
      error: 'Debes aceptar la política de privacidad para continuar.',
    };
  }

  return {
    success: true,
    payload: { name, email, phone, subject, message, privacyConsent },
  };
};

const ensureConfig = () => {
  if (
    !RESEND_API_KEY ||
    !CONTACT_FORM_SENDER ||
    !CONTACT_FORM_RECIPIENT ||
    !RECAPTCHA_SECRET_KEY
  ) {
    throw new Error(
      'Configuración incompleta. Revisa Resend, reCAPTCHA y los campos formSender/formRecipient en los datos de contacto.'
    );
  }
};

type RecaptchaValidationResult =
  | { success: true }
  | { success: false; error: string };

type RecaptchaResponse = {
  success: boolean;
  score?: number;
  action?: string;
  hostname?: string;
  'error-codes'?: string[];
};

const EXPECTED_RECAPTCHA_HOSTNAME = new globalThis.URL(
  contactInfo.entity.domain
).hostname;

const verifyRecaptchaToken = async (
  token: string | undefined
): Promise<RecaptchaValidationResult> => {
  if (!token) {
    return {
      success: false,
      error: 'Validación reCAPTCHA requerida.',
    };
  }

  const params = new globalThis.URLSearchParams();
  params.append('secret', RECAPTCHA_SECRET_KEY as string);
  params.append('response', token);

  try {
    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error:
          'No se pudo validar reCAPTCHA. Recarga la página e inténtalo nuevamente.',
      };
    }

    const verification = (await response.json()) as RecaptchaResponse;

    if (
      !verification.success ||
      verification.action !== 'contact_form' ||
      verification.hostname !== EXPECTED_RECAPTCHA_HOSTNAME ||
      typeof verification.score !== 'number' ||
      verification.score < 0.5
    ) {
      return {
        success: false,
        error:
          'La validación anti-spam ha fallado. Inténtalo de nuevo en unos instantes.',
      };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: 'No se pudo contactar con el servicio reCAPTCHA.',
    };
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    ensureConfig();
  } catch (error) {
    logContactEvent('configuration-error');
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

  const clientIp = getClientIp(request);
  if (data.website?.trim()) {
    logContactEvent('honeypot');
    return jsonResponse({ success: true });
  }
  const rateLimit = applyRateLimit(clientIp);
  const rateLimitHeaders = toRateLimitHeaders(rateLimit);

  if (rateLimit.limited) {
    logContactEvent('rate-limited');
    return jsonResponse(
      {
        success: false,
        error: 'Has realizado demasiadas solicitudes. Inténtalo más tarde.',
      },
      429,
      rateLimitHeaders
    );
  }

  const recaptchaValidation = await verifyRecaptchaToken(data.recaptchaToken);
  if (!recaptchaValidation.success) {
    logContactEvent('recaptcha-error');
    return jsonResponse(
      { success: false, error: recaptchaValidation.error },
      400,
      rateLimitHeaders
    );
  }

  const validation = validatePayload(data);
  if (!validation.success) {
    logContactEvent('validation-error');
    return jsonResponse(
      { success: false, error: validation.error },
      400,
      rateLimitHeaders
    );
  }

  const { payload } = validation;

  try {
    const emailBody: Record<string, unknown> = {
      from: CONTACT_FORM_SENDER,
      to: [CONTACT_FORM_RECIPIENT],
      subject: `Contacto web: ${payload.subject}`,
      html: toHtml(payload),
    };

    if (payload.email) {
      emailBody.reply_to = payload.email;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailBody),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message =
        errorBody?.message ??
        'No se pudo enviar el correo. Inténtalo de nuevo más tarde.';
      logContactEvent('resend-error');
      return jsonResponse(
        { success: false, error: message },
        502,
        rateLimitHeaders
      );
    }

    logContactEvent('success');
    return jsonResponse({ success: true }, 200, rateLimitHeaders);
  } catch (error) {
    logContactEvent('resend-error');
    return jsonResponse(
      {
        success: false,
        error: 'Error interno al enviar el mensaje',
        details:
          process.env.NODE_ENV === 'development' ? `${error}` : undefined,
      },
      500,
      rateLimitHeaders
    );
  }
};
