# Browser walkthrough in preprod

Use this for FyllUt cases after fixing the PR head, the exact preprod form
revision, submission method, and conditional branch. A Forms API response
describes the form, not the route the browser takes through it. The committed
Cypress probe opens a named form only on the FyllUt preprod ingresses.
It records headings, labels, choices, and navigation without reading input
values, cookies, document contents, or tokens. It blocks browser requests
using POST, PUT, PATCH, or DELETE. Its default is to open the entry page only.

From the repository root, first inspect `packages/fyllut/cypress.config.ts`
and any `.runtime/cypress.mocks.json` override. The config defaults to
localhost and defines mock endpoint environment variables. The command below
overrides `baseUrl`, disables the support file that registers mock commands,
and runs **only** the standalone probe. Do not call `cy.configMocksServer()`,
`cy.defaultIntercepts()`, or run an existing spec against preprod. These
intercept or configure mock routes. Use the installed Cypress in
`packages/fyllut`, not another downloaded package.

```bash
pnpm --dir packages/fyllut exec cypress run --browser electron \
  --spec ../../.github/skills/manual-test-plan/scripts/preprod-route.cy.ts \
  --config 'baseUrl=https://fyllut-preprod.intern.dev.nav.no,supportFile=false,specPattern=../../.github/skills/manual-test-plan/scripts/preprod-route.cy.ts,testIsolation=true' \
  --env 'PROBE_FORM_PATH=manualtestperson,PROBE_METHOD=paper,PROBE_CASE_ID=TC-01,PROBE_BRANCH=person-sender,PROBE_FORM_REVISION=<revision>,PROBE_PR_HEAD=<40-character-head-sha>'
```

Replace the form path, branch, revision, commit, and method for **each** case.
Allowed methods are `paper`, `digitalnologin`, and `digital`. Use an approved
synthetic test identity if interaction requires one, but never include its
number in CLI arguments or trace files. The probe writes one sanitized JSON
trace per case and branch to
`packages/fyllut/.runtime/manual-test-plan-probe/`. Keep this local.
If a proxy tunnel returns 403 before Cypress reaches preprod, retry without
uppercase and lowercase proxy variables and `NODE_USE_ENV_PROXY`. Do not
interpret a proxy error as a Forms API token problem.

To follow safe navigation, supply
`PROBE_ACTIONS=Neste steg|Neste steg` in the quoted `--env` argument and rerun. Only
`Neste steg`, `Forrige steg`, and `Start utfylling` are accepted; the request
guard stays active. The trace records each action and the next page. For
conditional choices or a different visible navigation control, write a
focused local copy of the spec for **that case**, record the chosen label and
option, and keep the request guard. Do not log entered values. Run each
conditional branch separately. Do not generalize the trace from another form
or another branch.

Navigation is not permission to upload ID or attachments, generate a PDF,
save a draft, or submit. Ask for approval for the specific preprod action
before changing the guard or performing it manually; use approved synthetic
data. Never silently bypass the guard. If the probe stops at a required
upload or confirmation, record the page and the unobserved transitions.
Do not describe them as verified.

If the entry URL responds with 302, inspect its `Location` and follow the
normal browser navigation. For example,
`/fyllut/manualtestperson?sub=digitalnologin` can redirect to
`/fyllut/manualtestperson/legitimasjon?sub=digitalnologin`. A 302 is not an
access error, and a 200 on the destination does not establish the rest of
the journey. On failure, record the final URL, visible page, error, and
requested action as the concrete blocker.
If Cypress cannot launch, record that error as the blocker. An HTTP-only
check cannot replace the browser walkthrough.

For each case, compare the trace with every numbered step in the rendered
HTML and Canvas, including uploads and intervening pages. Keep the PR commit,
form revision, submission method, branch, trace path, and any unobserved
transitions in `journeyCheck.evidence` and `journeyCheck.note`. Derive
**expected results** from the issue or approved specification. A browser
trace proves which steps were observed, not what behavior is correct. Keep
outbound request and identity checks separate from UI and receipt checks.
