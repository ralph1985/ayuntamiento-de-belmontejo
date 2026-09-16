import { getStaticContentImage } from '../../src/data/contentImage';
import { describe, expect, it } from 'vitest';

describe('getStaticContentImage', () => {
  it('builds consistent responsive asset paths from a source file', () => {
    expect(
      getStaticContentImage({
        src: '/_astro/fiesta-de-verano.abc123.jpg',
        fsPath: '/workspace/fiesta-de-verano.jpg',
      } as never)
    ).toEqual({
      avif: '/assets/images/noticias/fiesta-de-verano-800.avif',
      webp: '/assets/images/noticias/fiesta-de-verano-800.webp',
      fallback: '/assets/images/noticias/fiesta-de-verano-800.jpg',
      thumb: '/assets/images/noticias/fiesta-de-verano-800-thumb.webp',
    });
  });

  it('returns undefined when no image or source filename is available', () => {
    expect(getStaticContentImage()).toBeUndefined();
    expect(
      getStaticContentImage({ src: '', fsPath: '' } as never)
    ).toBeUndefined();
  });
});
