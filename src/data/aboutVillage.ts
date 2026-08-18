export interface AboutVillageImage {
  desktopSrc: string;
  mobileSrc: string;
  alt: string;
  credit?: string;
  creditHref?: string;
}

export interface AboutVillageFeature {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  body: string;
  image: AboutVillageImage;
  credit?: string;
  creditHref?: string;
}

export interface AboutVillageContent {
  pageTitle: string;
  pageDescription: string;
  landingTitle: string;
  landingIntro: string;
  overviewEyebrow: string;
  overviewTitle: string;
  overviewDescription: string;
  historyTitle: string;
  historyParagraphs: string[];
  features: AboutVillageFeature[];
  overviewImages: AboutVillageImage[];
  quote: string;
  quoteAuthor: string;
  quoteRole: string;
  videoEyebrow: string;
  videoTitle: string;
  videoDescription: string;
  videoUrl: string;
  videoTitleAttribute: string;
  mapSubtitle: string;
  mapTitle: string;
  mapDescription: string;
}

import aboutVillageData from './aboutVillage.json';

export const aboutVillage: AboutVillageContent = aboutVillageData;
