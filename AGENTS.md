# Repository Guidelines

## Project Structure & Module Organization
The Astro site lives in `src/`. Place routed pages in `src/pages`, reusable UI in `src/components`, shared wrappers in `src/layouts`, and Decap CMS collections in `src/content`. Static assets and the `/admin` panel belong in `public/`. Automation scripts sit in `scripts/`—`fetch-bandos.js` refreshes municipal notices. Build output is written to `dist/`; never commit generated files.

## Build, Test, and Development Commands
- `npm run dev` / `npm run start`: Launch the Astro dev server with hot reload.
- `npm run build`: Produce the optimized static build used by Vercel.
- `npm run preview`: Serve the last build locally for pre-deploy smoke checks.
- `npm run fetch-bandos`: Pull the latest bandos before committing related content.
- `npm run lint` / `npm run lint:fix`: Run ESLint (Astro + TypeScript rules) and optionally autofix violations.
- `npm run format` / `npm run format:write`: Verify or apply Prettier formatting.
- `npm run test:e2e`: Build the site and execute Playwright visual regression tests (run `npx playwright install` once per machine).

## Coding Style & Naming Conventions
Prefer TypeScript modules and Astro components. Keep files and exports in PascalCase for components (`MunicipalNoticeCard.astro`) and kebab-case for routes (`bandos.astro`). Prettier controls formatting—2-space indentation, trailing commas, semicolons. ESLint enforces `prefer-const`, bans `var`, flags unused variables (prefix intentional unused args with `_`). Accessibility rules from `eslint-plugin-jsx-a11y` must pass before review.

## Testing Guidelines
End-to-end specs live under `tests/e2e`. Tests should mirror navigation flows and verify key UI states via screenshots. Update snapshots only when a visual change is intentional: `npm run test:e2e -- --update-snapshots`. Commit updated artifacts in `tests/e2e/__screenshots__/` together with the code change. Target full green Playwright runs before opening a PR.

## Commit & Pull Request Guidelines
The repo follows Conventional Commits (`feat:`, `fix:`, `test:`). Write present-tense summaries and scope prefixes when relevant (e.g., `feat(home): add hero banner`). For pull requests, include: purpose summary, linked Jira/GitHub issue, test evidence (`npm run lint`, `npm run test:e2e` output), and screenshots or snapshot diffs for UI work. Flag environment or CMS schema changes explicitly so reviewers can coordinate deployments.

## Security & Configuration Notes
Store secrets in `.env` (see `README.md` for required keys). Do not commit `.env` or Playwright artifacts containing credentials. Local scripts fall back to mock OAuth secrets, but production requires valid `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` variables on Vercel. Review CMS admin exposure before enabling `PUBLIC_ADMIN_MENU=true`.
