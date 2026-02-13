# Copilot instructions for this Forge Hello-World app

Purpose: give AI coding agents the minimal, actionable context to be productive in this repo.

- **Project type:** Atlassian Forge app (UI Kit + resolvers). Key files: `src/frontend/index.jsx`, `src/resolvers/index.js`, `src/index.js`, `manifest.yml`.
- **Entry points:** `src/index.js` exports `handler` (resolver definitions). Frontend bootstraps in `src/frontend/index.jsx` using `@forge/react` and `@forge/bridge`.

- **Data flow & patterns:**
  - Backend resolvers are defined with `@forge/resolver` and exported as `handler` from `src/index.js`.
  - Frontend calls resolvers via `invoke('resolverName', payload)` from `@forge/bridge` (example: `invoke('getText', {...})` in `src/frontend/index.jsx`).
  - Resolver names are string keys (example: `getText`) and return values serialized across the boundary.

- **Important conventions (project-specific):**
  - Always use UI components from `@forge/react` (UI Kit). Do NOT import third-party React UI components — they will break Forge UI rendering.
  - Resolver functions live in `src/resolvers/*` and are exported via `resolver.getDefinitions()`; keep resolver side-effects minimal and use `.asUser()`/.asApp() as appropriate (see `AGENTS.md`).
  - `src/index.js` must export `{ handler }` — Forge loads this as the function entry.

- **Build / dev / deploy commands (as documented here):**
  - Local dev tunnel: `forge tunnel` (hot-reloads frontend/resolver calls; redeploy required when `manifest.yml` changes).
  - Deploy: `forge deploy` (use `--non-interactive` in CI flows).
  - Install: `forge install` (use `--non-interactive --site <site-url> --product <product-name> --environment <env>` for scripted installs).
  - Linting: `npm run lint` (defined in `package.json` as `eslint src/**/*`).

- **Patterns to follow when changing code:**
  - If adding a resolver: add it in `src/resolvers/index.js` (or a new resolver file imported there), then export through the existing `resolver` instance so `src/index.js` continues to export `handler`.
  - If adding UI views: modify `src/frontend/index.jsx` and only use components from `@forge/react` (example components list in `AGENTS.md`).
  - Update `package.json` dependencies and run the package manager locally after adding packages.

- **Files to check for context before editing:**
  - `manifest.yml` — required module declarations and scopes; changing scopes requires redeploy + reinstall.
  - `AGENTS.md` — project-specific agent conventions (security, CLI usage, UI Kit rules).
  - `README.md` — quick start and common Forge commands used by this repo.

- **Examples (copyable):**
  - Resolver (already present):
    - `src/resolvers/index.js` defines `getText` and exports `handler` via `resolver.getDefinitions()`.
  - Frontend invoke (already present):
    - `invoke('getText', { example: 'my-invoke-variable' }).then(setData)` in `src/frontend/index.jsx`.

- **When editing manifest or scopes:**
  - Run `forge lint` then `forge deploy`, then `forge install --upgrade` for installed sites.

- **What not to change without asking:**
  - Do not replace `@forge/react` UI components with standard React components.
  - Do not change the `src/index.js` export signature — Forge expects `{ handler }`.

If anything here is unclear or you'd like this expanded (example PR templates, testing steps, or `manifest.yml` guidance), tell me which area to expand.
