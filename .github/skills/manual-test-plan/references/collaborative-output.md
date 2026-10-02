# Test plan delivery

The canonical plan JSON is the source. Do not hand-edit the rendered HTML
or GitHub issue body. Change the plan and rerender instead.

## With non-developers

The renderer produces a complete local `index.html`, not a PDF. It contains
the Norwegian test instructions, form links, version check, evidence, cleanup,
and a short coverage section explaining what the cases do not cover and why.
Give the user a `file://` URL pointing to the generated `index.html` with
`?print=1` appended. Have them open that URL in a browser and choose
Print > Save as PDF. The print URL expands all sections, including alternative
integration checks. The ordinary HTML view keeps them collapsed.

The user can save the printed PDF as `test-plan.pdf` in the artifact directory
or in a separate local directory. The renderer does not manage manually saved
PDFs, so rerendering the HTML will not update one. After every rerender, print
again. A PDF tracked by an older renderer must be moved outside the output
directory before rerendering; the script refuses to delete it silently.

Ask the user to review the printed PDF page by page, including long cases and
links. Check that no section or step disappears at a page break. Do not claim
that a PDF was produced by the renderer, or that a stale PDF matches new HTML.
Share only the reviewed PDF alongside a Trello task through an approved
channel, after explicit approval. Do not assume Trello access: attach the
PDF only if access is actually available and approved; otherwise give the
reviewed PDF to the user to distribute alongside the task. Do not publish
HTML to GitHub Pages or create a GitHub issue for this path.

## Without non-developers

`github-issue.md` contains the full Norwegian plan, including the coverage
section and cleanup checklist. Keep behavior analysis and setup in collapsed
`<details>` sections. Show the caller the entire rendered title and body
before asking to create the issue:

```bash
node .github/skills/manual-test-plan/scripts/create-issue.mjs \
  --repo navikt/skjemabygging-formio \
  --title '<issue-title>' \
  --body <artifact-directory>/github-issue.md
```

Run the dry run first. It prints the issue body and the exact confirmation
needed for creation. Do not replace that preview with a summary.

## Review before sharing

Review the HTML, printed PDF, or issue for internal-only details, private
URLs, security findings, real personal data, or secrets. Keep generated form definitions,
internal instructions, and the canonical plan local. Approved synthetic
identity numbers belong only in team-controlled notes, not the artifacts.

Check every case's form link, route, actions, expected results, evidence, and
cleanup. Check the coverage section against the behavior matrix, edge cases,
failure paths, and regression candidates. An excluded PR criterion is not
automatically a test coverage gap; explain separately why an in-scope behavior
has no case. Give the caller absolute local file links for the HTML or issue
text and canonical plan. Link a PDF only after the user has printed and reviewed it.
