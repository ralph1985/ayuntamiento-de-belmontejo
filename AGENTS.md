# Repository Guidelines

## Project Structure & Module Organization

The Astro site lives in `src/`. Place routed pages in `src/pages`, reusable UI in `src/components`, shared wrappers in `src/layouts`, and editorial collections in `src/content`. Static assets belong in `public/`. Automation scripts sit in `scripts/`—`fetch-bandos.js` refreshes municipal notices. Build output is written to `dist/`; never commit generated files.

## Build, Test, and Development Commands

- `pnpm run dev` / `pnpm run start`: Launch the Astro dev server with hot reload.
- `pnpm run build`: Produce the optimized static build used by Vercel.
- `pnpm run preview`: Serve the last build locally for pre-deploy smoke checks.
- `pnpm run fetch-bandos`: Pull the latest bandos before committing related content.
- `pnpm run lint` / `pnpm run lint:fix`: Run ESLint (Astro + TypeScript rules) and optionally autofix violations.
- `pnpm run format` / `pnpm run format:write`: Verify or apply Prettier formatting.
- `pnpm run test:e2e`: Build the site and execute the active Playwright functional flows (run `pnpm exec playwright install` once per machine).

## Coding Style & Naming Conventions

Prefer TypeScript modules and Astro components. Keep files and exports in PascalCase for components (`MunicipalNoticeCard.astro`) and kebab-case for routes (`bandos.astro`). Prettier controls formatting—2-space indentation, trailing commas, semicolons. ESLint enforces `prefer-const`, bans `var`, flags unused variables (prefix intentional unused args with `_`). Accessibility rules from `eslint-plugin-jsx-a11y` must pass before review.
When adding dependencies, pin versions exactly and avoid caret ranges (no `^`).

## Testing Guidelines

End-to-end specs live under `tests/e2e`. The active suite covers functional flows; visual regression specs and snapshots are retained but ignored until they are intentionally re-enabled with refreshed baselines. Target full green Playwright runs before opening a PR.

## Commit & Pull Request Guidelines

The repo follows Conventional Commits (`feat:`, `fix:`, `test:`). Write present-tense summaries and scope prefixes when relevant (e.g., `feat(home): add hero banner`). Commit messages must be in English. For pull requests, include: purpose summary, linked Jira/GitHub issue, test evidence (`pnpm run lint`, `pnpm run test:e2e` output), and screenshots or snapshot diffs for UI work. Flag environment or CMS schema changes explicitly so reviewers can coordinate deployments.

## Security & Configuration Notes

Store secrets in `.env` (see `README.md` for required keys). Do not commit `.env` or Playwright artifacts containing credentials.
