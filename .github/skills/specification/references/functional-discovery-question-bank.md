# Functional specification discovery question bank

Use this as a question bank, not a questionnaire to send wholesale. Ask one
focused question at a time. Ask only decisions whose prerequisites are settled,
and investigate facts that can be established from the repository or other
reliable sources.

Phrase every question in plain product language for a functional architect or
designer. When a request starts with a proposed technical solution, discover
the underlying user need before discussing the proposed element.

## Product intent

- Who is affected? Include distinct roles when their permissions or needs differ.
- What must they achieve, and what prevents it today?
- What is verified current behavior, and what is only reported or assumed?
- What user, business, or service outcome defines success?
- Which product surface and starting context are affected?
- Is this a new capability, a correction, a replacement, or a removal?
- What remains unchanged?
- Are any terms vague, overloaded, or inconsistent with existing product
  language?

## Journey and behavior

- What starts the journey? Is there more than one entry point?
- What does the user see before acting, and what information do they need?
- What actions can they take, in what order, and which are optional?
- What ends the journey successfully? What happens next?
- Can the user pause, go back, edit, cancel, or resume? What must be preserved?
- Does a previous answer, role, state, or date change what is shown or allowed?
- What state can the user return from, and what state can they return to?
- What happens when an action is repeated, interrupted, undone, or performed in
  another tab or session?
- Are there deadlines, time zones, expiry, or duplicate-action considerations?
- If both fyllut and bygger are affected, what must remain consistent between
  authoring, preview, completion, summary, and submission?
- Which concrete scenario would expose a misunderstanding about the journey?

## Forms and user-entered information

- Which answers are required, optional, conditionally required, or read-only?
- What are representative examples of answers that should and should not be
  accepted?
- What labels, descriptions, examples, help, and error messages are required?
- What makes an answer valid or invalid from the user's perspective?
- Does the change intentionally need different validation timing or recovery
  from the `frontend-development` defaults? If not, apply them without asking.
- Can multiple errors occur together? Which errors block progression or
  submission?
- What happens to hidden, changed, removed, or previously saved answers?
- What happens when an author changes a form that already has saved or
  submitted answers?
- Are attachments, consent, declarations, personal data, or an explicit review
  before submission involved?
- What must the summary, receipt, and any confirmation communicate?
- Must calculated, repeated, prefilled, or externally sourced values behave
  differently from directly entered answers?

## Failure paths and boundaries

- What happens when information is unavailable, stale, conflicting, or missing?
- What happens on an unsuccessful save, submission, upload, or lookup?
- Can the user retry safely, receive help, or continue later?
- Are roles, eligibility rules, privacy, consent, retention, or audit needs
  relevant?
- Are there relevant language variants, plain-language/content approval, or
  legal requirements?
- Does the feature depend on another team, policy decision, content, service,
  rollout date, or analytics definition?
- Which uncertainties need research, a prototype, content testing, policy
  clarification, or another owner rather than another interview question?
- Which remaining uncertainties are technical planning topics rather than
  functional product decisions?
- If someone else owns an answer, who is it, what exactly must they decide, and
  what behavior depends on it?
