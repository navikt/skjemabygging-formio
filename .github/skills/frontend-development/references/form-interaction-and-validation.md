# Form interaction, validation, and formatting

These are the defaults for the new renderer.

## Validation and input errors

- Do not show errors merely because a page contains invalid values.
- A failed **next** action enables input errors for the current page.
- A failed **submit** or **instructions** action on the summary page enables
  input errors for every invalid page.
- Keep a page in error state until all its errors are fixed.
- When returning to a page in error state, show its input errors without
  showing the error summary.
- While a page is in error state, recompute errors when values or active
  components change. Add newly relevant errors and remove fixed errors
  immediately.
- Do not run non-required validation for an empty optional field.
- Hidden or inactive fields must not show errors or appear in the error summary.

## Error summary

- Show the summary only after a failed next, submit, or instructions action.
- On a form page, include errors from that page. On the summary page, include
  errors from every invalid page.
- Place it immediately above the bottom navigation row and move focus to it
  when it appears.
- Keep a visible summary synchronized as errors change.
- Remove it when its errors are fixed or the user leaves the page.
- Make every item focus the affected field or group, including fields on
  another page.
- Preserve the entered answer and use the same actionable, translated message
  at the input and in the summary.

## Navigation and focus

- Do not carry a visible error summary to another page.
- After ordinary page navigation, focus the new page heading.
- When following a summary item, focus the target field instead.
- Preserve focus when conditional content rerenders around the active field.
- Do not move focus merely because validation state or helper text changed.

When changing summary or focus behavior, verify screen-reader announcement and
navigation manually in addition to automated DOM-focus coverage.

## Input formatting

- Keep the displayed value exactly as entered while the user is typing.
- On every change, update state with the submission representation so
  validation, conditionals, and autosave receive current canonical data.
- On blur, format the displayed value using the component's input format. Blur
  does not enable error display.
- When a field appears with an existing value, convert it to input format before
  displaying it.
- Keep input, state/submission, summary, and PDF representations separate.
- Formatters must tolerate partial or invalid input and be idempotent.

## Component formats

- **Identity number:** accept spaces, store digits, and display one space after
  the first six digits on blur.
- **Date:** use Aksel DatePicker input behavior and store valid dates in the
  submission format.
- **Integer:** accept spaces and display spaces as thousand separators on blur.
- **Decimal:** accept dot or comma as the decimal separator and spaces as
  thousand separators; display a comma and grouped thousands on blur.
- **Phone without country-specific formatting:** accept spaces, store digits,
  and remove spaces from the display on blur.
- **Norwegian phone with `+47`:** accept spaced or unspaced input and display
  `2+2+2+2` groups on blur.

The renderer accepts `3+2+3` spacing while editing, but it is not a default
display format.

## Conditional fields

- Validate a field only while it is active.
- Preserve or clear hidden values according to `clearOnHide`.
- When a field becomes visible again, its value and validation state must
  reflect that setting.
- Cover hide, reveal, save/resume, summary, and submission behavior when these
  rules change.

## Maintenance

When a default changes, update the implementation, tests, and this reference
together. Do not add proposed behavior before it is approved and implemented.
