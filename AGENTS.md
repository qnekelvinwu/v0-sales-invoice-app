# AGENTS.md

## Cursor Cloud specific instructions

This is a Next.js 16 (App Router) sales invoice app that proxies to the QNE Cloud Accounting API (`openapi.account.qne.cloud`). There is no database, Docker, or backend service — just the Next.js dev server.

### Running the app

- `pnpm dev` starts the dev server on `localhost:3000`.
- The home page (`/`) redirects to `/login` if unauthenticated.
- Authentication requires valid QNE Cloud credentials or a JWT token via `?token=` URL parameter.

### Known issues

- `pnpm lint` fails because `eslint` is not listed as a dependency in `package.json`. The lint script (`eslint .`) references it but the package is missing from `devDependencies`.
- `pnpm build` passes with `typescript.ignoreBuildErrors: true` set in `next.config.mjs`.
- `sharp` build scripts are ignored by pnpm (optional image optimization dep); this is harmless.

### Commands reference

| Task | Command |
|------|---------|
| Install deps | `pnpm install` |
| Dev server | `pnpm dev` |
| Build | `pnpm build` |
| Lint | `pnpm lint` (currently broken — see above) |
