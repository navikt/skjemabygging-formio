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
      The value is still present at `skjemautfylling-formio@6d57dcc` under the
      `oppgiAlleVirksomheterDuArbeiderForINorge` data grid, on component
      `jegVetIkkeHvaOrganisasjonsnummeretEr`. The published form must be
      corrected before release.
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
- [x] Use `customLabels.doYouHaveIdentityNumber` in identity required-error
      text. The legacy renderer used the generic question even when the visible
      question named another person; the new renderer keeps the label and error
      text consistent.
- [x] Use the shared new-render warning content after an invalid summary submit
      instead of also rendering the legacy sentence `Du må fullføre utfyllingen
    før du kan fortsette`.

## 3. Accessibility

- [x] Use button semantics for navigation and submission actions.
- [x] Focus the error summary after every failed navigation or submission
      attempt, including repeated attempts.
- [x] Use read-only rather than disabled behavior for read-only selects.
- [x] Make row fields stack at narrow viewport widths and browser zoom.
- [ ] Verify keyboard operation, focus behavior, reflow and screen-reader
      announcements manually.

## 4. Package boundaries and change scope

- [x] Remove the dependency from generic `form-components` adapters to fyllut
      attachment implementations. Provide fyllut behavior through the intended
      adapter or runtime-service boundary. The fyllut form flow now overrides
      the generic attachment renderer through `InputComponentRegistry`.
- [x] Replace inappropriate hard-coded `/fyllut` paths with host-provided
      configuration.
- [x] Revert branch-only bygger changes unless a concrete dependency requires
      them. The unrelated builder-test changes were reverted; the error utility
      cleanup remains because it reuses the shared-domain response-error guards
      instead of duplicating runtime type checks.
- [x] Keep shared-frontend in `build:bygger`: bygger consumes it indirectly
      through shared-components, which imports the shared summary renderer.
- [x] Review shared-backend application-PDF, translation, attachment and file
      handling changes. The retained changes support nested attachment
      normalization, new-render select value shapes, validation and intro-page
      translations, and temporary upload paths. Existing attachment and file
      tests cover the critical normalization and upload-path behavior.
- [x] Review form-spec-api schema changes and prove backward compatibility with
      focused contract tests. Attachment-panel schemas accept legacy Formio and
      new-render attachment values, while top-level attachments remain optional
      except for digital no-login submissions.

## 5. Security and observability

- [x] Resolve the CodeQL regular-expression finding in
      `attachmentUploadUtils.ts`.
- [x] Do not add renderer-selection telemetry. Existing rollout configuration
      and comparison checks are sufficient, and per-request renderer metrics or
      logs are not required for this release.
- [x] Make unsupported-component failures observable through a stable,
      privacy-safe frontend error event with form path, component type and
      renderer surface, deduplicated per browser logger session.
- [x] Use existing logs, metrics and Nais dashboards during the side-by-side
      preprod comparison. Roll back on unsupported components, incorrect or
      missing form data, privacy leakage, failed submission flows, or
      renderer-specific operational failures. No additional monitoring code or
      configuration is required for this release.

## 6. Compatibility audit

Verified against Formio 4.20.0, the 246 published forms at
`skjemautfylling-formio@6d57dcc`, and focused regression tests:

- [x] `attachmentValues`. The corpus contains 937 components in 197 forms;
      option mapping, additional documentation, deadlines and paper/digital
      behavior are covered.
- [x] Attachment components with `input: null`. No current published component
      uses `input: null`; eight omit `input`. Both shapes retain the attachment
      key in the new-render submission path.
- [x] Legacy attachment `values` arrays. The two current occurrences are in
      `nav100715`; a `values`-only component is covered through selection and
      summary.
- [x] `yourInformation` containers. The corpus contains 149 components,
      including seven that omit `input` and `tree`; nested submission paths are
      covered for both current shapes.
- [x] Identity question labels from `customLabels`. The visible question uses
      the custom label in 148 components across 144 forms, including required
      validation and error-summary text.
- [x] Bank-account and organization-number custom validation. The corpus
      contains 42 expressions on `bankAccount` and 82 on `orgNr`; built-in
      validation, custom messages and the trailing-semicolon variant are
      covered without renderer-side `instance` helpers. The single expression
      on a plain text field in `nav761389` is excluded and will be corrected in
      the published form definition.
- [x] Country selection with `ignoreNorway`. The corpus contains 32 enabled
      occurrences across 10 forms; Norway exclusion is covered in Cypress.
- [x] Country defaults. All eight non-empty published defaults use the
      `{ label: "Norge", value: "NO" }` shape; populated and empty defaults are
      covered.
- [x] Hidden `maalgruppe`. All seven published components are hidden; prefilled
      and calculated submission behavior is covered.
- [x] Loading old drafts that store files in `submission.attachments`. Legacy
      attachments, including uploaded files, are hydrated into component paths
      after draft filtering without losing separately stored personal-ID files.

Completed cleanup:

- [x] Remove `formioTextArea` support from shared-frontend. It remains in
      bygger, legacy Formio and backend PDF code where it is still used.
- [x] Verify that shared-frontend has no radiopanel attachment adapter.

## 7. Test matrix

- [x] Run unit tests, type checks, builds and lint after merging `main`.
- [ ] Run the complete branch Cypress suite with the new renderer forced.
      The pushed pre-merge SHA passed in GitHub; the post-merge local run was
      skipped because of its runtime.
- [ ] Run the Cypress specifications from `main` against branch code while
      retaining the branch allowlist harness. Using the unmodified main support
      setup may select the legacy renderer instead.
      This is a manual compatibility run; branch Cypress tests always force the
      new renderer.
- [ ] Verify the empty-allowlist legacy fallback manually.
- [x] Run bygger, shared-components, shared-domain, shared-backend,
      form-spec-api and application-PDF regression tests.
- [ ] Add production-form coverage for:
    - [x] `nav100754`;
    - [x] `nav540009`;
    - [x] `nav100716`;
    - [x] `nav761385`;
    - [x] `nav100727`;
    - [ ] `nav020807`; blocked until the malformed published checkbox default
          is corrected.
- [x] Rescan the current production form corpus for:
    - component types missing from the new renderer;
    - unsupported legacy aliases;
    - non-standard defaults;
    - attachment path and value shapes;
    - custom conditionals, validations and calculations.
      The current corpus has 246 forms, 17,551 components and 42 component
      types. The only unmatched type is one top-level wizard `button` that both
      renderers omit. No unsupported aliases or attachment shapes were found.
      Existing compatibility handling covers current custom expressions. The
      remaining non-standard default is the `nav020807` value documented above.

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

- [x] Every entry has been checked against the current implementation.
- [x] Every unresolved behavior has been fixed or explicitly accepted.
- [x] Every behavior claim is covered by a suitable automated or manual test.
- [x] Durable engineering guidance has moved to the appropriate repository
      skill.
- [x] Temporary release decisions and accepted exceptions are tracked in pull
      request #2129 and this release plan.
- [x] No unique rationale remains only in the compatibility file.

The compatibility note was deleted after its remaining implementation claims
were resolved or accepted and recorded here.

## 10. Final release gate

- [ ] All required checks are green after the latest merge from `main`.
- [ ] No unresolved parity blocker or CodeQL alert remains.
- [ ] The preprod comparison is successful.
- [ ] Monitoring and rollback procedures are documented.
- [ ] Required review feedback is resolved and approval renewed.
- [ ] The pull request is non-draft and mergeable.
