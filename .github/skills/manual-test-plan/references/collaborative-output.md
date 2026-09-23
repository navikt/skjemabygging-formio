# Collaborative output

The canonical plan JSON is the source. Do not hand-edit generated HTML, GitHub
issue text, or Slack text and then let it drift from the plan.

## Choose the output

Ask whether non-developers will collaborate on testing.

- If yes, generate the GitHub Pages HTML and Slack Canvas file. The caller owns
  the Canvas file and pastes it into Slack. Never publish it to `gh-pages`.
- If no, generate one GitHub issue document that combines detailed instructions
  with test-case checkboxes. Create the issue only after confirmation. Do not
  generate a Canvas or GitHub Pages document.

## HTML and GitHub Pages

The Norwegian page is written for non-technical testers. It presents functional
behavior, form links, and test cases first. Behavior analysis and setup are
collapsed by default. A behavior link opens the relevant collapsed section.

Use a path such as:

```text
manual-tests/pr-2210/
```

Dry-run publication first:

```bash
node .github/skills/manual-test-plan/scripts/publish-pages.mjs \
  --artifacts <artifact-directory> \
  --destination manual-tests/pr-2210
```

Ask before applying and use the exact confirmation printed by the dry run.
Publishing runs in a temporary Git worktree and preserves other plans.
Only `index.html` may be published.

If Pages or `gh-pages` is not configured, follow the script's bootstrap
instructions. Do not change repository Pages settings automatically.

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

Review each artifact independently. Ask whether to redact, omit, or publish:

- `index.html`
- `slack-canvas.md`
- `github-issue.md`
- each generated form definition
- the canonical plan JSON, if considered for publication

The default is not to publish an artifact containing internal-only details,
private URLs, security findings, personal data, or sensitive test data.
Never include a complete form definition in the HTML or issue.
