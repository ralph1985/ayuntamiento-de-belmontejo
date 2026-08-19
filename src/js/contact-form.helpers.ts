export interface ContactMailtoValues {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

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
