# New renderer release plan

This plan tracks the work required to merge and release the new fyllut renderer.
Static PDF migration is out of scope.

## Prerequisite

- [x] Merge the latest `main` into the branch and resolve conflicts.
      Owner: branch maintainer.

All validation and release work below must run after this merge.

## 1. Formio behavior parity

- [x] Pass the selected submission method into active component and panel
      evaluation. Cover `instance.isSubmissionDigital()` with paper and digital
      production-shaped tests.
- [x] Make DataGrid `clearOnHide` operate per row and indexed submission path.
- [x] Evaluate DataGrid `calculateValue` expressions per row with the correct
      `row` context and submission path.
- [x] Preserve populated DataGrid rows when restoring a draft that has an
      earlier empty row.
- [x] Restore production defaults that Formio applies:
    - string `"0"` number defaults;
    - country defaults;
    - attachment defaults.
- [ ] Fetch the current production form definitions and verify that
      `nav020807` no longer contains `navCheckbox.defaultValue: "ja"`.
      No special renderer handling should be added for this malformed value.
- [x] Resolve nested paper attachment values correctly for instructions and
      cover-page data.
- [x] Use one attachment validation-path and control-ID contract so error
      summary links focus upload and title controls.

## 2. Intentional behavior differences

For each difference, either preserve Formio 4.20 behavior or record and test an
approved new-render exception.

- [x] Text inputs preserve raw display text while typing, normalize the
      submission value on every change, and trim/format the display on blur.
- [x] Ignore per-component `validateOn`; validation timing follows the global
      shared-frontend interaction rules.
- [x] Ignore `descriptionPosition`; descriptions consistently render between
      the label and control. The legacy renderer only honored the setting for
      some template-rendered components and already ignored it for React-based
      text fields and text areas.
- [x] Preserve per-component legacy field sizing through the shared semantic
      `FieldSize` API. Formio adapters map `input--*` values at the boundary,
      while shared components apply responsive owned-wrapper widths without
      targeting Aksel internals.
- [x] Ignore form-definition placeholders. Labels and descriptions provide
      persistent guidance; current production forms only contain three
      currency placeholders.

## 3. Accessibility

- [x] Use button semantics for navigation and submission actions.
- [x] Focus the error summary after every failed navigation or submission
      attempt, including repeated attempts.
- [x] Use read-only rather than disabled behavior for read-only selects.
- [x] Make row fields stack at narrow viewport widths and browser zoom.
- [ ] Verify keyboard operation, focus behavior, reflow and screen-reader
      announcements manually.

## 4. Package boundaries and change scope

- [ ] Remove the dependency from generic `form-components` adapters to fyllut
      attachment implementations. Provide fyllut behavior through the intended
      adapter or runtime-service boundary.
- [ ] Replace inappropriate hard-coded `/fyllut` paths with host-provided
      configuration.
- [ ] Revert branch-only bygger changes unless a concrete dependency requires
      them.
- [ ] Remove shared-frontend from `build:bygger` unless bygger consumes the
      package.
- [ ] Review shared-backend application-PDF, translation, attachment and file
      handling changes. Retain only changes required by the new renderer.
- [ ] Review form-spec-api schema changes and prove backward compatibility with
      focused contract tests.

## 5. Security and observability

- [ ] Resolve the CodeQL regular-expression finding in
      `attachmentUploadUtils.ts`.
- [ ] Record which renderer handles a request without logging form answers or
      personal data.
- [ ] Make unsupported-component failures observable.
- [ ] Define monitoring queries and rollback signals before preprod rollout.

## 6. Compatibility audit

Verify these production-used compatibility rules against current published
forms and representative tests:

- [ ] `attachmentValues`.
- [ ] Attachment components with `input: null`.
- [ ] Legacy attachment `values` arrays.
- [ ] `yourInformation` containers.
- [ ] Identity question labels from `customLabels`.
- [ ] Bank-account and organization-number custom validation.
- [ ] Country selection with `ignoreNorway`.
- [ ] Country defaults.
- [ ] Hidden `maalgruppe`.
- [ ] Loading old drafts that store files in `submission.attachments`.

Completed cleanup:

- [x] Remove `formioTextArea` support from shared-frontend. It remains in
      bygger, legacy Formio and backend PDF code where it is still used.
- [x] Verify that shared-frontend has no radiopanel attachment adapter.
- [x] Remove the stale radiopanel attachment claim from
      `NEW_RENDER_COMPATIBILITY.md`.

## 7. Test matrix

- [ ] Run unit tests, type checks, builds and lint after merging `main`.
- [ ] Run the complete branch Cypress suite with the new renderer forced.
- [ ] Run the Cypress specifications from `main` against branch code while
      retaining the branch allowlist harness. Using the unmodified main support
      setup may select the legacy renderer instead.
- [ ] Run a focused empty-allowlist legacy fallback test.
- [ ] Run bygger, shared-components, shared-domain, shared-backend,
      form-spec-api and application-PDF regression tests.
- [ ] Add production-form coverage for:
    - `nav100754`;
    - `nav540009`;
    - `nav100716`;
    - `nav761385`;
    - `nav100727`;
    - `nav020807`.
- [ ] Rescan the current production form corpus for:
    - component types missing from the new renderer;
    - unsupported legacy aliases;
    - non-standard defaults;
    - attachment path and value shapes;
    - custom conditionals, validations and calculations.

## 8. Preprod comparison

- [ ] Add a quoted `FEATURE_NEW_RENDER_FORMS` value containing exact form paths
      to preprod only.
- [ ] Leave preprod-alt without the allowlist.
- [ ] Deploy the same commit SHA to preprod and preprod-alt.
- [ ] Verify `/fyllut/api/config` and `gitVersion` in both environments.
- [ ] Start with `nav100754`.
- [ ] Compare paper and digital flows, validation, language switching,
      attachments, summary, PDF, save/resume, submission payloads, logs and
      metrics.
- [ ] Expand to `nav540009`, followed by calculation and DataGrid-heavy forms.
- [ ] Verify rollback by emptying the preprod allowlist and redeploying the same
      SHA.

Do not start with `FEATURE_NEW_RENDER_FORMS=*`. The wildcard enables every form,
and the current deployment template must be verified to quote it safely.

## 9. Delete the compatibility notes

Delete `packages/fyllut/NEW_RENDER_COMPATIBILITY.md` only when:

- [ ] Every entry has been checked against the current implementation.
- [ ] Every unresolved behavior has been fixed or explicitly accepted.
- [ ] Every behavior claim is covered by a suitable automated or manual test.
- [ ] Durable engineering guidance has moved to the appropriate repository
      skill.
- [ ] Temporary release decisions and accepted exceptions are tracked in the
      pull request or a release issue.
- [ ] No unique rationale remains only in the compatibility file.

## 10. Final release gate

- [ ] All required checks are green after the latest merge from `main`.
- [ ] No unresolved parity blocker or CodeQL alert remains.
- [ ] The preprod comparison is successful.
- [ ] Monitoring and rollback procedures are documented.
- [ ] Required review feedback is resolved and approval renewed.
- [ ] The pull request is non-draft and mergeable.
