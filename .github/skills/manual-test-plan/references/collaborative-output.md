# Collaborative output

The canonical plan JSON is the source. Do not hand-edit generated HTML, CSV, or
Slack text and then let it drift from the plan.

## HTML and GitHub Pages

The standalone page contains the behavior analysis, setup, forms, risks, test
data, expandable cases, and stable case anchors. It is read-only and public when
published.

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

If Pages or `gh-pages` is not configured, follow the script's bootstrap
instructions. Do not change repository Pages settings automatically.

## Microsoft Lists

`test-cases.csv` contains one row per case:

- Case ID
- Group
- Title
- Mode
- Behaviors
- Priority
- Status
- Testers
- Result
- Instruction URL
- Notes

Create a List from the CSV. During import, use text or choice columns. After
creation, replace `Testers` with a Person or Group column that allows multiple
selections. Spreadsheet import cannot reliably create that field directly.

## Slack Canvas

`slack-canvas.md` is paste-ready. It keeps coordination brief and links every
case to the detailed HTML anchor. Testers add their names or mentions and use
the checkbox for shared completion. Use comments or the result field when
several testers execute the same case.

## Publication review

Review each artifact independently. Ask whether to redact, omit, or publish:

- `index.html`
- `test-cases.csv`
- `slack-canvas.md`
- each generated form definition
- the canonical plan JSON, if considered for publication

The default is not to publish an artifact containing internal-only details,
private URLs, security findings, personal data, or sensitive test data.
