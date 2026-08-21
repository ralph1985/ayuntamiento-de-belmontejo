export interface ProjectFact {
  label: string;
  value: string;
}

export interface Project {
  slug: string;
  number: string;
  date: string;
  title: string;
  pageDescription: string;
  landingIntro: string;
  summary: string;
  eyebrow: string;
  detailTitle: string;
  detailDescription: string;
  imageSrc: string;
  imageAlt: string;
  facts: ProjectFact[];
  sourceHref: string;
  sourceLabel: string;
}

import projectData from './projects.json';

export const projects: Project[] = [...projectData.projects].sort((a, b) =>
  b.date.localeCompare(a.date)
);

export const getProjectBySlug = (slug: string) =>
  projects.find(project => project.slug === slug);
