---
name: production-form-cypress-tests
description: >-
    Generate Cypress tests for production forms in skjemabygging-formio. Use
    this when creating tests for real NAV forms from
    mocks/mocks/data/forms-api/production-forms/ that exercise conditional
    flows and verify the summary page.
---

# Production form Cypress tests

## Goal

Generate one Cypress test file per production form that exercises the form's
conditional flows and verifies the summary page.

Production form JSON files live in
`mocks/mocks/data/forms-api/production-forms/`. They are copies of real forms
from <https://github.com/navikt/skjemautfylling-formio/tree/master/forms>.
The mock server serves them automatically — no custom form intercepts needed.

Test files go in `packages/fyllut/cypress/e2e/production/`.

## Critical: testIsolation is false

`cypress.config.ts` sets `testIsolation: false`. This means:

- All `it` blocks within a `describe` **share the same browser state**.
- DOM state, cookies, and local storage persist between `it` blocks.
- The `beforeEach` runs before each `it`, but the page is NOT automatically
  reset between tests.
- This is **why the panel-grouped strategy works**: one `cy.visit()` in
  `beforeEach` loads the panel, then all `it` blocks in that `describe`
  exercise conditionals on the same loaded page.
- `it` blocks within a `describe` execute **in order** — they are not
  independent.

## Running the tests

The user controls the preview server and mock server — **never start or restart
them yourself**. If a server appears to be down, ask the user to start it.

Run a spec with:

```bash
cd packages/fyllut && yarn cypress run --browser electron --spec "cypress/e2e/production/<file>.cy.ts"
```

Multiple specs can be comma-separated in the `--spec` argument.

## Workflow for generating a test

### Step 1 — Analyse the form JSON

Load the form from `mocks/mocks/data/forms-api/production-forms/<path>.json`
and extract:

1. **`path`** — used in the visit URL.
2. **`properties.submissionTypes`** — determines `?sub=paper` or `?sub=digital`.
   Prefer paper when available (simpler — no mellomlagring). Array keys are
   `PAPER`, `DIGITAL`, `DIGITAL_NO_LOGIN`.
3. **`introPage.enabled`** — if `true` (boolean), the form shows a
   self-declaration page before the first panel. 12 forms have this.
4. **Panels** — top-level `components` where `type === 'panel'`. Each panel is a
   wizard step. The panel `key` is used as the URL segment. The panel `title` is
   the heading shown to the user.
5. **Fields per panel** — walk each panel's `components` recursively (including
   inside `container`, `navSkjemagruppe`, and `datagrid` wrappers). Record
   `key`, `type`, `label`, `conditional`, `customConditional`, and
   `validate.required`.
6. **Conditionals** — identify fields whose visibility depends on other fields.
    - **Simple**: `{ show, when, eq }` — field with key `when` must equal `eq`
      for the field to be shown/hidden. **Ignore entries where `eq` is `""`
      (empty string) or `null`** — these are equivalent to no conditional.
    - **Custom**: `customConditional` is a JS expression using `show =`,
      referencing `data.<key>`, `row.<key>`, or `instance.isSubmissionDigital()`.
    - **Priority**: if a component has **both** a simple `conditional` and a
      `customConditional`, only the `customConditional` is used at runtime.
      Count and test only the custom one.
7. **Cross-panel conditionals** — when a field on panel A controls visibility of
   a field or entire panel on panel B. These require stepper navigation.
8. **`isAttachmentPanel`** — check each panel for `isAttachmentPanel: true`.
   These panels are **skipped by sequential `clickNextStep()`** in the wizard.
   See [Attachment panels (isAttachmentPanel=true)](#attachment-panels-isattachmentpaneltrue) below.

#### Common customConditional patterns (by frequency)

| Pattern                     | Frequency | Example                                             |
| --------------------------- | --------- | --------------------------------------------------- |
| `row.X === 'value'`         | 101 forms | `show = row.identitet.harDuFodselsnummer === "nei"` |
| `data.X === 'value'`        | 84 forms  | `show = data.hvaSokerDuOm === "ja"`                 |
| `String.includes / indexOf` | 41 forms  | `show = ["NO"].includes(data.land.value)`           |
| Numeric comparison          | 10 forms  | `show = data.antallBarn > 1`                        |
| `instance.isSubmission*()`  | 9 forms   | `show = instance.isSubmissionDigital()`             |

**`row.X` conditionals** are not limited to datagrids. They can also appear
inside composite components such as `identity` and `navAddress`, where `row`
refers to the current component instance rather than a datagrid row. Always
check the surrounding component before deciding how to trigger the conditional.

### Step 2 — Plan the test structure

The goal is to test **all** conditionals while keeping tests fast.

#### Organise tests by panel

Create one `describe` block per panel that has conditionals. Inside it:

- **Same-panel conditionals**: one or more `it` blocks that toggle triggers and
  assert targets appear/disappear. Group related triggers together.
- **Cross-panel conditionals** (trigger on this panel, target on another): set
  the trigger, then use `cy.clickShowAllSteps()` + stepper link to jump to the
  target panel and assert. Group triggers sharing a source panel.
  When you need to flip the source answer again after reaching the target
  panel, navigate back to the source panel with the stepper before changing it;
  do not expect the trigger field to exist on the target panel.
- **Panel-level conditionals** (entire panel shown/hidden): verify the panel
  link appears/disappears in the stepper after toggling the trigger.
  If the trigger directly changes which panel `clickNextStep()` reaches next,
  validating with normal next/previous navigation can be more reliable than
  asserting only on stepper-link visibility.

#### One end-to-end flow for the summary

Add one `it` that fills the minimum required fields across all panels (picking
one value per conditional) and reaches the summary page. Verify that key values
appear. This covers the "happy path" and summary rendering.

#### Expected test counts

| Form complexity             | Panels with conditionals | Approximate `it` blocks       |
| --------------------------- | ------------------------ | ----------------------------- |
| Simple (1–5 triggers)       | 1–3                      | 2–4 (1 per panel + 1 summary) |
| Medium (6–20 triggers)      | 3–8                      | 5–10                          |
| Complex (21–40 triggers)    | 5–12                     | 8–15                          |
| Very complex (41+ triggers) | 8–20+                    | 12–25                         |

### Step 3 — Write the test file

Follow the template below. Use custom Cypress commands from
`packages/fyllut/cypress/cypress.d.ts` whenever possible.

## File naming

One file per form: `packages/fyllut/cypress/e2e/production/<formPath>.cy.ts`

## Critical: setup and intercepts

Use `cy.defaultIntercepts()` in the top-level `beforeEach`. The mock server
serves production forms automatically from
`mocks/mocks/data/forms-api/production-forms/`.

```typescript
beforeEach(() => {
    cy.defaultIntercepts();
});
```

Do **not** add a custom intercept for the form itself.

## Test file template

```typescript
/*
 * Production form tests for <formTitle>
 * Form: <formPath>
 * Submission types: <submissionTypes>
 *
 * Panels tested:
 *   - <panelTitle> (<panelKey>): <N> same-panel conditionals
 *       <triggerKey> → <targetKey> (and <otherTargets>)
 *       + <M> cross-panel triggers to <targetPanels>
 *   - <panelTitle> (<panelKey>): <N> customConditionals
 *       <description of what triggers what>
 */

describe('<formPath>', () => {
    beforeEach(() => {
        cy.defaultIntercepts();
    });

    describe('<Panel Title> conditionals', () => {
        beforeEach(() => {
            cy.visit('/fyllut/<formPath>/<panelKey>?sub=paper');
            cy.defaultWaits();
        });

        it('toggles <targetField> when <triggerField> changes', () => {
            // Assert target is not visible initially
            cy.findByLabelText('<targetLabel>').should('not.exist');

            // Trigger the conditional
            cy.withinComponent('<triggerLabel>', () => {
                cy.findByRole('radio', { name: '<value>' }).click();
            });

            // Assert target appears
            cy.findByLabelText('<targetLabel>').should('exist');

            // Toggle back
            cy.withinComponent('<triggerLabel>', () => {
                cy.findByRole('radio', { name: '<otherValue>' }).click();
            });
            cy.findByLabelText('<targetLabel>').should('not.exist');
        });

        it('shows <targetPanel> fields when <triggerField> is set', () => {
            // Set trigger on this panel
            cy.withinComponent('<triggerLabel>', () => {
                cy.findByRole('radio', { name: '<value>' }).click();
            });

            // Jump to target panel via stepper
            cy.clickShowAllSteps();
            cy.findByRole('link', { name: '<targetPanelTitle>' }).click();

            // Assert expected fields on target panel
            cy.findByRole('textbox', { name: '<fieldOnTargetPanel>' }).should('exist');
        });
    });

    describe('Summary', () => {
        beforeEach(() => {
            cy.visit('/fyllut/<formPath>?sub=paper');
            cy.defaultWaits();
            // cy.clickIntroPageConfirmation(); // only if introPage.enabled === true
            cy.clickNextStep(); // paper — use cy.clickSaveAndContinue() for digital
        });

        it('fills required fields and verifies summary', () => {
            // Panel 1 — fill minimum required fields
            // ...
            cy.clickNextStep();

            // Panel N — fill minimum required fields
            // ...
            cy.clickNextStep();

            // Summary
            cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
            cy.withinSummaryGroup('<Panel Title>', () => {
                cy.get('dt').eq(0).should('contain.text', '<Field Label>');
                cy.get('dd').eq(0).should('contain.text', '<Expected Value>');
            });
        });
    });
});
```

### Template for digital submission

### ⚠️ `clickShowAllSteps()` in digital mode causes blank page

In `?sub=digital` mode, `cy.clickShowAllSteps()` triggers a mellomlagring save-and-redirect that fails without a valid session, leaving a blank page. **Never call `clickShowAllSteps()` in digital-mode tests.** If you need stepper navigation to reach a Vedlegg or conditional panel, switch to `?sub=paper` for that test even if the form also supports digital.

When the form only supports `DIGITAL` (no `PAPER`), use digital mode:

```typescript
describe('<formPath> (digital)', () => {
    beforeEach(() => {
        cy.defaultIntercepts();
        cy.defaultInterceptsMellomlagring();
    });

    // Use cy.clickSaveAndContinue() instead of cy.clickNextStep()
    // Use ?sub=digital in visit URLs
});
```

## Custom Cypress commands reference

Always prefer these over raw selectors. Defined in `cypress.d.ts`:

### Navigation

| Command                           | Use when                                                                                                                                              |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cy.clickNextStep()`              | Navigating forward in paper mode (or no submission type).                                                                                             |
| `cy.clickSaveAndContinue()`       | Navigating forward in digital mode (saves draft).                                                                                                     |
| `cy.clickPreviousStep()`          | Navigating backward.                                                                                                                                  |
| `cy.clickIntroPageConfirmation()` | Checking the self-declaration checkbox on the intro page. Only needed for forms where `introPage.enabled === true` at the top level of the form JSON. |
| `cy.clickShowAllSteps()`          | Expanding the stepper to show all panel links.                                                                                                        |
| `cy.clickDownloadInstructions()`  | Clicking the download button on the paper submission end page.                                                                                        |
| `cy.clickEditAnswer(title)`       | Clicking "Endre svar" link for a summary section.                                                                                                     |
| `cy.clickEditAnswers()`           | Clicking "Fortsett utfylling" from summary.                                                                                                           |

**`cy.clickStart()` is legacy — never use it.** Use `cy.clickNextStep()` or
`cy.clickSaveAndContinue()` explicitly.

### Setup

| Command                               | Use when                                                                                                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cy.defaultIntercepts()`              | Always call in `beforeEach` for production form tests.                                                                                                                                |
| `cy.defaultInterceptsMellomlagring()` | Also call in `beforeEach` when testing digital submission (draft persistence).                                                                                                        |
| `cy.defaultInterceptsExternal()`      | Call in `beforeEach` when the form uses external data sources (prefill-data, activities). Forms with `prefillKey` on `identity`, `navAddress`, or similar components often need this. |
| `cy.defaultWaits()`                   | Always call after `cy.visit()`. Waits for `@getConfig`, `@getForm`, `@getTranslations`.                                                                                               |

Paper forms with `prefillKey`-driven `identity` / `navAddress` components can
still require `cy.defaultInterceptsExternal()`. Do not assume external
intercepts are only needed in digital mode.

In some of those prefilled `identity` flows, the schema can reference
`row.identitet.identitetsnummer` in a `customConditional` even though the live
UI does **not** expose a label-addressable `identitetsnummer` textbox. When
that happens, test the observable branch (for example address fields or
folkeregister alerts) instead of forcing a selector for an input that is only
present in hidden prefill data.

Some paper-mode forms can also start at a real first wizard panel before the
informational `Veiledning` panel when you visit the root URL. If a summary flow
seems shifted by one panel, trust the live wizard order and adapt the root
sequence instead of assuming `Veiledning` comes first.

Other paper-mode forms can do the opposite: the root URL opens on an
informational **`Introduksjon`** screen even though `introPage.enabled` is not
set in the JSON. In those cases, call `cy.clickNextStep()` once to enter the
real first wizard panel before looking for required fields on that panel.

The inverse can also happen: some root summary flows still land on an
informational start page such as `Veiledning` or `Introduksjon` even without
an explicit intro page. When the summary path stalls on that first
informational panel, add the extra `cy.clickNextStep()` inside the summary `it`
block instead of assuming the shared `beforeEach` already advanced past it.

On some `Introduksjon` pages, the body can also render extra level-2 headings.
When building reusable start-panel helpers, prefer the unique page-title anchor
(`h2#page-title`) over a generic `findByRole('heading', { level: 2 })` query.

Some forms require **both** adjustments from the root URL: the first
`cy.clickNextStep()` enters the wizard from an implicit start page, and the
second leaves an informational `Veiledning` panel before the first real data
panel appears. If your summary flow is still on `Veiledning` after one click,
add the second click explicitly in the summary `it` block.

When a paper-mode summary flow is especially inconsistent, a durable pattern is
to inspect the current page heading and keep advancing while it is still an
informational start panel such as `Introduksjon` or `Veiledning`, instead of
hard-coding exactly one or two initial `clickNextStep()` calls.

Some `Introduksjon` screens also render an extra content heading at level 2 in
the body. If you automate this pattern, prefer the unique page title heading
(`#page-title`) over a generic `findByRole('heading', { level: 2 })`, otherwise
your helper can grab the wrong `<h2>` and never advance past the start screen.

Some no-submission-type wizard forms can still keep landing on a static
`Veiledning` page when you drive the summary flow from the root URL, even
though downstream panel URLs work normally. If that first panel contains only
informational text and no branching inputs, it is acceptable to start the
summary flow and same-panel suites at the first real data panel URL instead of
forcing the root `Veiledning` step through `clickNextStep()`.

Repeated direct-panel visits in `beforeEach` can sometimes flake with a missing
`getConfig` request even though the panel works fine. If one suite starts
failing only on the second `beforeEach`, move the `cy.visit(...);
cy.defaultWaits();` into each `it` block for that suite.

If a later direct-panel `cy.visit()` still reuses cached config and
`cy.defaultWaits()` hangs on `@getConfig`, wait for a stable page cue such as
`#page-title` or the expected panel heading instead of forcing the intercept
sequence for that specific test.

### Component scoping

| Command                                    | Use when                                                                                                                                                                     |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cy.withinComponent(label, fn)`            | Scoping assertions to a specific component by its label. Uses `findByLabelText` + `.closest('.form-group')`. **Preferred for radiopanel, radio, and any labeled component.** |
| `cy.withinSummaryGroup(heading, fn)`       | Scoping assertions to a summary section by panel heading (level 3).                                                                                                          |
| `cy.findByLabelOptional(label)`            | Finding a field that has `(valgfritt)` appended to its label. Equivalent to `cy.findByRole('textbox', { name: /label/ })` — prefer regex when also used in assertions.       |
| `cy.findByRoleWhenAttached(role, options)` | Finding an element that may be detached from DOM during re-renders.                                                                                                          |
| `cy.shouldBeVisible()`                     | Asserting element is visible and not screen-reader-only.                                                                                                                     |

### Validation helpers

| Command                                   | Use when                                |
| ----------------------------------------- | --------------------------------------- |
| `cy.findAllByErrorMessageRequired(label)` | Checking required-field error messages. |
| `cy.clickErrorMessageRequired(label)`     | Clicking required error to focus field. |

## Component interaction patterns

Never use CSS class selectors or style-based selectors. Use accessible queries
(`findByRole`, `findByLabelText`, `findByText`) exclusively. Always use
`.click()` — never `.check()` — for radio options.

### Radiopanel (most common — 2,809 instances across all forms)

`radiopanel` is the dominant radio component type. It renders each option as a
styled card with a hidden `<input type="radio">`.

**Always use `cy.withinComponent()` + `.click()`:**

```typescript
cy.withinComponent('Hva søker du om?', () => {
    cy.findByRole('radio', { name: 'Førstegangs søknad om førerhund' }).click();
});
```

**Never use `.check()` on radiopanel** — it does not reliably trigger FormIO's
change events. **Never use `findByRole('group')` for radiopanel** — it does not
have the `group` role.

Do not assume the option labels are title-cased `Ja` / `Nei`. Some production
forms expose lowercase option labels such as `ja` / `nei` in the accessibility
tree. Match the actual live label (or the JSON `values[].label`) instead of
normalizing the casing yourself.

Some forms reveal a new textbox with the **same label** as the radiopanel after
you pick one option (for example a `Utenlandsk` branch that reveals a free-text
country field with the same label as the citizenship radio). Once that happens,
`withinComponent('<label>')` becomes ambiguous. Use the labeled radiopanel only
for the first toggle, then switch back by clicking the uniquely named radio
option directly (for example `cy.findByRole('radio', { name: 'Norsk' }).click()`).

To assert a conditionally shown radiopanel field exists or not:

```typescript
cy.findByLabelText('Conditionally shown label').should('exist');
cy.findByLabelText('Conditionally shown label').should('not.exist');
```

### Radio (standard radio group — rare in production forms)

Standard `radio` components render as `<fieldset role="group">`:

```typescript
cy.findByRole('group', { name: 'Label' }).within(() => {
    cy.findByRole('radio', { name: 'Option' }).click();
});
```

### Textfield / Textarea / Currency

```typescript
cy.findByRole('textbox', { name: 'Label' }).type('value');
```

Optional `currency` fields can also get `(valgfritt)` appended to their
accessible names. For labels like `Bompenger`, prefer a regex such as
`findByLabelText(/Bompenger/)` over an exact string.

### Number fields

`number` type components render as `<input type="number">` with role `spinbutton`,
**not** `textbox`. Use `findByLabelText`:

```typescript
cy.findByLabelText('Antall').type('5');
```

**Never use `findByRole('spinbutton')` for number fields in Electron** — it does not reliably match. Always use `findByLabelText` for number inputs.

Some numeric IDs also have form-specific minimum validation. For example,
`HPR-nummer` can reject short dummy values and require something like
`1000000` or higher. If a numeric field fails unexpectedly, check the JSON
validation rules before assuming the selector is wrong.

### Date picker (navDatepicker — 1,179 instances)

```typescript
cy.findByRole('textbox', { name: /Dato.*\(dd\.mm\.åååå\)/ }).type('15.01.2025');
```

**Some date pickers validate a range** (e.g., ±186 days from today). If `01.01.2025`
causes a validation error, use a date within the valid window — e.g., today ±3 months.

If the component has `earliestAllowedDate: 0`, the value must be **today or later**.
Use a dynamic date instead of a hard-coded literal:

```typescript
const formatDate = (date: Date) =>
    `${`${date.getDate()}`.padStart(2, '0')}.${`${date.getMonth() + 1}`.padStart(2, '0')}.${date.getFullYear()}`;

cy.findByRole('textbox', { name: /Dato/ }).type(formatDate(new Date()));
```

Do **not** assume `Cypress.dayjs()` exists in these specs. In this repo it is not
available by default, so plain `Date` formatting is the safer reusable pattern.

Some question-style datepickers render their accessible name **without** the
usual `(dd.mm.åååå)` suffix even when other datepickers in the same form keep
it. If an exact label with the suffix fails, fall back to a regex for the
stable question text, such as `findByRole('textbox', { name: /Når begynte/ })`.

### Month picker (monthPicker)

Used for month/year selection (e.g., "Ønsket tidspunkt for endring"). Format is `mm.åååå`.
**Use a current or future date** — many monthPicker fields validate that the value is not in the past.

```typescript
cy.findByRole('textbox', { name: /tidspunkt.*\(mm\.åååå\)/i }).type('01.2026');
```

### Checkbox (navCheckbox)

```typescript
cy.findByRole('checkbox', { name: 'Label' }).click();
```

**Use `.click()` not `.check()`** — `navCheckbox` renders inside an `<fieldset class="aksel-checkbox-group">`. If `findByRole('checkbox')` resolves the fieldset wrapper instead of the input, use:

```typescript
cy.findByRole('checkbox', { name: 'Label' }).find('input[type="checkbox"]').click();
```

Some forms expose the trigger only as a group-labelled fieldset rather than a
directly label-addressable checkbox. In those cases, query the group by its
visible label and click the nested `input[type="checkbox"]`.

Other forms expose the checkbox only through the visible `<label>` text, not as
an accessible `checkbox` role with that exact name. In those cases, anchor on
the label text and click the nested `input[type="checkbox"]`.

Optional standalone `navCheckbox` inputs can also append `(valgfritt)` to the
checkbox input's accessible name even when the surrounding fieldset/group label
does not include that suffix. Prefer a regex such as `/Bolig/` over an exact
string when toggling those branches.

### Select boxes (selectboxes — 281 instances, 90 forms use in conditionals)

Selectboxes render as a group of checkboxes. They are a frequent conditional
trigger — toggling one checkbox can show/hide other fields.

```typescript
cy.findByRole('group', { name: 'Label' }).within(() => {
    cy.findByRole('checkbox', { name: 'Option A' }).check();
    cy.findByRole('checkbox', { name: 'Option B' }).check();
});
```

To test a selectboxes trigger:

```typescript
// Check an option → assert target appears
cy.findByRole('group', { name: 'Velg type' }).within(() => {
    cy.findByRole('checkbox', { name: 'Annet' }).check();
});
cy.findByRole('textbox', { name: 'Beskriv annet' }).should('exist');

// Uncheck → assert target disappears
cy.findByRole('group', { name: 'Velg type' }).within(() => {
    cy.findByRole('checkbox', { name: 'Annet' }).uncheck();
});
cy.findByRole('textbox', { name: 'Beskriv annet' }).should('not.exist');
```

This is intentionally different from **standalone `navCheckbox`** components:

- **selectboxes**: use `.check()` / `.uncheck()` on the option inputs
- **standalone navCheckbox**: use `.click()`

Many selectboxes options also get `(valgfritt)` appended to their accessible
name, so regex matching is often safer than an exact string.

Selectboxes can mix a broad customConditional with a narrower simple
conditional. In those cases, shared target fields can stay visible for multiple
checked options while option-specific fields only appear for one branch. Assert
the shared fields and the branch-specific field separately rather than treating
the whole group as one toggle.

When selectboxes have overlapping option labels (for example `Lønn til
funksjonsassistent` and `Lønn til funksjonsassistent ved arbeidsreiser`), use
exact or anchored option names. A loose regex can match the wrong checkbox and
make the conditional assertions flaky.

### Combobox / Select / Country selector (landvelger)

```typescript
cy.findByRole('combobox', { name: 'Label' }).type('Norg{downArrow}{enter}');
```

`landvelger` inside `navSkjemagruppe` can be flaky when you try to re-select the
already-default country. If the field already defaults to `Norge` / `NO` and the
conditional you need is the Norway path, prefer asserting the default state and
continuing with the visible dependent fields instead of re-driving the selector.

Foreign-address branches inside composite `navAddress` components can also mix
field types and wording compared with the raw JSON. For example, `Land` may
render as a **combobox** instead of a textbox, and `Vegnavn og husnummer, evt.
postboks` in JSON can render as `Vegnavn og husnummer, eller postboks` in the
browser. When testing those branches, trust the live accessible labels/roles
and switch to regex matching if the JSON wording does not line up exactly.

Some foreign-address variants use `Postnummer` plus `By / stedsnavn` instead of
an `Utenlandsk postkode` field. Always confirm the actual child labels in the
form JSON before writing the non-Norway selectors.

Some custom dropdowns are **Choices.js**, not native `<select>` or standard ARIA
combobox widgets. In those cases, `findByRole(..., { name })` and `.select()`
may both fail. A reliable pattern is:

```typescript
cy.get('select[name="data[leverandor1]"]').parent().find('[role="combobox"]').click();
cy.findByRole('option', { name: /leverandor/i }).click();
```

If a form-specific custom dropdown works this way, prefer targeting the hidden
`<select name="data[...]">` as the anchor rather than guessing from labels alone.
For assertion-only coverage, the hidden `select[name="data[...]"]` itself can
also be the most reliable signal that the conditional branch rendered, because
some Choices.js widgets expose an empty-name combobox in the accessibility tree.

### Phone number

Phone number fields render as `input[type="tel"]`. The `phoneNumber` component
renders **two labels**: an outer wrapper label (the form-level label, e.g.
"Telefonnummer innsøkende NAV-veileder") and an inner label ("Telefonnummer")
that is properly associated with the input via `for`. Always use the **inner**
label `'Telefonnummer'`, not the outer one:

```typescript
cy.findByLabelText('Telefonnummer').type('12345678');
```

If `findByLabelText('Telefonnummer')` fails (e.g. multiple phone fields on the
same panel), fall back to:

```typescript
cy.get('input[type="tel"]').type('12345678');
```

If the panel has multiple phone fields or the visible custom label is **not**
properly bound to the input, scope from the visible `<label>` to the containing
`.form-group` and then find the tel input:

```typescript
cy.contains('label', 'Telefonnummer til kontaktpersonen')
    .closest('.form-group')
    .find('input[type="tel"]')
    .type('12345678');
```

If the phone number component includes an area-code selector:

```typescript
cy.withinComponent('Telefonnummer med landkode', () => {
    cy.findByRole('combobox', { name: 'Landskode' }).should('exist');
    cy.findByLabelText('Telefonnummer med landkode').type('12345678');
});
```

### Optional fields (`(valgfritt)` suffix)

Many fields append `(valgfritt)` to their accessible name. Use a regex to
match regardless of the suffix:

```typescript
// Instead of cy.findByLabelOptional('Utenlandsk postkode')
cy.findByRole('textbox', { name: /Utenlandsk postkode/ }).type('1234');
cy.findByRole('textbox', { name: /Utenlandsk postkode/ }).should('not.exist');
```

This also applies to fields inside table/datagrid helper flows. Optional
textbox children there can render as labels like `Eventuelt dekknavn
(valgfritt)`, so use a regex instead of an exact string before assuming the
conditional failed to render. Checkbox branches can flake for the same reason.

The same suffix can appear on standalone `navCheckbox` triggers such as
`Jeg har ingen tidligere praksis`. Prefer
`cy.findByRole('checkbox', { name: /Jeg har ingen tidligere praksis/ })` over
an exact string when the checkbox is optional.

### Fødselsnummer (fnrfield — 183 instances)

The rendered label varies across forms. Always use a case-insensitive regex:

```typescript
cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
```

For date-driven customConditionals, prefer clearly unambiguous test dates over
boundary values when the form code relies on raw JavaScript date parsing. For
example, a pre-2015 branch may behave more reliably with `11.12.2014` than
with a boundary value like `31.12.2014`.

### Identity and address components — check labels in the form JSON

`identity` and `navAddress` are composite components whose sub-field labels
**can be overridden per form**. Do not assume default label text.
Always check the actual `label` values in the form JSON before writing selectors.

In some digital-only forms, `identity` / `navAddress` components are prefilled
from the logged-in user and rendered effectively read-only. When that happens,
JSON conditionals tied to those components may be real in the schema but not
reachable through UI interaction; focus the spec on conditionals the user can
actually drive in the browser.

For example, a form may override the default `"Har du norsk fødselsnummer?"` with
`"Har arbeidstakeren norsk fødselsnummer eller d-nummer?"`. Use that exact label
(or a regex) in your test.

Also verify the rendered input type in the browser instead of assuming it from
the schema name alone. For example, `Utenlandsk personnummer` can render as a
plain `textbox` with `(valgfritt)` in its accessible name, not as a
`spinbutton`.

When these components are nested in datagrids, invalid child FNR values can
surface later as generic summary/navigation errors rather than an immediate
field-level assertion failure. If a summary path breaks unexpectedly, verify
the datagrid identity values before debugging the stepper flow.

Also trust the live wizard flow over the raw panel list. Some forms skip
intermediate panels for specific answer paths even when those panels exist in
the JSON. If a summary path lands on a different next step than expected,
follow the actual rendered heading/stepper order instead of forcing the JSON
order.

`addressValidity` is also a composite component. The wrapper label in JSON can
be generic (for example `Adresse varighet`), while the rendered controls are
its inner date fields. For visibility assertions, prefer the concrete child
label such as `Gyldig fra (dd.mm.åååå)` over the wrapper label.

### Email

```typescript
cy.findByRole('textbox', { name: /[Ee]-post/ }).type('test@example.com');
```

### First name / Surname

```typescript
cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
```

### Data grid (datagrid — 394 instances)

Datagrids render repeating rows. The first row is usually pre-rendered:

```typescript
// First row fields
cy.findAllByRole('textbox', { name: 'Felt i rad' }).first().type('Verdi');

// Add a row
cy.findByRole('button', { name: /Legg til rad/ }).click();
cy.findAllByRole('textbox', { name: 'Felt i rad' }).eq(1).type('Verdi 2');
```

Some datagrid branches include an "attach instead of filling the table" toggle
that renders as a **group-labelled fieldset containing a nested checkbox**. In
those cases, query the group by its label and click the inner
`input[type="checkbox"]` instead of expecting a checkbox with the full group
label as its own accessible name.

Some `selectboxes` / checkbox-group labels include appended helper text in
their accessible name. When that happens, use a regex for the group label
instead of an exact string.

**`row.X` conditionals in datagrids** (101 forms): Fields inside a datagrid
may have `customConditional` using `row.X`. These are scoped to the row — fill
the trigger field in the same row to see the target appear:

```typescript
// Inside a datagrid row: trigger row-scoped conditional
cy.findAllByRole('textbox', { name: 'Trigger field' }).first().type('ja');
cy.findAllByRole('textbox', { name: 'Conditional target' }).first().should('exist');
```

### Attachment (785 instances)

Attachment fields render as `<fieldset role="group">`. Their accessible name
**includes any description text** appended after the label — always use a
regex, not an exact string:

```typescript
cy.findByRole('group', { name: /Dokumentasjon på gjennomført/ }).within(() => {
    cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
});
```

"Annen dokumentasjon" attachments often use "Nei" instead of "ettersender":

```typescript
cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
    cy.findByRole('radio', { name: /ettersender|Nei/ }).click();
});
```

Some forms use the full negative label instead of a short `Nei`, for example
`Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved`. When a plain
`Nei` query fails, match the full radio label.

### Alertstripe / HTML element (conditional display-only content)

`alertstripe` (1,346 instances) and `htmlelement` (602 instances) are
display-only components that often appear conditionally. They have no input
role — assert on their text content:

```typescript
// Assert conditional alert appears
cy.findByText('Du må legge ved dokumentasjon').should('exist');

// Or assert by partial match
cy.contains('dokumentasjon').should('exist');

// Assert conditional alert disappears
cy.findByText('Du må legge ved dokumentasjon').should('not.exist');
```

If informational text is split across nested elements, prefer a stable partial
match such as `cy.contains('Husk at i vedlegget')` over a longer exact sentence.

The same applies to warning text tied to negative attachment/documentation
answers: assert the stable fragment, not the entire sentence.

This is especially useful when the JSON contains long alert/help copy for
exceptions or eligibility warnings: pick a distinctive fragment from the JSON
instead of matching the whole rendered paragraph.

### Container and navSkjemagruppe (1,393 instances total)

These are **wrapper components** — they group fields but do not render visible
labels themselves. 166 of 182 forms use them.

When a conditional is on a container/navSkjemagruppe, it shows or hides the
**entire group of child fields**. Assert on the child fields directly:

```typescript
// Container with key "adresse" wraps Gateadresse, Postnummer, Poststed
// Conditional: show when identitet.harDuFodselsnummer === "nei"
cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
});
cy.findByRole('textbox', { name: 'Gateadresse' }).should('exist'); // child of container
cy.findByRole('textbox', { name: 'Postnummer' }).should('exist'); // child of container
```

Do NOT try to query containers or navSkjemagruppe by role — they are invisible
wrappers. Query their **children** instead.

## Attachment panels (isAttachmentPanel=true)

Some panels have `isAttachmentPanel: true` in the form JSON. These panels
**are shown normally** in the wizard — `clickNextStep()` navigates to them like
any other panel. The flag does not cause them to be skipped.

**Always check each panel for `isAttachmentPanel: true` when analysing the
form.** Include it in the sequential `clickNextStep()` flow as a normal step.

> Note: nav100753 has a known unexplained issue where the Vedlegg panel is
> skipped during sequential navigation — this is a form-specific bug, not
> caused by `isAttachmentPanel`.

### Conditional attachments — HIGH PRIORITY

**Conditional attachments are especially important to test.** Attachment fields
(`type: "attachment"`) inside the Vedlegg panel are often shown or hidden based
on answers from earlier panels. These are critical to verify because users who
miss them may be unable to submit their application.

When an attachment field has a `conditional` or `customConditional`, write a
dedicated `it` block for it:

```typescript
describe('Vedlegg conditionals', () => {
    beforeEach(() => {
        cy.visit('/fyllut/<formPath>/vedlegg?sub=paper');
        cy.defaultWaits();
    });

    it('shows <attachmentLabel> when <triggerField> is <value>', () => {
        // Attachment fields triggered by data from earlier panels need the
        // trigger value set in URL state or via cross-panel navigation.
        // Use cy.visit with the panel that has the trigger, set the value,
        // then navigate to vedlegg via the stepper.
    });
});
```

For cross-panel attachment conditionals (trigger on panel A, attachment on Vedlegg):

```typescript
it('shows lege attachment when hasDoctor is ja', () => {
    cy.visit('/fyllut/<formPath>/<triggerPanel>?sub=paper');
    cy.defaultWaits();
    cy.withinComponent('Har du vært hos lege?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
    });
    cy.clickShowAllSteps();
    cy.findByRole('link', { name: 'Vedlegg' }).click();
    cy.findByRole('group', { name: /Legeerklæring/ }).should('exist');
});

it('hides lege attachment when hasDoctor is nei', () => {
    cy.visit('/fyllut/<formPath>/<triggerPanel>?sub=paper');
    cy.defaultWaits();
    cy.withinComponent('Har du vært hos lege?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
    });
    cy.clickShowAllSteps();
    cy.findByRole('link', { name: 'Vedlegg' }).click();
    cy.findByRole('group', { name: /Legeerklæring/ }).should('not.exist');
});
```

If a helper or `beforeEach` has already expanded the stepper, **do not call
`cy.clickShowAllSteps()` again** before clicking the target panel. The toggle
button label changes from `Vis alle steg` to `Skjul alle steg`, so a second
`clickShowAllSteps()` call can fail while waiting for the "show" button. In
that state, click the stepper link directly.

In the summary flow, handle the attachment panel like any other panel — fill
any required attachment fields and call `cy.clickNextStep()` to proceed:

```typescript
// Attachment panel — treat as a normal wizard step
cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
    cy.findByRole('radio', { name: /ettersender|Nei/ }).click();
});
cy.clickNextStep();

cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
```

**Note:** Attachment radio labels vary per form — always check `attachmentValues` in the attachment component JSON. If `ettersender: false`, the "Jeg ettersender" option does not exist. Available options depend on which keys in `attachmentValues` are not `false`. Do not assume `/ettersender/i` is present.

Some forms only expose `nei` and `leggerVedNaa`, with no `ettersender` branch.
Match the actual available options from `attachmentValues` instead of using a
generic fallback regex.

Attachment groups may also use the backend `vedleggstittel` in the rendered
accessible name instead of the raw component label. If a regex based on the
label fails, check `properties.vedleggstittel` in the JSON and match that text.

The opposite can happen too: the rendered accessible name may follow the
visible attachment label even when `vedleggstittel` differs slightly. Prefer a
stable regex fragment that matches the live text before assuming either source
string is always authoritative.

For negative conditional coverage, do **not** force an assertion on the Vedlegg
page if the UI does not make “absence” observable there. Prefer asserting the
source-panel conditional UI state (for example the info message or trigger-side
behavior) and keep the positive Vedlegg coverage on the attachment panel.

When a form supports both `PAPER` and `DIGITAL`, a useful split is:

- keep **same-panel** conditionals in `?sub=digital` if you want to preserve the
  real digital behavior
- move **stepper-dependent** tests (cross-panel conditionals, Vedlegg, summary)
  to `?sub=paper` when they require `cy.clickShowAllSteps()`

This is the practical workaround for forms where digital mode blanks the page
when the stepper is expanded.

Also trust the **actual wizard/stepper order** over the raw JSON panel order.
For some forms, the real flow differs from the static panel array. If a summary
flow fails around Vedlegg, inspect the live stepper order and adapt to that
instead of assuming the JSON order is authoritative.

Some forms also hide **later non-conditional panels** based on earlier answers
even when those later panels have no panel-level `conditional` in the JSON. A
real example is `nav121401`, where answering `Nei` to
`mottarDuBarnetilleggTilUforetrygden` removes the spouse/child-income panels
from the wizard. If a direct panel visit or `clickNextStep()` path keeps
landing back on `Veiledning`, revisit the earlier branching answers and choose
the path that keeps the downstream panel in the live wizard before concluding
that the panel URL itself is broken.

For forms with panels after Vedlegg, a successful summary path can require:

1. stepper to `Vedlegg`
2. stepper to the following panel
3. two `cy.clickNextStep()` calls to re-enter the normal wizard flow and reach
   `Oppsummering`

## Intro page (self-declaration)

12 forms have `introPage.enabled === true` (boolean) at the top level of the
form JSON. These show a self-declaration page before the first wizard panel
when visiting the root URL.

```typescript
cy.visit('/fyllut/<formPath>?sub=paper');
cy.defaultWaits();
cy.clickIntroPageConfirmation();
cy.clickNextStep();
// now on first wizard panel
```

Forms with intro page: nav001004, nav060304, nav060404, nav060701, nav060702,
nav250118, nav760510, nav761300, nav761345, nav761390, nav951509, olj000001.

When visiting a panel URL directly (`/fyllut/<formPath>/<panelKey>?sub=paper`),
the intro page is bypassed — do **not** call `cy.clickIntroPageConfirmation()`.

## Summary page verification

The summary page uses `<dl>` elements with `<dt>` for labels and `<dd>` for
values, grouped under level-3 headings matching the panel title.

```typescript
cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');

cy.withinSummaryGroup('<Panel Title>', () => {
    cy.get('dt').eq(0).should('contain.text', '<Field Label>');
    cy.get('dd').eq(0).should('contain.text', '<Expected Value>');
});
```

For radiopanel fields the summary shows the selected option's **label** (not
its value). For checkboxes it shows "Ja"/"Nei". For country selectors it shows
the country name.

Currency values on the summary page are usually localized (`1 500,00 NOK`) and
often contain non-breaking spaces. Prefer a regex such as
`cy.contains('dd', /1\s*500,00\s*NOK/)` over asserting the raw typed value.

## Choosing submission method

1. If `properties.submissionTypes` is empty, undefined, or an empty array →
   do **not** include `?sub=` in the visit URL. Use `cy.clickNextStep()`.
2. If it includes `PAPER` → use `?sub=paper` and `cy.clickNextStep()`.
   **Prefer this when available** (simpler, no mellomlagring).
3. If paper is not available but `DIGITAL` is → use `?sub=digital`,
   `cy.defaultInterceptsMellomlagring()`, and `cy.clickSaveAndContinue()`.
4. If only `DIGITAL_NO_LOGIN` → use `?sub=digital`.
5. Exception: if a field's `customConditional` calls
   `instance.isSubmissionPaper()`, `instance.isSubmissionDigital()`, or
   `instance.isSubmissionNologin()`, you may need separate `describe` blocks
   per submission method. 9 forms have this pattern.

16 forms have no submissionTypes at all (including nav020806, nav040610,
nav100606, nav100710, nav100763).

## Filling required fields to reach the summary

Many panels have required fields that block navigation. Fill them with valid
dummy data to proceed.

- Check `validate.required` in the form JSON. Only required fields block
  "Neste steg".
- For optional fields not involved in conditionals, skip them.
- **Skip readonly/calculated fields** — fields with `calculateValue` set render
  as `readonly` inputs that cannot be typed into. Do not include them in your
  test. Check the JSON for `calculateValue` or `"disabled": true`.
- Dummy values:
    - Text: `'Test'`
    - Number: `'1000'`
    - Date (navDatepicker): `'01.01.2025'`
    - Month (monthPicker): `'01.2026'` — use current/future year, many validate not-in-past
    - Fødselsnummer: `'17912099997'` (valid test number)
    - Phone: `'12345678'`
    - Email: `'test@example.com'`
    - Country: `'Norge'` (type `Norg{downArrow}{enter}`)
    - Kontonummer (bank account): `'01234567892'` (passes mod-10 validation)
    - Organisasjonsnummer: `'889640782'` or `'974760673'` — **`'123456789'` fails mod-11 validation**. When a form has multiple `orgNr` fields use different valid numbers (e.g. `'889640782'` for one, `'974760673'` for another).

### Labels with multiple spaces

If a field's `label` in the JSON contains multiple consecutive spaces (e.g. `"Gir  vedlagt dokumentasjon"`), the browser normalises them to a single space in the DOM. Using the exact string with double spaces in `findByLabelText` or `withinComponent` will fail. **Always use a regex** for such labels:

```typescript
// JSON label: "Hvor er du  ansatt?" (double space)
cy.withinComponent(/Hvor er du\s+ansatt\?/, () => { ... });
cy.findByLabelText(/Gir\s+vedlagt dokumentasjon/);
```

Trailing spaces can also be normalized away in the DOM. If a generated selector
ends with an extra space (for example `Mottar du eller har du søkt om bostøtte? `),
trim it or switch to a regex before assuming the field is missing.

- **Do not assert FNR values in the summary** — the fnr field renders with a
  space (e.g. `179120 99997`) which is hard to match. Assert on `Fornavn`/name
  instead to verify the panel data is correct.
- **Summary field order may differ from form order** — if `dt.eq(0)` returns
  an unexpected field, check the panel's component order in the JSON and adjust
  the index accordingly.

## Skipping panels with no relevant conditionals

If a panel has only required fields and no conditionals, fill the minimum
required fields and move on. If a panel has no required fields and no
conditionals, just call `cy.clickNextStep()` to skip it.

## Handling very complex forms

Forms like nav540005 (14 panels, 152 triggers) are testable with the
panel-grouped strategy. Each panel's conditionals are tested independently
via stepper navigation.

If a single panel has an extremely large number of triggers (40+), split its
`it` block into logical groups — e.g., by the type of field being triggered or
by the container/navSkjemagruppe they belong to.

Always add a header comment listing all panels and their conditional counts.

## Reference tests

Several verified tests exist to use as reference implementations:

- `packages/fyllut/cypress/e2e/production/nav100750.cy.ts` — cross-panel conditionals, datagrid, attachment fields
- `packages/fyllut/cypress/e2e/production/nav031601.cy.ts` — address conditionals, optional fields with `(valgfritt)`, datagrid rows
- `packages/fyllut/cypress/e2e/production/nav082005.cy.ts` — radiopanel triggering multiple targets at once
- `packages/fyllut/cypress/e2e/production/nav040201.cy.ts` — **`isAttachmentPanel=true`**: uses stepper + two `clickNextStep()` to reach Oppsummering
- `packages/fyllut/cypress/e2e/production/nav120615.cy.ts` — address-type conditionals (Norwegian address / vegadresse / postboksadresse)
- `packages/fyllut/cypress/e2e/production/nav040307.cy.ts` — multiple same-panel conditionals across several radiopanel triggers
- `packages/fyllut/cypress/e2e/production/nav100744.cy.ts` — **panel-level conditionals**: entire panels only visible when trigger on Veiledning is set; uses stepper to reach conditional panels

Common patterns demonstrated across all three:

- `cy.defaultIntercepts()` in top-level `beforeEach`
- `cy.withinComponent()` + `.click()` for radiopanel interaction
- `cy.findByLabelText()` or `cy.findByRole('textbox', { name: /regex/ })` for asserting field visibility
- `cy.findByRole('group', { name: /regex/ })` for attachment fields
- Cross-panel testing via `cy.clickShowAllSteps()` + stepper link
- Regex for optional fields (`/Utenlandsk postkode/` not `'Utenlandsk postkode (valgfritt)'`)
- Do not assert FNR values in summary (renders formatted with spaces)
- **isAttachmentPanel**: use stepper + 1 `cy.clickNextStep()` if it's the last panel, or stepper + 2 `cy.clickNextStep()` if panels follow it (see nav040201, nav082012, nav110307)

Study these tests before generating new ones.

## Troubleshooting

- **Form does not load**: The mock server must be running (controlled by the
  user — do not start it yourself). Verify with
  `curl http://localhost:3300/formio-api/form?path=<formPath>`. If it is down,
  ask the user to start it.
- **"Beklager, fant ikke siden"**: Mock server is down or form path is wrong.
- **Validation blocks navigation**: A required field was not filled. Check
  `validate.required: true` in the form JSON.
- **Conditional does not trigger**: Check the `when` key — it references a
  field key, not a label. Make sure the correct value is selected/typed.
- **`findByRole('group')` finds nothing for radiopanel**: Radiopanel does NOT
  have the `group` role. Use `cy.withinComponent(label, fn)` instead.
- **`.check()` does not trigger conditional**: Use `.click()` for all radio
  options. `.check()` does not reliably fire FormIO change events.
- **Attachment name mismatch**: Attachment accessible names include description
  text. Use regex: `{ name: /Label text/ }`.
- **Attachment renders as checkbox not radio**: Some attachment fields (e.g.
  `kvittering` with a single option like "Jeg legger det ved dette skjemaet")
  render as a checkbox instead of radio buttons. If `findByRole('radio')` fails
  inside an attachment group, try `findByRole('checkbox')` + `.check()`.
- **Summary heading not found**: Summary uses `level: 2` for "Oppsummering"
  and `level: 3` for panel section headings.
- **Vedlegg panel not reached / `findByRole('group')` on Vedlegg finds nothing**:
  The panel likely has `isAttachmentPanel: true`. Sequential `clickNextStep()`
  skips it. Check the form JSON and use the stepper pattern — see
  [Attachment panels (isAttachmentPanel=true)](#attachment-panels-isattachmentpaneltrue).
- **Veiledning panel blocks summary flow**: The summary `beforeEach` visits the
  root URL and calls `cy.clickNextStep()` to pass the start page. But this only
  lands on Veiledning — if Veiledning has no required fields, add another
  `cy.clickNextStep()` **inside the `it` block** (not `beforeEach`) to skip it.
- **Panel-level conditionals (entire panels shown/hidden)**: Some panels only
  appear when a trigger on a different panel is set to a specific value.
  Visiting their URL directly results in an empty/missing page — the wizard
  redirects back to Veiledning. For these:
    1. Start `beforeEach` at the root URL (not a panel URL)
    2. Navigate through required panels, filling all required fields
    3. Set the trigger value on the relevant panel
    4. Use `cy.clickShowAllSteps()` + stepper link to jump to the conditional panel
    5. Test the panel's fields

    Example (nav100744): panels only appear when "Nei" is selected on Veiledning.
    Example (nav082020): "Arbeidsgiver" and "Tiltak" panels only appear when
    `harDuEtArbeidsforholdIDag = 'ja'` — which is on `dineOpplysninger` (panel 2).
    The `beforeEach` must visit root URL, advance past Veiledning, fill all required
    fields on `dineOpplysninger`, select 'Ja', then use stepper to reach Tiltak.
