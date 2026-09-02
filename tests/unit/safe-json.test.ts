import { describe, expect, it } from 'vitest';
import { serializeJsonForHtml } from '../../src/js/safe-json';

describe('serializeJsonForHtml', () => {
  it('escapes markup-significant characters inside inline JSON', () => {
    const serialized = serializeJsonForHtml({
      title: '</script><script>alert(1)</script>',
      ampersand: '&',
      separators: '\u2028\u2029',
    });

    expect(serialized).not.toContain('</script>');
    expect(serialized).toContain('\\u003C/script\\u003E');
    expect(serialized).toContain('\\u0026');
    expect(serialized).toContain('\\u2028\\u2029');
    expect(JSON.parse(serialized)).toEqual({
      title: '</script><script>alert(1)</script>',
      ampersand: '&',
      separators: '\u2028\u2029',
    });
  });
});
