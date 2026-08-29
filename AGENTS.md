# AGENTS.md

Keep only repo-wide guidance here that helps avoid confusion across the codebase.
More specific, advanced, or workflow/package-specific guidance belongs in skills under `.github/skills/`.

## Language and naming

- Use English in all new code.
- Existing Norwegian names may remain in legacy code, but avoid introducing new mixed-language naming. New code should map external domain terms to English.

## Code style

- Keep code DRY. Reuse or extract shared logic instead of duplicating it.
- Avoid large files when practical. Prefer splitting code by responsibility before files become hard to navigate.
- Prefer arrow functions over `function` declarations in new code.
- Prefer exports at end of file

## Immutability

- Prefer immutable data. Build new values instead of mutating arguments,
  shared state, or already-returned objects.
- Do not use output parameters. A function that collects results must return
  them, not append to an array or object passed in by its caller.
- Mark shared contracts and their nested fields `readonly` when callers must
  not change them, instead of relying on a documented promise.
- Existing mutable code is legacy. Do not extend it; convert the parts you
  touch when the change stays reasonably scoped.

## Backend

ALWAYS invoke the `backend-development` skill before changing or reviewing
backend code. This includes server-side TypeScript, API routes, middleware,
services, external clients, authentication, backend configuration, logging,
metrics, and backend tests in `shared-backend`, `fyllut-backend`,
`bygger-backend`, `form-spec-api`, or another server package. Do not use the
file extension as the only signal.

The skill is the source of truth for backend package direction, API and error
handling defaults, specialist routing, observability, security, and backend
test choice.

## Frontend

ALWAYS invoke the `frontend-development` skill before changing or reviewing
frontend code. This includes `.tsx` and `.jsx` files, browser-facing `.ts` and
`.js`, styles, UI components, hooks, state, form behavior, validation, focus,
and Cypress UI tests. Do not use the file extension as the only signal.

The skill is the source of truth for frontend package direction, Aksel and
accessibility routing, form interaction defaults, and frontend test choice.

## Starting dev servers (sub-agents)

Use `pnpm start:fyllut:mocks` or `pnpm start:bygger:mocks` — see the `start-dev-servers` skill for the full pattern.
