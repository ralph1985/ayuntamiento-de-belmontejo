// @vitest-environment jsdom

import {
  buildContactMailto,
  extractFormValues,
  getStatusMessage,
  mountCharacterCounter,
  setFieldError,
  updateStatus,
  validateFormValues,
} from '../../src/js/contact-form.helpers';
import { fireEvent, getByLabelText } from '@testing-library/dom';
import { describe, expect, it } from 'vitest';

const limits = {
  name: 120,
  email: 160,
  phone: 60,
  subject: 150,
  message: 1000,
};

const validValues = {
  name: 'Ana García',
  email: 'ana@example.com',
  phone: '',
  subject: 'Consulta',
  message: 'Necesito información.',
};

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

describe('validateFormValues', () => {
  it('accepts a complete form with email contact', () => {
    expect(validateFormValues(validValues, limits)).toEqual({ success: true });
  });

  it('accepts a phone-only contact when the email is empty', () => {
    expect(
      validateFormValues(
        { ...validValues, email: '', phone: '+34 969 296 279' },
        limits
      )
    ).toEqual({ success: true });
  });

  it('reports required contact, subject and message fields', () => {
    const result = validateFormValues(
      { name: '', email: '', phone: '', subject: '', message: '' },
      limits
    );

    expect(result).toMatchObject({ success: false });
    if (result.success) return;

    expect(result.errors.map(error => error.field)).toEqual([
      'name',
      'email',
      'phone',
      'subject',
      'message',
    ]);
  });

  it('rejects malformed email and values over their limits', () => {
    const result = validateFormValues(
      {
        ...validValues,
        email: 'correo-invalido',
        name: 'A'.repeat(limits.name + 1),
        message: 'M'.repeat(limits.message + 1),
      },
      limits
    );

    expect(result).toMatchObject({ success: false });
    if (result.success) return;

    expect(result.errors).toEqual(
      expect.arrayContaining([
        {
          field: 'name',
          message: 'El nombre no puede superar los 120 caracteres.',
        },
        { field: 'email', message: 'Correo electrónico inválido.' },
        {
          field: 'message',
          message: 'El mensaje no puede superar los 1000 caracteres.',
        },
      ])
    );
  });
});

describe('contact form DOM helpers', () => {
  it('extracts trimmed values from the rendered form', () => {
    document.body.innerHTML = `
      <form id="contact-form">
        <label>Nombre <input name="name" value="  Ana García  " /></label>
        <label>Correo electrónico <input name="email" value=" ana@example.com " /></label>
        <label>Teléfono <input name="phone" value="" /></label>
        <label>Asunto <input name="subject" value=" Consulta " /></label>
        <label>Mensaje <textarea name="message"> Texto </textarea></label>
      </form>
    `;

    const form = document.getElementById('contact-form') as HTMLFormElement;

    expect(extractFormValues(form)).toEqual({
      name: 'Ana García',
      email: 'ana@example.com',
      phone: '',
      subject: 'Consulta',
      message: 'Texto',
    });
  });

  it('updates the character counter after input', () => {
    document.body.innerHTML = `
      <label>Mensaje <textarea id="message" data-message-field></textarea></label>
      <span data-char-counter></span>
    `;
    const field = getByLabelText(
      document.body,
      'Mensaje'
    ) as HTMLTextAreaElement;
    const counter = document.querySelector(
      '[data-char-counter]'
    ) as HTMLElement;

    mountCharacterCounter(field, counter, 10);
    expect(counter.textContent).toBe('10 caracteres restantes');

    field.value = 'hola';
    fireEvent.input(field);
    expect(counter.textContent).toBe('6 caracteres restantes');
  });

  it('sets and clears accessible field errors', () => {
    document.body.innerHTML = `
      <form>
        <label>Nombre <input data-field-input="name" /></label>
        <span data-field-error="name"></span>
      </form>
    `;
    const form = document.querySelector('form') as HTMLFormElement;
    const input = getByLabelText(document.body, 'Nombre') as HTMLInputElement;
    const error = document.querySelector(
      '[data-field-error="name"]'
    ) as HTMLElement;

    setFieldError(form, 'name', 'El nombre es obligatorio.');
    expect(error.textContent).toBe('El nombre es obligatorio.');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.classList.contains('is-invalid')).toBe(true);

    setFieldError(form, 'name');
    expect(error.textContent).toBe('');
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(input.classList.contains('is-invalid')).toBe(false);
  });

  it('uses default and custom status messages', () => {
    expect(getStatusMessage('pending')).toBe('Enviando tu mensaje...');
    expect(getStatusMessage('idle')).toBe('');

    const status = document.createElement('p');
    updateStatus(status, 'success');
    expect(status.dataset.status).toBe('success');
    expect(status.textContent).toContain('Hemos recibido');

    updateStatus(status, 'error', 'Mensaje personalizado.');
    expect(status.textContent).toBe('Mensaje personalizado.');
  });
});
