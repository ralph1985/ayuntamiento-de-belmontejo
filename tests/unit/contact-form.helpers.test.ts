import { buildContactMailto } from '../../src/js/contact-form.helpers';
import { describe, expect, it } from 'vitest';

describe('buildContactMailto', () => {
  it('encodes the subject and body while preserving the recipient', () => {
    const mailto = buildContactMailto('alcaldia@belmontejo.es', {
      name: 'Ana García',
      email: 'ana@example.com',
      phone: '',
      subject: 'Consulta: obras',
      message: 'Primera línea\nSegunda línea',
    });

    expect(mailto).toBe(
      'mailto:alcaldia@belmontejo.es?subject=Contacto%20web%3A%20Consulta%3A%20obras&body=Nombre%3A%20Ana%20Garc%C3%ADa%0ACorreo%20electr%C3%B3nico%3A%20ana%40example.com%0ATel%C3%A9fono%3A%20No%20indicado%0A%0APrimera%20l%C3%ADnea%0ASegunda%20l%C3%ADnea'
    );
  });

  it('normalizes carriage returns and encodes special characters', () => {
    const mailto = buildContactMailto('alcaldia@belmontejo.es', {
      name: 'Nombre',
      email: 'correo@example.com',
      phone: '+34 969 296 279',
      subject: 'Asunto & prueba',
      message: 'Texto\r\ncon símbolos: % y #',
    });

    expect(mailto).toContain(
      'subject=Contacto%20web%3A%20Asunto%20%26%20prueba'
    );
    expect(mailto).toContain(
      'body=Nombre%3A%20Nombre%0ACorreo%20electr%C3%B3nico%3A%20correo%40example.com%0ATel%C3%A9fono%3A%20%2B34%20969%20296%20279%0A%0ATexto%0Acon%20s%C3%ADmbolos%3A%20%25%20y%20%23'
    );
  });
});
