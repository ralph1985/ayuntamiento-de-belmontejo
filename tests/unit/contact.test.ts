import {
  getActiveSocialEntries,
  getPrimaryEmail,
  getPrimaryOffice,
  getPrimaryPhone,
} from '../../src/js/contact';
import type { ContactInfo } from '../../src/types/contact';
import { describe, expect, it } from 'vitest';

const makeContactInfo = (
  overrides: Partial<ContactInfo> = {}
): ContactInfo => ({
  entity: {
    name: 'Ayuntamiento de Prueba',
    domain: 'https://example.com',
  },
  contact: {
    phones: [
      {
        id: 'first-phone',
        label: 'Teléfono principal',
        display: '900 000 000',
        href: '+34900000000',
      },
      {
        id: 'primary-phone',
        label: 'Teléfono elegido',
        display: '901 000 000',
        href: '+34901000000',
        isPrimary: true,
      },
    ],
    emails: [
      {
        id: 'first-email',
        label: 'Primer correo',
        address: 'first@example.com',
      },
      {
        id: 'primary-email',
        label: 'Correo elegido',
        address: 'primary@example.com',
        isPrimary: true,
      },
    ],
  },
  offices: [
    {
      id: 'first-office',
      label: 'Primera oficina',
      street: 'C/ Primera, 1',
      locality: 'Prueba',
    },
    {
      id: 'primary-office',
      label: 'Oficina elegida',
      street: 'C/ Principal, 2',
      locality: 'Prueba',
      isPrimary: true,
    },
  ],
  social: {
    facebook: {
      label: 'Facebook',
      url: 'https://facebook.com/example',
    },
    instagram: {
      label: 'Instagram',
      url: 'https://instagram.com/example',
      isActive: false,
    },
    empty: {
      label: 'Sin enlace',
      url: '',
    },
  },
  ...overrides,
});

describe('contact data selectors', () => {
  it('selects an explicitly primary phone, email and office', () => {
    const info = makeContactInfo();

    expect(getPrimaryPhone(info)?.id).toBe('primary-phone');
    expect(getPrimaryEmail(info)?.id).toBe('primary-email');
    expect(getPrimaryOffice(info)?.id).toBe('primary-office');
  });

  it('falls back to the first item when no primary item is defined', () => {
    const info = makeContactInfo({
      contact: {
        phones: makeContactInfo().contact.phones.map(phone => ({
          ...phone,
          isPrimary: false,
        })),
        emails: makeContactInfo().contact.emails.map(email => ({
          ...email,
          isPrimary: false,
        })),
      },
      offices: makeContactInfo().offices.map(office => ({
        ...office,
        isPrimary: false,
      })),
    });

    expect(getPrimaryPhone(info)?.id).toBe('first-phone');
    expect(getPrimaryEmail(info)?.id).toBe('first-email');
    expect(getPrimaryOffice(info)?.id).toBe('first-office');
  });

  it('returns only active social entries with non-empty URLs', () => {
    expect(getActiveSocialEntries(makeContactInfo())).toEqual([
      [
        'facebook',
        {
          label: 'Facebook',
          url: 'https://facebook.com/example',
        },
      ],
    ]);
  });

  it('returns undefined for empty contact collections', () => {
    const info = makeContactInfo({
      contact: { phones: [], emails: [] },
      offices: [],
    });

    expect(getPrimaryPhone(info)).toBeUndefined();
    expect(getPrimaryEmail(info)).toBeUndefined();
    expect(getPrimaryOffice(info)).toBeUndefined();
  });
});
