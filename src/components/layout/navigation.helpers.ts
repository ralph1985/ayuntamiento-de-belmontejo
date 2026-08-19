export interface NavigationChild {
  key: string;
  url: string;
}

export interface NavigationEntry {
  key: string;
  url: string;
  children?: NavigationChild[];
}

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
