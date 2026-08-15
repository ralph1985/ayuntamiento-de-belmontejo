export interface AboutVillageImage {
  desktopSrc: string;
  mobileSrc: string;
  alt: string;
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
