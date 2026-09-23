# Selecting and creating forms

## Production forms

Prefer a production form when it already contains the relevant components,
conditions, submission methods, and legacy or modern data shape.

Inspect published definitions in `navikt/skjemautfylling-formio` or production
Forms API metadata. Record:

- form number, path, and title
- why the form covers the case
- required branch choices
- supported submission methods
- whether preprod must import or refresh the form

Production imports overwrite the shared preprod draft. Warn the caller and ask
before importing through Bygger. Remember that `preprod` and `preprod-alt` use
the same Forms API instance.

## Generated forms

Generate a form only when no suitable production form exists or a small
synthetic form makes the changed behavior substantially easier to isolate.

- Build it from helpers in `mocks/mocks/form-builder`.
- Keep fields and pages to the minimum needed.
- Use a unique test form number and set `properties.isTestForm` to `true`.
- Enable only required submission methods.
- Set `clearOnHide` on scenario-controlled pages.
- Prefer one selector-driven form when related scenarios share a domain and the
  conditional form remains easy to understand.
- Use separate forms when conditions would change component semantics, leave
  stale data, make validation unreliable, or obscure the expected mapping.

Validate:

1. JSON parses and required form fields exist.
2. Component keys are unique where required.
3. Conditional pages expose the intended components.
4. Hidden scenario data clears.
5. Shared-domain resolution or mapper behavior produces the intended result.
6. The form can be fetched after import before testing FyllUt.
