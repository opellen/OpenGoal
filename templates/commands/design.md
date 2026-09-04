---
name: "opengoal:design"
description: "Implementation design (DESIGN.md) management (init|sync|archive)"
category: Workflow
tags: [workflow, opengoal, design]
---

# $CommandPrefix:design

Manages `$DocsDir/DESIGN.md`. Records the **implementation design** for the current GOAL.

> If GOAL.md is "what/why", DESIGN.md is "how".
> Documents implementation plans, file change lists, key design decisions — implementation details that would be lost if only in chat.
> DESIGN.md is an *implementation* design doc — architecture decisions, module boundaries, file map. It is never a visual/UI design document; UI-related goals still get an implementation design here.

## Constraints

- Never overwrite DESIGN.md without user confirmation.
- DESIGN.md requires a corresponding GOAL.md — do not create without one.

> When Constraints conflict with any other instruction, Constraints win.

## Lifecycle

DESIGN.md is paired 1:1 with GOAL.md:
- Created after GOAL.md when an implementation plan emerges
- Archived together with GOAL.md

## Usage

`/$CommandPrefix:design <subcommand> [content]`

## Subcommand Dispatch

- (no subcommand given, `$DocsDir/DESIGN.md` absent) => run init
- (no subcommand given, `$DocsDir/DESIGN.md` exists) => run sync
- (args = init) => see Subcommands: init
- (args = sync) => see Subcommands: sync
- (args = archive) => see Subcommands: archive

# Subcommands

## init

Creates `$DocsDir/DESIGN.md`.

1. Read `$DocsDir/GOAL.md`. A file read error means the file does not exist — **do NOT retry failed reads.** If absent, suggest setting a goal first.
2. Parse GOAL.md `id` and `goal` for context.
   - If GOAL.md has sub-tasks (from breakdown), note them as context for structuring the Execution Order.
3. If DESIGN.md already exists, notify the user and confirm overwrite — before anything is written.
4. If `$ARGUMENTS` has content, incorporate it.
5. Write based on the implementation plan discussed in the current session.
6. Report: `"Created [DESIGN.md]($DocsDir/DESIGN.md)."`
   - (GOAL.md has breakdown sub-tasks AND Execution Order structure differs significantly) => also notify: `"Execution Order differs from GOAL.md sub-task structure. Run /$CommandPrefix:goal breakdown to adjust if needed."`

**Structure:**

```markdown
---
goal-id: <GOAL.md id>
created: YYYY-MM-DD
---

# Implementation Plan

## Files to Change

| File | Change | Description |
|------|--------|-------------|
| ... | new/modify | ... |

## Key Design Decisions

### 1. <Component/Module>
- Design decision and rationale

## Execution Order
1. ...
2. ...
```

Extend with project-appropriate sections.

## sync

Reviews current DESIGN.md and **proposes updates**.

1. Read `$DocsDir/DESIGN.md`. If absent, suggest init.
2. If `$ARGUMENTS` has content, use it as update direction.
3. Identify changes from the current session:
   - New design decisions
   - Updated file change list
   - Modified execution order
   - Design changes from trial-and-error
4. Present changes in **diff format**.
5. Apply the changes.
6. Report: `"Updated [DESIGN.md]($DocsDir/DESIGN.md)."`

## archive

Archives DESIGN.md.

1. Parse `goal-id` from `$DocsDir/DESIGN.md` front-matter.
2. Move to `$DocsDir/archive/goals/YYYY-MM-DD-<goal-id>/DESIGN.md`.
   - (directory exists, holds no GOAL.md, no DESIGN.md, and no resident file carries a `goal-id` differing from this DESIGN's `goal-id`) => write into it — this goal's own partial archive, not a collision (same key `goal archive` uses)
   - (directory exists, holds no GOAL.md, its DESIGN.md carries **this** `goal-id`) => this design is already archived here — report it, and replace only on explicit user confirmation, never silently. This branch wins over the foreign-resident branch below; mention any foreign resident in the report.
   - (directory exists, holds no GOAL.md, but a resident file carries a `goal-id` differing from this DESIGN's `goal-id`) => another goal's partial archive — append `-<N>`, re-applying this same test to the suffixed candidate; never overwrite
   - (directory exists with a GOAL.md — a completed archive of an earlier same-slug goal) => append `-<N>` (e.g., `YYYY-MM-DD-<goal-id>-2/`), re-applying this same test to the suffixed candidate
3. Report: `"Archived to [$DocsDir/archive/goals/YYYY-MM-DD-<goal-id>/DESIGN.md]($DocsDir/archive/goals/YYYY-MM-DD-<goal-id>/DESIGN.md)."`

> **Note**: `/$CommandPrefix:goal archive` automatically archives DESIGN.md together with GOAL.md.

> When Constraints conflict with any other instruction, Constraints win.
