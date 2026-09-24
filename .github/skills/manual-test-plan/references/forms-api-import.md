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

If an attempt to access Forms API fails, including inspection of existing
forms, identify where the failure occurred before asking for a token update.
A `Proxy response (403) !== 200 when HTTP Tunneling` error comes from the
proxy, not Forms API. Follow the proxy retry below first. An HTTP `401` from
Forms API indicates an authentication failure.

If Forms API still cannot be accessed after proxy troubleshooting, or the
failure is not proxy-generated, tell the caller what failed. Use `ask_user`
to ask them to update the Forms API token, even when the cause is not known.
Do not claim the token expired unless Forms API returned `401`. Direct the
caller to run:

```bash
pnpm get-tokens forms-api
```

Wait for the caller to confirm that the token is updated, then retry the failed
read or dry run once. Never ask the caller to paste the token into chat, and
do not inspect, decode, or print it. Do not treat a failed inspection as
evidence that the form is missing.

For an apply failure, rerun the dry run before retrying the write. The operation
may have changed since the first attempt. Use the new confirmation value and
ask for renewed confirmation if the operation changed. If access still fails,
stop and report the error rather than starting another token refresh loop. For
a persistent `401` or authorization `403` from Forms API, ask the caller to
verify the `SkjemabyggingPreprod` group and Forms API audience.

The helper must not start the token workflow itself because it requires browser
login and an interactive token paste. The caller runs it as a separate step. Be
aware that an exported `FORMS_API_ACCESS_TOKEN` takes precedence over the value
written to `packages/bygger-backend/.env`.

## Proxy HTTP 403

If the error comes from HTTP tunneling through the proxy, retry the same
read-only command once without the proxy environment variables. For a
failed write, rerun the dry run without the proxy first, then require the
current operation's confirmation before retrying the write:

```bash
env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY \
  -u http_proxy -u https_proxy -u all_proxy \
  -u NODE_USE_ENV_PROXY <same-command>
```

Do not change repository proxy configuration. If the direct retry fails,
prompt for a token update as described above, then retry once. If access
still fails, report the error instead of bypassing more network controls.

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
