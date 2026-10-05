# Selecting and creating forms

## Production forms

Prefer a production form when it already contains the relevant components,
conditions, submission methods, and legacy or modern data shape.

The production definition is the reference. A preprod copy of a production form
can be outdated or carry someone's unpublished draft, so never judge suitability
or write a route from the preprod variant when it differs from production.

1. Inspect the published production definition in `navikt/skjemautfylling-formio`
   or production Forms API metadata, and decide whether it covers the case.
2. Check whether the form exists in preprod Forms API and inspect its current
   revision. Also search preprod for forms that have no production variant,
   such as earlier `MANUALTEST-` forms, that already cover the case. Use the helper without exposing the token or full form definition:

    ```bash
    node bin/forms-api/inspect-preprod-forms.mjs \
      --query '<title-or-form-number>'

    node bin/forms-api/inspect-preprod-forms.mjs \
      --path '<form-path>'
    ```

    If an inspection fails to access Forms API, follow the proxy and token
    troubleshooting in the Forms API import rules (loaded in workflow step 9).
    Do not choose a replacement form based on a failed lookup.

3. For a form that exists in production, compare the preprod definition with it (title, components,
   conditionals, properties, submission methods, introduction page).
    - **Production form suitable and preprod differs or is missing:** bring
      preprod in line with production by importing it. Do not test against the
      differing preprod variant.
    - **Production form not suitable:** create a `MANUALTEST-` form as described
      below. Do not rely on the preprod version of a production form that may be
      outdated.
    - **Form exists only in preprod:** it has no production variant, so the
      preprod definition is the reference. A previously generated `MANUALTEST-`
      form or another test form there can be suitable. Inspect its current
      definition and revision, reuse it when it covers the case, and record the
      revision. If it almost fits, change it only through the approved UPDATE
      workflow (loaded in workflow step 9); otherwise generate
      a new one. Note that anyone can edit a preprod form, so read it back
      again before each test session.

Importing a production form is simple but the skill cannot run it: it needs the
user's Bygger session. Ask the caller to open Bygger in the selected
environment, choose Admin > "Importer skjema fra produksjon"
(`/import/skjema`), select the form paths, and press "Importer". The import
overwrites the shared preprod draft with the production title, components,
properties, introduction page, and form translations, and removes preprod form
translations that production lacks. `preprod` and `preprod-alt` share one Forms
API, so the overwrite affects both and discards any unpublished preprod edits.
Name the forms and this effect, and wait for the caller's confirmation that the
import ran. Then read the form back with the helper and check that it matches
production before mapping routes. The test-form import script accepts only
`MANUALTEST-` numbers; do not use it to modify production forms.

Record:

- form number, path, and title
- why the form covers the case
- required branch choices
- supported submission methods
- whether the form was imported from production, and the revision read back

Use the form number returned by Forms API as `forms[].skjemanummer` and the
stored path as `forms[].path`. The rendered form-number link uses that path
on the selected PR deployment's intern ingress. These values can differ,
particularly for generated forms. A form's presence in the shared Forms API
does not prove it works on both deployments.

## Generated forms

Generate a form only when no suitable form already exists in preprod or a small
test form makes the changed behavior substantially easier to isolate.

- Use the existing helpers in `mocks/mocks/form-builder` as read-only
  references. Keep the generated definition and any temporary generator in
  the session artifact directory, not the repository.
- Keep fields and pages to the minimum needed.
- Use a unique form number starting with `MANUALTEST-`, followed by uppercase
  letters, numbers, or hyphens, up to 20 characters total. Bygger limits form
  numbers to 20 characters. Import following the Forms API import rules
  (loaded in workflow step 9) after validating the definition.
  Never replace an existing form without explicit user approval.
- Enable only required submission methods.
- Set `clearOnHide` on scenario-controlled pages.
- Prefer one selector-driven form when related scenarios share a domain and the
  conditional form remains valid, organized, and easy to understand.
- Use separate forms when conditions would change component semantics, leave
  stale data, make validation unreliable, or obscure the expected mapping.

The `ts-node` executable belongs to the `mocks` package, not the repository
root. Keep any generator in the session artifact directory, outside the
repository. Run it with the package's installed runner and TypeScript
configuration:

```bash
pnpm --dir mocks exec ts-node \
  --project tsconfig.json \
  --transpile-only \
  --compiler-options '{"ignoreDeprecations":"6.0"}' \
  <absolute-session-artifact-directory>/<generator.ts>
```

Use absolute paths for imports of `mocks/mocks/form-builder` from outside
the repository. If the runner cannot resolve the helpers from the session
directory, hand off the generator as an artifact instead of editing the
repository to make it work. Do not use `pnpm dlx` or download another runner
for this task.

Validate:

1. JSON parses and required form fields exist.
2. Component keys are unique where required.
3. Conditional pages expose the intended components.
4. Hidden scenario data clears.
5. Shared-domain resolution or mapper behavior produces the intended result.
6. After import, the form can be fetched before testing FyllUt.

For generated forms, check the exact JSON and exercise its branches in the
local renderer before importing. Then read back the stored path, revision,
components, submission methods, and conditional choices in preprod before
sharing the plan. Check conditional visibility, required fields, relevant
identity or party mapping, and submission settings; schema validity alone does
not establish behavior. Map each case's route with the route-mapping rules
(loaded in workflow step 10), including the
`DIGITAL_NO_LOGIN` section, and record it per case in
`testCases[].journeyCheck`, so branches of one form can have different
statuses. An HTTP 200 on the form URL or Forms API metadata does not prove a
complete journey.

Before creating a form or asking the caller to import one, tell them:

- which existing forms will be used unchanged
- which production forms the caller must import into preprod
- which test forms will be created or updated
- which test cases each form covers

For test forms, use the guarded CREATE or explicitly approved UPDATE workflow.
Wait for the caller to confirm a requested production import. In both cases
read the form back before claiming that its route is verified.
