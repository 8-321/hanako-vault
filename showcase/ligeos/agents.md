# Project Workflow

## Goal
- Document each feature or change before implementation.
- Make technical decisions explicitly and with clear rationale.
- Keep traceability in `docs/` and in each feature's change history.

## Language Policy
- All documentation must be written in English.
- File and folder names must use English.
- Code comments must be written in English.
- This policy applies even if day-to-day conversation happens in Spanish.

## Base Structure
```text
/docs
  /features
    /<feature-slug>
      problem.md
      options.md
      decision.md
      plan.md
      /changes
        /YYYY-MM-<change-slug>
          problem.md
          options.md
          decision.md
          plan.md
  /architecture
    caching.md
    mysql-indexing.md
  /ideas
    backlog.md
```

## Required Flow (Step Approval Required)
1. `problem.md`
- Define problem, context, scope, impact, and success criteria.
- Do not move forward until this step is explicitly approved.

2. `options.md`
- List viable options (including trade-offs, cost, risk, and complexity).
- Do not move forward until this step is explicitly approved.

3. `decision.md`
- Select one option and justify the decision (including why others were not chosen).
- Do not move forward until this step is explicitly approved.

4. `plan.md`
- Define the implementation plan (tasks, sequence, risks, validation, and rollback).
- Do not implement anything until this step is explicitly approved.

## Golden Rule
- Each step must reach `Approved` status before opening the next step.
- If scope changes, reopen the flow from the appropriate document.

## Document Status Block (Required)
- Every workflow document must end with a `## Status` section.
- This applies to:
  - `problem.md`
  - `options.md`
  - `decision.md`
  - `plan.md`
- The status must always be explicit, even when not approved yet.
- Use one of these values:
  - `Approved` (YYYY-MM-DD)
  - `Pending Approval` (YYYY-MM-DD)
  - `Rejected` (YYYY-MM-DD)
- Example:
  - `Approved` (2026-04-11)

## Feature Isolation and Clarification
- Do not read documentation from other feature folders under `docs/features/` by default.
- Other features can be read only with explicit user authorization.
- If there is any doubt, ambiguity, or missing context, ask the user before proceeding.

## Status
- `Approved` (2026-04-11)
