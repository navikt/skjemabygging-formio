# Test plan delivery

The canonical plan JSON is the source. Do not hand-edit the generated PDF or
GitHub issue body. Change the plan and rerender instead.

## With non-developers

Generate `test-plan.pdf` and share it alongside a Trello task. Use that task to track
owners, progress, results, and follow-up work. The PDF contains the full
Norwegian test instructions, form links, version check, evidence, cleanup, and
a short coverage section explaining what the cases do not cover and why.
`index.html` is a local intermediate for rendering the PDF, not a publication
target. Do not publish HTML to GitHub Pages or create a GitHub issue for this
path.

Review the rendered PDF page by page, including long cases and links. Check
that no section or step disappears at a page break. If Chrome or Chromium is
not on PATH, set `CHROME_PATH` to its executable and rerun the renderer. Share
only the PDF through an approved channel. Ask before uploading it to Trello.
Never claim the PDF is available to testers until it has been shared.

## Without non-developers

`github-issue.md` contains the full Norwegian plan, including the coverage
section and cleanup checklist. Keep behavior analysis and setup in collapsed
`<details>` sections. Show the caller the entire rendered title and body
before asking to create the issue:

```bash
node .github/skills/manual-test-plan/scripts/create-issue.mjs \
  --title '<issue-title>' \
  --body <artifact-directory>/github-issue.md
```

Run the dry run first. It prints the issue body and the exact confirmation
needed for creation. Do not replace that preview with a summary.

## Review before sharing

Review the PDF or issue for internal-only details, private URLs, security
findings, real personal data, or secrets. Keep generated form definitions,
internal instructions, and the canonical plan local. Approved synthetic
identity numbers belong only in team-controlled notes, not the artifacts.

Check every case's form link, route, actions, expected results, evidence, and
cleanup. Check the coverage section against the behavior matrix, edge cases,
failure paths, and regression candidates. An excluded PR criterion is not
automatically a test coverage gap; explain separately why an in-scope behavior
has no case. Give the caller absolute local file links for the generated PDF
or issue text and canonical plan.
