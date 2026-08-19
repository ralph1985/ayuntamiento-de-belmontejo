import { describe, expect, it } from 'vitest';
import {
  resolveFooterServiceLink,
  type FooterService,
} from '../../src/components/layout/footer.helpers';

describe('resolveFooterServiceLink', () => {
  const baseService: FooterService = {
    title: 'Sede Electrónica',
    url: 'https://example.com',
    isActive: true,
  };

  it('marks active external services as links with external attributes', () => {
    const result = resolveFooterServiceLink({
      ...baseService,
      isExternal: true,
    });

    expect(result).toStrictEqual({
      isLink: true,
      target: '_blank',
      rel: 'noopener noreferrer',
    });
  });

  it('keeps internal links without external attributes', () => {
    const result = resolveFooterServiceLink({
      ...baseService,
      isExternal: false,
    });

    expect(result).toStrictEqual({ isLink: true });
  });

  it('treats inactive services as plain text', () => {
    const result = resolveFooterServiceLink({
      ...baseService,
      isActive: false,
    });

    expect(result).toStrictEqual({ isLink: false });
  });

  it('treats services without url as plain text', () => {
    const result = resolveFooterServiceLink({
      ...baseService,
      url: '',
    });

    expect(result).toStrictEqual({ isLink: false });
  });
});
