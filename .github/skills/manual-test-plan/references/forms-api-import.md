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

Always inspect the operation first:

```bash
node .github/skills/manual-test-plan/scripts/import-form.mjs \
  --form <form.json>
```

The command reports whether it will create or update, the Forms API path, and
the current revision. It does not modify Forms API.

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
