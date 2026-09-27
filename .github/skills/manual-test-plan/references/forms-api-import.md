# Read-only Forms API access

The skill reads existing form definitions in preprod. It never imports,
replaces, or deletes forms. If the plan requires a new or updated form,
prepare its definition in the session artifact directory and ask a form
owner to make it available. Read back the form and revision after that
owner confirms the change. `preprod` and `preprod-alt` share the same
Forms API instance.

## Token

Use the repository token helper if a read-only Forms API request fails
after the proxy check below:

```bash
pnpm get-tokens forms-api
```

The caller runs this separately. It directs them to the approved OBO token
generator and stores `FORMS_API_ACCESS_TOKEN` in
`packages/bygger-backend/.env`. Never read, decode, or print the token,
or ask the caller to paste it into chat. The required audience is
`dev-gcp:fyllut-sendinn:forms-api`, and the caller needs the
`SkjemabyggingPreprod` group. An exported `FORMS_API_ACCESS_TOKEN` takes
precedence over the env file.

## Failed reads

An HTTP `401` from Forms API indicates an authentication failure.
`Proxy response (403) !== 200 when HTTP Tunneling` comes from the proxy,
not Forms API. Retry the same read-only command once without the proxy
environment variables:

```bash
env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY \
  -u http_proxy -u https_proxy -u all_proxy \
  -u NODE_USE_ENV_PROXY <same-read-only-command>
```

Do not change repository proxy settings. If the read still fails, tell the
caller what failed and use `ask_user` to request a token update, without
claiming expiry unless Forms API returned `401`. Wait for confirmation
and retry the read once. If it still fails, stop and report the error.
For a persistent Forms API `401` or authorization `403`, ask the caller to
check the group and audience. Never treat a failed lookup as proof that
a form does not exist.
