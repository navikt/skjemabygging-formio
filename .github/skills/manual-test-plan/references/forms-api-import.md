# Preprod Forms API access and test-form imports

## Contents

- [Token and access](#token-and-access) — obtaining and troubleshooting the token
- [Dry run, create, and update](#dry-run-create-and-update) — the import-form.mjs workflow
- [Failed writes and readback](#failed-writes-and-readback)

`preprod` and `preprod-alt` share one Forms API instance. Treat production
forms as read-only sources; the user imports them into preprod through
Bygger as described in the form-selection rules (loaded in workflow step 9).
The skill may create a new `MANUALTEST-` form in preprod
after checking for an existing form and validating its local definition.
Updating a test form requires explicit user approval for the specific form
and change. Never delete a form or silently replace an existing one. Keep
generated JSON and any generator in the session artifact directory; do not
edit repository code, tests, the target issue, PR, or specification.

The commands below run `bin/forms-api/inspect-preprod-forms.mjs` and
`bin/forms-api/import-form.mjs` directly; see `bin/forms-api/README.md` only
if you need the scripts' full flag reference outside this workflow.

## Token and access

If Forms API access fails after the proxy check below, ask the user to run
the repository token helper separately:

```bash
pnpm get-tokens forms-api
```

It directs them to the approved OBO token generator and stores
`FORMS_API_ACCESS_TOKEN` in `packages/bygger-backend/.env`. Never read,
decode, print, or request the token in chat. The required audience is
`dev-gcp:fyllut-sendinn:forms-api`, and the user needs the
`SkjemabyggingPreprod` group. An exported `FORMS_API_ACCESS_TOKEN` takes
precedence over the env file.

An HTTP `401` from Forms API indicates an authentication failure.
`Proxy response (403) !== 200 when HTTP Tunneling` comes from the proxy,
not Forms API. For a failed read, retry the same command once without
the proxy environment variables:

```bash
env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY \
  -u http_proxy -u https_proxy -u all_proxy \
  -u NODE_USE_ENV_PROXY <same-read-command>
```

Do not change repository proxy settings. If the read still fails, tell the
user what failed and use `ask_user` to request a token refresh without
claiming expiry unless Forms API returned `401`. Wait for confirmation and
retry the read once; if it still fails, stop and report the error. For
persistent `401` or authorization `403`, ask the user to check group and
audience. Never treat a failed lookup as proof that a form is absent.

## Dry run, create, and update

Inspect Forms API first. Validate the session-local form JSON, including
the `MANUALTEST-` number, components, properties, submission methods, and
conditional choices. Then run the import script in its default dry-run
mode:

```bash
node bin/forms-api/import-form.mjs --form <session-form.json>
```

Check the environment, form number, `Operation: CREATE:...`, and
`Expected path`. The script derives the stored path by lowercasing
`skjemanummer` and removing non-alphanumeric characters; the JSON `path`
field does **not** set the stored path. Use the path returned by Forms API
after import in plan links, not the JSON path.

If the form does not already exist, apply only the operation printed by
the current dry run:

```bash
node bin/forms-api/import-form.mjs --form <session-form.json> \
  --apply --confirm '<CREATE:... from dry run>'
```

If the script reports an existing form, stop and inspect it. Reuse it if
suitable. An UPDATE is allowed only after the user explicitly approves
replacing that particular test form with the proposed definition. Then
dry-run with `--replace-existing`; inspect the current revision, title,
status, lock warning, and `Operation: UPDATE:...`. Confirm the current
definition and proposed changes with the user before applying:

```bash
node bin/forms-api/import-form.mjs --form <session-form.json> --replace-existing
node bin/forms-api/import-form.mjs --form <session-form.json> \
  --replace-existing --apply --confirm '<UPDATE:... from dry run>'
```

The UPDATE confirmation is tied to the existing revision and contents
and the proposed payload. The script sends the current revision with the
write. If it changes, dry-run again and get fresh approval of the changed
state; do not bypass the mismatch.

## Failed writes and readback

A token can allow GET requests yet return `401` on CREATE. Ask the user to
refresh it without exposing the token. After **any** failed or ambiguous
write, inspect Forms API before retrying: the response does not prove the
write did not happen. Dry-run again to check whether the operation is still
CREATE or is now UPDATE; never reuse an old confirmation or automatically
replace a newly created form. If the refreshed token still cannot write,
report the blocker and ask the user to have someone with access make the form available.

After every import, fetch the form from Forms API by its **stored** path.
Check its revision and actual components (including required fields and
conditional rules), `properties.submissionTypes` and other submission
settings, and the scenario selector values and conditional choices used
by each case. `inspect-preprod-forms.mjs --path '<stored-path>'` summarizes
revision, component types, and properties; inspect the full fetched
definition in the local session when verifying conditionals. Never expose
the full definition, token, or private data in the shared plan. Do not
finalize a case until the readback matches its form, submission method, and
branch choices.
