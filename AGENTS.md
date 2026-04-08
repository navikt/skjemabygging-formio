# AGENTS.md

Keep only repo-wide guidance here that helps avoid confusion across the codebase.
More specific, advanced, or workflow/package-specific guidance belongs in skills under `.github/skills/`.

## Package direction

- Put shared backend utilities and external service integrations in `packages/shared-backend`. New external services in `bygger-backend` and `fyllut-backend` are deprecated.
- Prefer shared frontend code in the shared frontend package when adding new shared UI or frontend services.
- Treat `packages/shared-components` as legacy/deprecated unless there is a clear reason to extend it.

## Language and naming

- Use English in all new code.
- Existing Norwegian names may remain in legacy code, but avoid introducing new mixed-language naming. New code should map external domain terms to English.

## Code style

- Keep code DRY. Reuse or extract shared logic instead of duplicating it.
- Avoid large files when practical. Prefer splitting code by responsibility before files become hard to navigate.
- Prefer arrow functions over `function` declarations in new code.
- Prefer exports at end of file

## Testing

- Use the test framework only for isolated non-UI logic (for example shared utilities, mappers, validation, and domain/backend logic).
- Use Cypress for UI behavior and end-to-end flows.
- `@testing-library` UI tests in this repository are considered legacy/outdated.
- Do not add new `@testing-library` UI behavior tests, and do not expand existing ones.
- When touching UI behavior currently covered by legacy `@testing-library` tests, prefer replacing/migrating them to Cypress instead of extending them.

## Planning

- When creating or updating implementation plan documents for this repository, always use `@.github/agents/planner.agent.md`.

## Starting dev servers (sub-agents)

Use `pnpm start:fyllut:mocks` or `pnpm start:bygger:mocks` — see the `start-dev-servers` skill for the full pattern.
