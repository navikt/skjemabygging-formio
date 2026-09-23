# Selecting and creating forms

## Production forms

Prefer a production form when it already contains the relevant components,
conditions, submission methods, and legacy or modern data shape.

First inspect published definitions in `navikt/skjemautfylling-formio` or
production Forms API metadata. Then check whether each candidate already exists
in preprod Forms API and inspect its current revision. A preprod form can differ
from the production snapshot.

Use the helper without exposing the token or full form definition:

```bash
node .github/skills/manual-test-plan/scripts/inspect-preprod-forms.mjs \
  --query '<title-or-form-number>'

node .github/skills/manual-test-plan/scripts/inspect-preprod-forms.mjs \
  --path '<form-path>'
```

If it returns `401`, follow the token refresh and retry procedure in
[forms-api-import.md](forms-api-import.md).

Record:

- form number, path, and title
- why the form covers the case
- required branch choices
- supported submission methods
- whether preprod must import or refresh the form

Production imports overwrite the shared preprod draft. Warn the caller and ask
before importing through Bygger. Remember that `preprod` and `preprod-alt` use
the same Forms API instance.

## Generated forms

Generate a form only when no suitable form already exists in preprod or a small
test form makes the changed behavior substantially easier to isolate.

- Build it from helpers in `mocks/mocks/form-builder`.
- Keep fields and pages to the minimum needed.
- Use a unique test form number and set `properties.isTestForm` to `true`.
- Enable only required submission methods.
- Set `clearOnHide` on scenario-controlled pages.
- Prefer one selector-driven form when related scenarios share a domain and the
  conditional form remains valid, organized, and easy to understand.
- Use separate forms when conditions would change component semantics, leave
  stale data, make validation unreliable, or obscure the expected mapping.

When a small TypeScript generator imports the repository form-builder helpers,
run it with the repository's current TypeScript compatibility options:

```bash
pnpm exec ts-node \
  --transpile-only \
  --compiler-options '{"ignoreDeprecations":"6.0"}' \
  <generator.ts>
```

Validate:

1. JSON parses and required form fields exist.
2. Component keys are unique where required.
3. Conditional pages expose the intended components.
4. Hidden scenario data clears.
5. Shared-domain resolution or mapper behavior produces the intended result.
6. The form can be fetched after import before testing FyllUt.

Before import, tell the caller:

- which existing forms will be used unchanged
- which production forms will be imported or refreshed
- which test forms will be created or updated
- which test cases each form covers

Wait for confirmation before changing Forms API.
