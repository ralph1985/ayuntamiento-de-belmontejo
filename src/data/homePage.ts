import type { IconBulletItem } from '@types/content';
import homePageData from './homePage.json';

export interface HomeHeroContent {
  eyebrow: string;
  title: string;
  summary: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  desktopImage: string;
  mobileImage: string;
}

export interface VillageStoryContent {
  eyebrow: string;
  title: string;
  description: string;
  body: string;
  image: string;
  imageAlt: string;
  buttonLabel: string;
  buttonHref: string;
}

export interface HomeSectionHeading {
  eyebrow: string;
  title: string;
  description: string;
}

export interface HomeUpdatesContent extends HomeSectionHeading {
  buttonLabel: string;
  buttonHref: string;
}

export interface HomeCtaContent {
  title: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
  imageAlt: string;
}

export interface HomePageContent {
  pageTitle: string;
  pageDescription: string;
  hero: HomeHeroContent;
  services: IconBulletItem[];
  villageStory: VillageStoryContent;
  updates: HomeUpdatesContent;
  community: HomeSectionHeading;
  cta: HomeCtaContent;
}

export const homePage: HomePageContent = homePageData;
