---
name: create-implementation-plan
description: >-
    Use when creating or updating a repository implementation plan file.
---

# Create Implementation Plan

## Source of truth

- Create repository plan files only in `.plans/`.
- Filename: `.plans/YYYY-MM-DD-<purpose>-<summary>.md`.
- Use lowercase kebab-case for `<purpose>` and `<summary>`.
- Do not create repository plan files anywhere else.
- Session `plan.md` is not the repository plan file.

## Contents of plan document

- State the problem and approach briefly.
- For each task or phase, name the expected test coverage.
- Add or update tests with the code they cover. Do not defer testing.
- A phase is not complete until its named tests pass.
