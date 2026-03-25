---
name: implementation-plan-progress-sync
description: >-
    Keep implementation progress synchronized in canonical .plans plan files,
    including task completion tracking and status badge transitions during
    execution.
---

# Implementation plan progress synchronization

## Goal

Ensure implementation execution progress is continuously reflected in the
canonical `.plans/...` plan file so reviewers can see exact completion status
at any point in time.

Use this skill when implementing work from an existing implementation plan.

## Canonical source of truth

- The plan under `.plans/` is the authoritative plan.
- If a session-state copy exists (for example
  `~/.copilot/session-state/.../plan.md`), it is secondary and must mirror the
  `.plans` file.
- On mismatch, update the session-state copy to match `.plans`.

## Execution-time update rules

During implementation, update the `.plans` file continuously:

1. Before starting a task, ensure the plan status reflects active execution:
    - front matter `status: In progress`
    - introduction badge: `![Status: In progress](https://img.shields.io/badge/status-In%20progress-yellow)`
2. When a task is completed, mark that task row in the relevant phase table:
    - `Completed` column to `✅`
    - `Date` column to the completion date (`YYYY-MM-DD`)
3. Keep task updates granular; do not batch all tasks at the end.
4. After updating `.plans`, synchronize any session-state copy so content
   remains equivalent.

## Phase completion gate

A phase may be considered complete only when:

- all implementation tasks in that phase are marked complete,
- test update/addition tasks in that phase are marked complete,
- and test/check execution tasks in that phase are marked complete with passing
  results.

Do not mark a phase as complete if its tests have not been updated and passed.

## Plan completion gate

When all phases are complete:

1. Update front matter status to `Completed`
2. Update introduction badge to:
   `![Status: Completed](https://img.shields.io/badge/status-Completed-brightgreen)`
3. Ensure no remaining unchecked tasks exist
4. Synchronize any session-state copy from `.plans`

## Validation checklist

- `.plans` file exists and is updated first
- Task tables reflect real progress with `✅` and dates
- status badge and front matter status match
- phase test gates are satisfied before phase completion
- session-state copy (if present) matches `.plans`
