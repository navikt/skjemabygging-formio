# Preprod Forms API tools

These standalone operator scripts live outside the manual-test-plan skill and
do not run in the application. They target the Forms API shared by `preprod`
and `preprod-alt`. Run them from the repository root.

```bash
node bin/forms-api/inspect-preprod-forms.mjs --query '<form-number-or-title>'
node bin/forms-api/inspect-preprod-forms.mjs --path '<form-path>'
node bin/forms-api/import-form.mjs --form <generated-form.json>
```

The token comes from `FORMS_API_ACCESS_TOKEN` or
`packages/bygger-backend/.env`. Obtain it with `pnpm get-tokens forms-api`;
never put the token in a command argument or output. A `401` requires a new
token and another dry run before applying a change.

Import is a dry run unless invoked with
`--apply --confirm '<operation>'`. It accepts only generated form numbers
beginning with `MANUALTEST-` and refuses an existing number unless
`--replace-existing` is specified. Agree on a backup and restore plan before
replacing a form. These scripts never delete forms; generated forms stay in
the shared Forms API until a form owner removes them.

The manual-test-plan skill describes the full form-selection, token-refresh,
proxy, and approval workflow in
`.github/skills/manual-test-plan/references/forms-api-import.md`. Other tools
can call these scripts directly without invoking that skill.

Run their tests locally with `pnpm exec vitest run bin/forms-api/*.test.mjs`.
These tests are not part of CI.
