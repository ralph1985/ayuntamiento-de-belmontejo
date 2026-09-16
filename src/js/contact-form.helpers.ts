export interface ContactMailtoValues {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export type ContactFormValues = ContactMailtoValues;

export type FieldName = keyof ContactFormValues;

export type ContactFormLimits = Record<FieldName, number>;

export type ValidationError = {
  field: FieldName;
  message: string;
};

export type FormStatus = 'idle' | 'pending' | 'success' | 'error';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeLineBreaks = (value: string): string =>
  value.replace(/\r\n?/g, '\n').trim();

export const buildContactMailto = (
  recipient: string,
  values: ContactMailtoValues
): string => {
  const subject = `Contacto web: ${normalizeLineBreaks(values.subject)}`;
  const body = [
    `Nombre: ${normalizeLineBreaks(values.name)}`,
    `Correo electrónico: ${normalizeLineBreaks(values.email) || 'No indicado'}`,
    `Teléfono: ${normalizeLineBreaks(values.phone) || 'No indicado'}`,
    '',
    normalizeLineBreaks(values.message),
  ].join('\n');

  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

export const getStatusMessage = (variant: FormStatus): string => {
  switch (variant) {
    case 'pending':
      return 'Enviando tu mensaje...';
    case 'success':
      return '¡Gracias! Hemos recibido tu mensaje y te responderemos pronto.';
    case 'error':
      return 'No se ha podido enviar el mensaje. Inténtalo de nuevo.';
    default:
      return '';
  }
};

export const updateStatus = (
  element: HTMLElement | null,
  variant: FormStatus,
  customMessage?: string
) => {
  if (!element) return;
  element.dataset.status = variant;
  element.textContent = customMessage ?? getStatusMessage(variant);
};

export const extractFormValues = (form: HTMLFormElement): ContactFormValues => {
  const formData = new FormData(form);
  const getValue = (field: string) =>
    (formData.get(field)?.toString() ?? '').trim();

  return {
    name: getValue('name'),
    email: getValue('email'),
    phone: getValue('phone'),
    subject: getValue('subject'),
    message: getValue('message'),
  };
};

export const validateFormValues = (
  values: ContactFormValues,
  limits: ContactFormLimits
): { success: true } | { success: false; errors: ValidationError[] } => {
  const errors: ValidationError[] = [];

  if (!values.name) {
    errors.push({
      field: 'name',
      message: 'El nombre es obligatorio.',
    });
  }

  if (limits.name > 0 && values.name.length > limits.name) {
    errors.push({
      field: 'name',
      message: `El nombre no puede superar los ${limits.name} caracteres.`,
    });
  }

  const hasEmail = Boolean(values.email);
  const hasPhone = Boolean(values.phone);

  if (!hasEmail && !hasPhone) {
    errors.push({
      field: 'email',
      message: 'Indica un correo o déjalo en blanco si prefieres teléfono.',
    });
    errors.push({
      field: 'phone',
      message: 'Indica un teléfono o deja el campo vacío si usas correo.',
    });
  }

  if (hasEmail && !EMAIL_REGEX.test(values.email)) {
    errors.push({
      field: 'email',
      message: 'Correo electrónico inválido.',
    });
  }

  if (limits.email > 0 && values.email.length > limits.email) {
    errors.push({
      field: 'email',
      message: `El correo electrónico no puede superar los ${limits.email} caracteres.`,
    });
  }

  if (!values.subject) {
    errors.push({
      field: 'subject',
      message: 'El asunto es obligatorio.',
    });
  }

  if (limits.subject > 0 && values.subject.length > limits.subject) {
    errors.push({
      field: 'subject',
      message: `El asunto no puede superar los ${limits.subject} caracteres.`,
    });
  }

  if (!values.message) {
    errors.push({
      field: 'message',
      message: 'Escribe tu mensaje.',
    });
  }

  if (limits.message > 0 && values.message.length > limits.message) {
    errors.push({
      field: 'message',
      message: `El mensaje no puede superar los ${limits.message} caracteres.`,
    });
  }

  if (limits.phone > 0 && values.phone.length > limits.phone) {
    errors.push({
      field: 'phone',
      message: `El teléfono no puede superar los ${limits.phone} caracteres.`,
    });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true };
};

export const mountCharacterCounter = (
  field: HTMLTextAreaElement | null,
  counter: HTMLElement | null,
  messageMaxLength: number
): (() => void) | null => {
  if (!field || !counter || !messageMaxLength) return null;

  const updateCounter = () => {
    const remaining = Math.max(messageMaxLength - field.value.length, 0);
    counter.textContent = `${remaining} caracteres restantes`;
  };

  field.addEventListener('input', updateCounter);
  updateCounter();

  return updateCounter;
};

export const setFieldError = (
  form: HTMLFormElement,
  field: FieldName,
  message?: string
) => {
  const errorElement = form.querySelector(
    `[data-field-error="${field}"]`
  ) as HTMLElement | null;
  const fieldInput = form.querySelector(`[data-field-input="${field}"]`) as
    | HTMLInputElement
    | HTMLTextAreaElement
    | null;

  if (errorElement) {
    errorElement.textContent = message ?? '';
  }

  if (fieldInput) {
    if (message) {
      fieldInput.classList.add('is-invalid');
      fieldInput.setAttribute('aria-invalid', 'true');
    } else {
      fieldInput.classList.remove('is-invalid');
      fieldInput.removeAttribute('aria-invalid');
    }
  }
};

export const clearAllFieldErrors = (form: HTMLFormElement) => {
  (['name', 'email', 'phone', 'subject', 'message'] as FieldName[]).forEach(
    field => setFieldError(form, field)
  );
};
