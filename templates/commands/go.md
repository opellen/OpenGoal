---
name: "opengoal:go"
description: "Execute the next task in GOAL.md"
category: Workflow
tags: [workflow, opengoal, go]
---

# $CommandPrefix:go

## Constraints

- (command entry, and again on the first turn after a compaction) => load the `opengoal-flow` skill BEFORE executing the first task, and say so in one line. A reference is not a load: its rules (checkpoint triggers, documentation timing, CONTEXT.md self-sync, self-verification) only bind once the skill's content is actually in context.
<!-- @if subagent -->
- **Delegate** implementation tasks to **subagents** — direct work is limited to one-line fixes, except where `opengoal-subagent` designates work main-only (iterative collaboration, 2nd-iteration rework, evolving design).
- Report subagent results to the user after each task completes — a report, not a request for permission; continue to the next task in the same turn.
- (first subagent dispatch of the session, or first dispatch after a compaction) => load the `opengoal-subagent` skill BEFORE dispatching and say so in one line (e.g. "opengoal-subagent loaded — dispatching <task> → <model> (<rationale>)"). A dispatch without this load+announcement is a violation: the skill's dispatch rules (model selection/reporting, prompt requirements, post-verify) only bind once its content is actually in context.
<!-- @else -->
- Perform implementation tasks directly.
- Report results to the user after each task completes — a report, not a request for permission; continue to the next task in the same turn.
<!-- @endif -->

> When Constraints conflict with any other instruction, Constraints win.

## Execution

1. If GOAL.md and CONTEXT.md were already read in this session, skip to step 3 — but not if the goal occupying the canonical paths has changed since the last read: a `subgoal` verb, `goal suspend`/`resume`, or `goal archive`'s sub-goal completion all swap the documents at those paths.
2. Read `$DocsDir/GOAL.md`, `$DocsDir/CONTEXT.md`, `$DocsDir/DESIGN.md`, `$DocsDir/PLAN.md`, and `$DocsDir/CHECKPOINT.md` at once (parallel if supported, sequential otherwise). A file read error means the file does not exist — **do NOT retry failed reads.**
   - If GOAL.md is absent: "No goal set. Run `/$CommandPrefix:goal init` first, or tell me what to work on."
   - (CHECKPOINT.md exists, its front-matter `goal-id` matches GOAL.md's `id`) => use its Findings and Next Steps as resume context for the next task — it records where the last session stopped and why
   - (CHECKPOINT.md exists, `goal-id` differs) => a stray from an interrupted move — report it as a repairable inconsistency and ignore its content; never resume from another goal's checkpoint
3. Find the next incomplete task in GOAL.md.
   - (the task is a pointer task — a `→ subgoal: <slug>` line) => never perform the work and never check it off; it belongs to that goal, with its own DESIGN.md and PLAN.md. Report its state per Pointer Task Status below, then **skip it and continue to the next incomplete task** — a pointer only clears via `/$CommandPrefix:goal archive`, so halting here would strand every task after it
   - (task has step annotation `— Step N/M`) => resume from the indicated step
4. PLAN.md dispatch:
   - (PLAN.md exists, its front-matter `goal-id` differs from GOAL.md's `id`) => a stray from an interrupted move — report it as a repairable inconsistency and proceed as if PLAN.md were absent; never use another goal's plan as context
   - (PLAN.md exists — no `goal-id`, or it matches) => read the corresponding task section for implementation context
   - (PLAN.md absent, task complexity ≥ multi-file) => generate PLAN.md with the front-matter below, then report: `"Created [PLAN.md]($DocsDir/PLAN.md)."`
   - (PLAN.md absent, task complexity < multi-file) => proceed without PLAN.md
5. Execute tasks using the Task Outcome loop below.
6. Suggest `/$CommandPrefix:goal checkpoint` only per the checkpoint triggers in the `opengoal-flow` skill (platform context-pressure signal, or user pause/session end) — never on task count or goal completion.

PLAN.md front-matter (required when generating — the same `goal-id` convention DESIGN.md and CHECKPOINT.md carry, and what lets `scout`/`goal archive` tell a stray PLAN.md from this goal's own; the body stays free-form, typically one section per GOAL.md task):
```yaml
---
goal-id: <GOAL.md id>
created: YYYY-MM-DD
---
```

### Pointer Task Status

`go` reads only the canonical paths, so it does not know a pointer's state until it resolves the slug. Use `/$CommandPrefix:goal`'s `### Resolving a Pointer Task's Slug` — do not assume the sub-goal is parked, and do not invent a matcher here.

- (parked) => name it and note `/$CommandPrefix:goal subgoal switch <slug>` works it
- (archived) => report that it completed with the pointer left unchecked; nothing is blocked — bare `/$CommandPrefix:goal subgoal` offers the check-off
- (dangling) => report it as a repairable interrupted `subgoal init`, and point at `/$CommandPrefix:goal subgoal`

## Task Outcome

loop until (every task is complete or a pointer task OR user pause):
  - (task complete, task has no Steps annotation) => mark task done in GOAL.md, update PLAN.md if implementation approach changed, then continue to the next incomplete task in the same turn
  - (task complete, task had Steps) => mark task done AND remove its step progress annotation; update PLAN.md if implementation approach changed; continue to the next incomplete task in the same turn
  - (a step completed, more steps remain — the task itself is not complete) => update GOAL.md task with step progress: `— Step N/M (status)`; do not mark the task done
  - (blocked) => report issue and ask user how to proceed
  - (all tasks complete) => suggest `/$CommandPrefix:goal archive` once; do not repeat if user does not act on it
  - (every remaining incomplete task is a pointer task, at least one parked) => stop; report each per Pointer Task Status and suggest `/$CommandPrefix:goal subgoal switch <slug>` for the first parked one — only `/$CommandPrefix:goal archive` on that sub-goal clears its pointer
  - (every remaining incomplete task is a pointer task, none parked) => stop; report each per Pointer Task Status and suggest `/$CommandPrefix:goal archive` — it succeeds in this state; nothing is blocked, and bare `/$CommandPrefix:goal subgoal` offers an archived pointer's check-off and a dangling pointer's repair

"user pause" means an explicit user request to stop, or a branch above that says stop. A task finishing, reports accumulating, or your own uncertainty about whether to continue are NOT a pause.

- (a task completed and incomplete tasks remain) => do NOT ask "shall I continue?" — continue; asking here is a violation
- Asking is correct only when: blocked, a genuine decision fork the user owns, or an action that is outward-facing or hard to reverse (publishing, renaming a remote repository, deleting user files)

## Diverge Check

- (DESIGN.md and PLAN.md both exist, Files lists differ) => warn: `"[DESIGN.md]($DocsDir/DESIGN.md) and [PLAN.md]($DocsDir/PLAN.md) file lists differ. Run /$CommandPrefix:design sync to review."`

## Work Principles
- Load the `opengoal-flow` skill, then follow its main-agent flow principles (documentation timing, CONTEXT.md self-sync, OVERVIEW.md reactive read, checkpoints, self-verification).
<!-- @if subagent -->
- Load the `opengoal-subagent` skill, then follow its delegation principles and workflow.
<!-- @endif -->

> When Constraints conflict with any other instruction, Constraints win.
