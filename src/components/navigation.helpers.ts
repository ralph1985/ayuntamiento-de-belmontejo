export interface NavigationChild {
  key: string;
  url: string;
}

export interface NavigationEntry {
  key: string;
  url: string;
  isAdmin?: boolean;
  children?: NavigationChild[];
}

export const filterNavigationEntries = (
  entries: NavigationEntry[],
  showAdminMenu: boolean
) =>
  entries.filter(entry => {
    if (entry.isAdmin) {
      return showAdminMenu;
    }

    return true;
  });

export const isActiveNavigationLink = (
  url: string | undefined,
  currentPathname: string
) => {
  if (!url) {
    return false;
  }

  if (url === '/') {
    return currentPathname === url;
  }

  return currentPathname.startsWith(url);
};
