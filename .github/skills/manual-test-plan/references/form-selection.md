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
node bin/forms-api/inspect-preprod-forms.mjs \
  --query '<title-or-form-number>'

node bin/forms-api/inspect-preprod-forms.mjs \
  --path '<form-path>'
```

If either inspection fails to access Forms API, follow the proxy and token
troubleshooting in
[forms-api-import.md](forms-api-import.md). Do not choose a replacement form
based on a failed lookup.

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
- Use a unique form number starting with `MANUALTEST-`, followed by uppercase
  letters, numbers, or hyphens, up to 20 characters total. Bygger limits form
  numbers to 20 characters. Import and cleanup reject other numbers. This makes
  leftover manual test forms identifiable without changing Bygger's behavior
  with `properties.isTestForm`.
- Enable only required submission methods.
- Set `clearOnHide` on scenario-controlled pages.
- Prefer one selector-driven form when related scenarios share a domain and the
  conditional form remains valid, organized, and easy to understand.
- Use separate forms when conditions would change component semantics, leave
  stale data, make validation unreliable, or obscure the expected mapping.

The `ts-node` executable belongs to the `mocks` package, not the repository
root. Run a small TypeScript generator with that package's installed runner
and TypeScript configuration, from the repository root:

```bash
pnpm --dir mocks exec ts-node \
  --project tsconfig.json \
  --transpile-only \
  --compiler-options '{"ignoreDeprecations":"6.0"}' \
  mocks/<generator.ts>
```

Put the temporary generator in `mocks/mocks/`. Its path in the command is
relative to `mocks/`, since `--dir mocks` changes the working directory.
Keep generated JSON in the session artifact directory and remove the
generator after use. Do not use `pnpm dlx` or download another runner for
this task.

Validate:

1. JSON parses and required form fields exist.
2. Component keys are unique where required.
3. Conditional pages expose the intended components.
4. Hidden scenario data clears.
5. Shared-domain resolution or mapper behavior produces the intended result.
6. The form can be fetched after import before testing FyllUt.

Map each case's scenario choices against the exact form revision and
conditional rules using
[route-source-mapping.md](route-source-mapping.md). For generated forms,
check the exact JSON and exercise its branches in the local renderer
before import, then confirm the imported revision in preprod before
publication. Check conditional visibility, required fields, relevant
identity or party mapping, and submission settings. Schema validity and
an import dry run do not establish behavior. Record the route per case
in `testCases[].journeyCheck`, so branches of one form can have different
statuses. A matching Cypress flow can support shared navigation, but
cannot prove that a different form's panels appear in preprod. Turn an
unresolved runtime-dependent transition into a concrete observation
task for the tester, not a requirement to run Cypress in cplt. An HTTP
200 on the form URL or Forms API metadata does not prove a complete journey.

For `DIGITAL_NO_LOGIN`, use
[digital-no-login-journey.md](digital-no-login-journey.md) to map the
shared ID upload and introduction against the form's settings. Record
intervening pages from this form's conditional definition, not another
form's panel order.

Before import, tell the caller:

- which existing forms will be used unchanged
- which production forms will be imported or refreshed
- which test forms will be created or updated
- which test cases each form covers

Wait for confirmation before changing Forms API.
