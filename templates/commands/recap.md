---
name: "opengoal:recap"
description: "Session wrap-up — sync decisions into living documents"
category: Workflow
tags: [workflow, opengoal, recap]
---

# $CommandPrefix:recap

Wraps up the current session by syncing important decisions and findings into the project's living documents.

> Recap is not an archival tool. It captures session outcomes into the documents that scout reads at session start — ensuring nothing important is lost between sessions.

## Constraints

- (command entry, and again on the first turn after a compaction) => load the `opengoal-flow` skill BEFORE writing to any document, and say so in one line. A reference is not a load: its rules (the blocker / sub-goal / backlog discriminant that decides where a scanned finding belongs, self-verification before marking anything done) only bind once the skill's content is actually in context.
- Living documents only — recap updates CONTEXT.md, DESIGN.md, OVERVIEW.md, GOAL.md. Never create new archival files.
- No duplication — if a change is already reflected in a document, skip it.
- No session transcripts — show what changes, not conversation replay.
- Preserve rejected alternatives — when a decision was made, note what was considered but not chosen.
- Active goal only — recap writes to the documents at the canonical `$DocsDir/` paths and never into `$DocsDir/suspended/`; a `subgoal` verb mid-session changes which goal those paths hold.
- (a goal-scoped finding — DESIGN.md or GOAL.md material — belongs to a goal parked earlier in the session) => report it to the user instead of writing it; to record it, bring that goal back first and re-run recap: the active sub-goal's parent => `/$CommandPrefix:goal subgoal pause`; an ancestor above the parent => repeat `/$CommandPrefix:goal subgoal pause` until it is active; a parked child or sibling => `/$CommandPrefix:goal subgoal switch <slug>`; an unrelated peer => `/$CommandPrefix:goal subgoal pause` until no `parent:` remains, then `/$CommandPrefix:goal suspend` and `/$CommandPrefix:goal resume <id>`. CONTEXT.md and OVERVIEW.md are project-scoped and never parked — goal parking never withholds findings for them; their *absence* is a different matter, governed by Phase 2's absent-target rule.
- (a GOAL.md task is a pointer task — a `→ subgoal: <slug>` line) => never check it off; only `/$CommandPrefix:goal archive`'s sub-goal completion path may.

> When Constraints conflict with any other instruction, Constraints win.

## Usage

`/$CommandPrefix:recap [focus description]`

## Dispatch Rules

- ($ARGUMENTS has content) => focus scan on that aspect of the session
- ($ARGUMENTS empty) => review the overall session for sync-worthy changes

## Phase 1 — Scan

1. Scan the session for decisions, discoveries, and changes that affect project context:
   - Architecture or design decisions
   - New principles or workflow changes
   - Goal progress or status changes
   - Project-level understanding changes
2. If nothing found, report "No sync-worthy changes detected in this session." and end.

## Phase 2 — Categorize

Route each finding to its target document. Only the active goal's documents are routing targets — see Constraints. Recap applies the updates itself in Phase 3 (diff, then apply) — it never invokes another command's procedure.

- (working context changes: principles, workflow, resources) => CONTEXT.md
- (implementation decisions, design changes) => DESIGN.md
- (project-level understanding: architecture, stack, strategy) => OVERVIEW.md
- (a routed target — CONTEXT.md, DESIGN.md, OVERVIEW.md, or GOAL.md — does not exist) => skip that routing entirely; a document the project never created is one it has not needed, so there is nothing to sync. This includes one altitude of a dual-altitude finding — the existing altitude's target still writes. Do not create the absent document and do not suggest creating it — Phase 3's report already lists only the documents actually updated. This rule precedes every routing bullet in this Phase, Constraints' project-scoped note included.
- (a finding carries both altitudes — e.g. an architecture decision made while implementing) => route it once per altitude — two targets, one finding, not a copy:
  - the goal-scoped record => DESIGN.md
  - the project-level summary => OVERVIEW.md
- (goal progress, task completion) => GOAL.md — update checkboxes directly, pointer tasks excepted (see Constraints)

## Phase 3 — Present and Apply

1. Present a unified diff to the user:
   ```
   ## Recap — proposed updates

   ### CONTEXT.md
   - Add: new workflow step for ...
   - Update: resource path changed to ...

   ### DESIGN.md
   - Add: decision to use X instead of Y ...

   ### GOAL.md
   - [x] Task 3: completed during this session
   ```
2. Apply the changes.
3. Report: `"Updated <N> document(s): [CONTEXT.md]($DocsDir/CONTEXT.md), [DESIGN.md]($DocsDir/DESIGN.md), ..."` — list only the documents actually modified.

> When Constraints conflict with any other instruction, Constraints win.
