# Importing generated forms

Preprod and preprod-alt share `https://forms-api.intern.dev.nav.no`.

## Token

Use the repository token helper:

```bash
pnpm get-tokens forms-api
```

It directs the user to the approved OBO token generator and stores
`FORMS_API_ACCESS_TOKEN` in `packages/bygger-backend/.env`. Never read the token
into conversation output or pass it as a command-line argument.

The required audience is:

```text
dev-gcp:fyllut-sendinn:forms-api
```

The user needs the `SkjemabyggingPreprod` group.
The scripts resolve the default env file from the repository root, even when
the command runs from another directory. `--env-file` overrides it.

## Dry run

Always inspect the operation first. The script checks whether the form already
exists in the shared preprod Forms API:

```bash
node bin/forms-api/import-form.mjs \
  --form <form.json>
```

The command reports a new form's path. If the form number already exists, it
stops instead of overwriting shared preprod data. Inspect the existing form
before deciding whether to reuse it or explicitly replace it.
Only generated forms with numbers matching `MANUALTEST-<suffix>` can use this
helper. Import production forms through Bygger as described in
[form-selection.md](form-selection.md).

If a Forms API fetch, create, or update returns `401`, tell the caller that the
Forms API token has expired and must be refreshed. Run:

```bash
pnpm get-tokens forms-api
```

Wait for the caller to complete the login flow, then retry the failed operation
once. Never ask the caller to paste the token into chat, and do not inspect,
decode, or print it.

After refresh, always rerun the dry run. The operation may have changed while
the token was stale. Use the new confirmation value and ask for renewed
confirmation if the operation changed. If the retry also returns `401`, stop and
ask the caller to verify the `SkjemabyggingPreprod` group and Forms API audience.
Do not start another refresh loop.

The helper must not start the token workflow itself because it requires browser
login and an interactive token paste. The skill runs it as a separate step. Be
aware that an exported `FORMS_API_ACCESS_TOKEN` takes precedence over the value
written to `packages/bygger-backend/.env`.

## Proxy HTTP 403

If Forms API fails with a proxy-generated HTTP `403`, retry the same read-only
or confirmed command once without the shell proxy variables:

```bash
env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY <same-command>
```

Do not change repository proxy configuration. If the direct retry also fails,
stop and report the response instead of bypassing more network controls.

## Apply

Ask for explicit confirmation. Then copy the exact confirmation value printed
by the dry run:

```bash
node bin/forms-api/import-form.mjs \
  --form <form.json> \
  --apply \
  --confirm '<operation>'
```

The script uses `POST /v1/forms` for a new form. To replace an existing form,
first agree on the exact existing form, its contents, and a restore or retention
plan with the caller. Preserve a backup outside the public artifacts. Then run
the dry run with `--replace-existing` and confirm its operation separately.
The helper binds the current form contents, revision, and replacement payload
to the confirmation before using revision-aware `PUT /v1/forms/{path}`. It
does not rely on `properties.isTestForm` to decide whether a form is safe to
replace.

## Cleanup

Use cleanup only for generated forms that the plan explicitly marks for
deletion. Production forms imported into preprod need a separately agreed
restore procedure; never delete them as cleanup.

Dry run:

```bash
node bin/forms-api/cleanup-form.mjs \
  --plan <plan.json> --form-id <generated-form-id>
```

The helper requires an entry of kind `generated` and its local form artifact in
the plan. It also requires the `MANUALTEST-` prefix on both the artifact and the
current Forms API form. It compares the number and title to the current form and
binds the path, revision, and full current definition digest to confirmation.
The prefix is a safeguard, not proof of ownership; review the dry run before
deletion. The helper uses a revision-aware `DELETE` and checks for a subsequent
`404`.

Apply only after showing the caller the dry-run output and receiving the exact
confirmation:

```bash
node bin/forms-api/cleanup-form.mjs \
  --plan <plan.json> --form-id <generated-form-id> \
  --apply \
  --confirm '<operation>'
```
