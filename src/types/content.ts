export interface IconBulletItem {
  icon: string;
  iconAlt: string;
  title: string;
  description: string;
  iconWidth?: number;
  iconHeight?: number;
}

export interface GalleryImage {
  desktopSrc: string;
  mobileSrc?: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
}

export interface GalleryHeading {
  topper?: string;
  title?: string;
  description?: string;
}

export interface GalleryCta {
  href: string;
  label: string;
  ariaLabel?: string;
  variant?: 'ghost' | 'primary' | 'secondary';
}
