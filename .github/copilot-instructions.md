# Ayuntamiento de Belmontejo - AI Coding Instructions

## Project Overview

This is an Astro-based municipal website for Belmontejo town hall, featuring automated content management via Decap CMS and RSS integration for official announcements (bandos).

## Architecture Essentials

### Content Management Strategy

- **Decap CMS** (`/public/admin/config.yml`) manages two main content types:
  - `noticias` (news) - manually created via CMS
  - `bandos` (official announcements) - auto-synced from RSS + manual CMS entries
- **Content Collections** (`src/content.config.ts`) use Astro's glob loader pattern with image optimization
- **RSS Automation** (`scripts/fetch-bandos.js`) fetches from BandoMovil API and generates markdown files

### Environment-Driven Features

- Admin panel controlled by `PUBLIC_ADMIN_MENU=true` env var
- GitHub OAuth integration for CMS auth (`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`)
- Branch-specific deployments: `main` (production) and `develop` (staging)

### Styling Architecture

- **LESS preprocessor** with modular structure in `src/styles/`:
  - `root.less` - global variables and base styles
  - `dark.less` - dark mode support
  - `markdown.less` - content styling for CMS posts
  - `sidebar.less` - shared sidebar components
- Import paths use `@styles/` alias (configured in `tsconfig.json`)

## Key Workflows

### Content Development

```bash
npm run fetch-bandos  # Sync official announcements from RSS
npm run dev           # Local development with HMR
```

### Code Quality

```bash
npm run lint          # ESLint for .js/.ts/.astro files
npm run format:write  # Prettier formatting
```

### Deployment

- **Vercel** serverless deployment with conditional builds
- Only `main` and `develop` branches trigger deployments (`vercel.json`)
- Content changes in CMS trigger rebuilds via webhook

## Component Patterns

### Layout Hierarchy

- `BaseLayout.astro` - main template with meta tags, View Transitions
- `NewsPostLayout.astro` / `BandoPostLayout.astro` - content-specific layouts
- Sidebar layouts for listing pages with featured content

### Data Sources

- `src/data/client.json` - site-wide configuration (contact, social media)
- `src/data/navData.json` - navigation structure
- Content collections via `getCollection()` for dynamic pages

### Image Handling

- Store in `src/assets/images/` for Astro optimization
- Decap CMS uploads to collection-specific folders (`noticias/`, `bandos/`)
- Use Astro's `<Image />` component with content collection schema

## Critical Integration Points

### Decap CMS Configuration

- Editorial workflow enabled for content approval
- Spanish locale (`locale: 'es'`)
- Auto-commit messages with author attribution
- Collection schemas must match `content.config.ts` exactly

### RSS Content Sync

- Parses XML from BandoMovil service
- Generates frontmatter with required fields (`guid`, `link`, `category`)
- Filename sanitization for URL-safe slugs
- Preserves existing manual content

### SEO & Meta

- Dynamic canonical URLs using `client.json` domain
- Preloaded images for social media cards
- Sitemap generation excluding `/admin` routes

## Development Notes

- Use `@` path aliases for imports (`@components/`, `@data/`, `@styles/`)
- LESS variables defined in `root.less` for consistent theming
- View Transitions enabled for SPA-like navigation
- TypeScript throughout with strict content collection schemas
