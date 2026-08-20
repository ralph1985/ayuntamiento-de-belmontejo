import type { ImageMetadata } from 'astro';

type StaticContentImage = {
  avif: string;
  webp: string;
  fallback: string;
  thumb: string;
};

const getImageBaseName = (image: ImageMetadata) => {
  const source = image.fsPath ?? image.src;
  if (!source) return '';
  const fileName = source.split('/').pop() ?? '';
  return fileName.replace(/\.[^.]+$/, '');
};

export const getStaticContentImage = (
  image?: ImageMetadata
): StaticContentImage | undefined => {
  if (!image) return undefined;

  const baseName = getImageBaseName(image);
  if (!baseName) return undefined;
  const basePath = `/assets/images/noticias/${baseName}-800`;

  return {
    avif: `${basePath}.avif`,
    webp: `${basePath}.webp`,
    fallback: `${basePath}.jpg`,
    thumb: `${basePath}-thumb.webp`,
  };
};
