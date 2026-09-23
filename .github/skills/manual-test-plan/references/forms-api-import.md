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

## Dry run

Always inspect the operation first. The script checks whether the form already
exists in the shared preprod Forms API:

```bash
node .github/skills/manual-test-plan/scripts/import-form.mjs \
  --form <form.json>
```

The command reports whether it will create or update, the Forms API path, and
the current revision. It does not modify Forms API.

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
node .github/skills/manual-test-plan/scripts/import-form.mjs \
  --form <form.json> \
  --apply \
  --confirm '<operation>'
```

The script uses `POST /v1/forms` for a new form and revision-aware
`PUT /v1/forms/{path}` for an existing form. A stale revision fails instead of
overwriting newer work.
