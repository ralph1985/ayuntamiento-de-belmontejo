import type { NavigationEntry } from './navigation.helpers';

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

export const filterFooterNavigationEntries = (
  entries: NavigationEntry[],
  showAdminMenu: boolean
) =>
  entries.filter(entry => {
    if (entry.isAdmin) {
      return showAdminMenu;
    }

    return true;
  });

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
