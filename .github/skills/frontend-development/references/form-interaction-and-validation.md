# Form interaction, validation, and formatting

These defaults are verified against the new renderer on `fyllut2-render`.
They describe user behavior rather than a specific form framework.

## Validation state

- Do not show input errors or an error summary merely because a page contains
  invalid values.
- A failed **next** action marks the current page as having errors.
- A failed **submit** or **instructions** action on the summary page marks every
  invalid page as having errors.
- Keep a page in error state until all errors on that page are fixed.
- When the user visits a page already in error state, show its input errors
  without showing the error summary.
- While a page is in error state, recompute its errors on every value or active
  component change. Add newly relevant errors and remove fixed errors.
- Do not run non-required validation for an empty optional field.

Do not ask the user to choose this state model unless the product requirement
intentionally changes it.

## Error summary

- Show the error summary only after a failed next, submit, or instructions
  action.
- On a form page, show errors for that page. On the summary page, show errors
  for all invalid pages.
- Place the error summary immediately above the bottom navigation row.
- Move focus to the error summary when it appears.
- Keep a visible summary synchronized when errors are added or fixed.
- Remove the summary when the user leaves the page or fixes every error in its
  scope.
- Each summary item must move focus to the affected field or group, including
  fields on another page.
- Keep the entered answer after an unsuccessful action.
- Use the same actionable, translated message at the input and in the summary.

The focus behavior has automated DOM-focus coverage. When changing the summary
component or focus strategy, also verify the announcement and navigation with a
screen reader.

## Input errors

- Show the component's error styling and message only when its page is in error
  state.
- A failed next action enables input errors for the current page.
- A failed submit or instructions action enables input errors for every invalid
  page.
- Remove an input error on change as soon as its value becomes valid.
- If a new component becomes active on a page already in error state, validate
  it immediately and show its error when invalid.
- Hidden or inactive fields must not keep visible errors or appear in the error
  summary.

## Navigation and focus

- Do not carry a visible error summary to another page.
- After ordinary page navigation, move focus to the new page heading.
- When navigating from a summary item, move focus to the target field instead
  of the page heading.
- Preserve focus when conditional content rerenders around the active field.
- Do not move focus merely because validation state or helper text changed.
- Ensure hidden or disabled controls cannot retain keyboard focus.

## Input formatting contract

- Never reformat the displayed value while the user is typing.
- Update state on every change using the submission representation, so
  validation, conditionals, and autosave see current canonical data.
- Format the displayed value on blur using the component's input format.
- When a field first appears, convert an existing state or submission value to
  input format before displaying it.
- A formatter must tolerate partial and invalid input. It must not corrupt a
  value while the user is still entering it.
- A formatter must be idempotent.
- Input, state/submission, summary, and PDF may use different representations
  of the same value. Define and test each boundary explicitly.

Blur is a formatting event in the new renderer. It must not create a new input
error unless the page is already in error state.

## Verified component formats

- **Identity number:** accept spaces and display one space after the first six
  digits on blur; store and submit digits only.
- **Date:** use Aksel DatePicker's input behavior and convert valid dates to the
  submission date format.
- **Integer:** accept spaces and display spaces as thousand separators on blur.
- **Decimal:** accept dot or comma as the decimal separator, accept spaces as
  thousand separators, and display a comma with grouped thousands on blur.
- **Phone without country-specific formatting:** accept spaces, remove them
  from state/submission, and display no spaces after blur.
- **Norwegian phone with `+47`:** accept spaced or unspaced input and display
  the number in `2+2+2+2` groups on blur.

Do not document `3+2+3` as the default phone display format. The rewrite
accepts that spacing while editing but normalizes `+47` display to `2+2+2+2`
and generic phone display to no spaces.

## Conditional fields

- Apply required and other validation only while a field is active.
- Preserve or clear hidden values according to the configured `clearOnHide`
  behavior.
- When a field becomes visible again, its value and validation state must match
  that configuration.
- Cover hide, reveal, save/resume, summary, and submission effects when changing
  conditional behavior.

## Maintaining these rules

Treat these rules as the expected frontend behavior, not as a record of one
implementation. When a default changes, update the implementation, tests, and
this reference together. Do not document proposed behavior here until it has
been approved and implemented.
