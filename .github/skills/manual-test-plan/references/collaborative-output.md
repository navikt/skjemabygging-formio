# Collaborative output

The canonical plan JSON is the source. Do not hand-edit generated HTML, GitHub
issue text, or Slack text and then let it drift from the plan.

## Choose the output

With non-developer collaborators, produce the GitHub Pages HTML and a separate
Slack Canvas file that the caller pastes into Slack. Without them, produce one
GitHub issue document. The Canvas file never goes to `gh-pages`.

## HTML and GitHub Pages

The Norwegian page is written for non-technical testers. It presents functional
behavior, form links, and test cases first. Behavior analysis and setup are
collapsed by default. A behavior link opens the relevant collapsed section.

The destination comes from the manifest slug. A plan with slug
`pr-2210-party-resolution` goes to:

```text
manual-tests/pr-2210-party-resolution/
```

Dry-run publication first:

```bash
node .github/skills/manual-test-plan/scripts/publish-pages.mjs \
  --artifacts <artifact-directory>
```

Ask before applying and use the exact confirmation printed by the dry run.
The default GitHub Pages URL needs no extra render step. If the repository uses
a custom Pages URL, the publisher reports the expected URL; rerender once with
`--page-url <expected-url>` and rerun its dry run. The publisher checks the
URL against the manifest and only
replaces `index.html` at the destination; nested plans and other files remain.

Before enabling Pages or creating `gh-pages`, obtain approval from the repository
maintainers to host public manual test plans. Pages is not currently enabled
for this repository. If approved, follow the script's bootstrap instructions;
the script does not change Pages settings. If approval is not granted, do not
publish the page or share its link.

Record an owner and cleanup date for each published plan. Once testing ends,
the owner must request removal of that plan's directory from `gh-pages` after
confirming that its results have been retained elsewhere. Never delete
`manual-tests/` or another plan's directory as part of cleanup.

## Slack Canvas

`slack-canvas.md` is Norwegian and paste-ready. The repeated environment check
is plain text, not a checkbox. Test cases use checkboxes for tracking and link
to the detailed HTML anchor. Testers add their names or mentions and record
results in the Canvas.

## GitHub issue

`github-issue.md` combines the functional instructions from the page with
test-case ownership and checkboxes from the Canvas. Keep behavior analysis and
setup in collapsed `<details>` sections. Create it in the source repository
after showing the caller the title and body and receiving confirmation:

```bash
node .github/skills/manual-test-plan/scripts/create-issue.mjs \
  --title '<issue-title>' \
  --body <artifact-directory>/github-issue.md
```

Run the dry run first, then use the exact confirmation it prints.

## Publication review

Review the public output for internal-only details, private URLs, security
findings, personal data, or sensitive test data. Redact or omit unsafe content
before asking once whether to publish the page or create the issue. The Slack
Canvas file stays with the caller; generated form definitions and the canonical
plan stay local. Never include a full form definition in public HTML or an
issue.
