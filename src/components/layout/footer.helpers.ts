export interface FooterService {
  title: string;
  url?: string | null;
  isExternal?: boolean;
  isActive?: boolean;
}

export interface FooterServiceLinkResolution {
  isLink: boolean;
  target?: '_blank';
  rel?: 'noopener noreferrer';
}

export const resolveFooterServiceLink = (
  service: FooterService
): FooterServiceLinkResolution => {
  const isLink = Boolean(service.isActive && service.url);

  if (!isLink) {
    return { isLink };
  }

  if (service.isExternal) {
    return {
      isLink,
      target: '_blank',
      rel: 'noopener noreferrer',
    };
  }

  return { isLink };
};
