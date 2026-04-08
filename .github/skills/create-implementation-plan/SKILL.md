---
name: create-implementation-plan
description: 'Create a new implementation plan file for new features, refactoring existing code or upgrading packages, design, architecture or infrastructure.'
---

# Create Implementation Plan

## Output File Specifications

- Save implementation plan files only under `.plans/`.
- Use a readable kebab-case filename that clearly reflects the plan purpose.
- Prefer the pattern `.plans/<date>-<purpose>-<short-summary>.md`, where `<date>` has format YYYY-MM-DD, and `<purpose>` is something sensible like `feature`, `refactor`, `fix`, `tech-debt`, or `chore`.
- Do not create implementation plan files outside `.plans/`.

## Testing discipline

- Plans should explicitly name the expected test coverage for each task or phase, including relevant test types (unit, e2e) and critical paths.
- Tests should be added or updated alongside the code they cover, not deferred to a later dedicated testing phase.
- Do not consider a phase complete until tests are green.
