---
name: "opengoal:verify"
description: "Verify implementation against goal, design, and code"
category: Workflow
tags: [workflow, opengoal, verify]
---

# $CommandPrefix:verify

Cross-checks the current implementation state against GOAL.md and DESIGN.md to surface gaps before archiving.

## Constraints

<!-- @if subagent -->
- **Delegate** evidence gathering (e.g., reading files, running checks) to **subagents** — verification synthesis stays with main. Direct work is limited to one-line fixes, except where `opengoal-subagent` designates work main-only (iterative collaboration, 2nd-iteration rework, evolving design).
- Report subagent results to the user.
- (first subagent dispatch of the session, or first dispatch after a compaction) => load the `opengoal-subagent` skill BEFORE dispatching and say so in one line (e.g. "opengoal-subagent loaded — dispatching <task> → <model> (<rationale>)"). A dispatch without this load+announcement is a violation: the skill's dispatch rules (model selection/reporting, prompt requirements, post-verify) only bind once its content is actually in context.
<!-- @else -->
- Perform analysis and verification tasks directly.
- Report results to the user.
<!-- @endif -->
- Design Alignment focuses on structural decisions, not style preferences — ignore cosmetic differences.
- Task Coverage is mechanical — checkbox state vs code presence, low ambiguity.
- Assign severity based on the strongest evidence available — for a claim about the code, no concrete signal means don't flag. (Absence of implementation for an unchecked task is itself a concrete signal.)
- Omit issues without a `file:line` pointer and a concrete action.

> When Constraints conflict with any other instruction, Constraints win.

## Usage

`/$CommandPrefix:verify [focus area]`

- If `$ARGUMENTS` has content, use it as the focus area for verification.
- If empty, infer the verification scope from the current session context (recent work, active goal, design).

Verify assumes it runs in the session where the goal progress happened — its checks are grounded in that session's context, not in cross-session state.

# Workflow

## Phase 1 — Read Context

Read `$DocsDir/GOAL.md` and `$DocsDir/DESIGN.md` at once (parallel if supported, sequential otherwise). Skip if already in session context — but re-read if the goal occupying the canonical paths has changed since the last read: a `subgoal` verb, `goal suspend`/`resume`, or `goal archive`'s sub-goal completion all swap the documents at those paths. A file read error means the file does not exist — **do NOT retry failed reads.**
- If GOAL.md has front-matter `id`, glob `$DocsDir/logs/*-<goal-id>-*.md` and read the latest 1-2 for session history.

### Check Dispatch

The session-context guard precedes the file-presence rules below — when both match, it wins.

- (GOAL.md or DESIGN.md exists, but no goal progress happened in this session, `$ARGUMENTS` empty) => report: "This session carries no verifiable goal context — verify checks the session's progress. Run it in the session where the work happened, or pass a focus area." Then stop.
- (GOAL + DESIGN) => run full verification (Phases 2–4)
- (GOAL only) => skip Phase 2, run Phases 3–4
- (DESIGN only) => skip Phases 3–4, run Phase 2
- (neither, $ARGUMENTS given) => freeform check against `$ARGUMENTS`
- (neither, no $ARGUMENTS) => ask the user what to verify

## Phase 2 — Design Alignment

> Requires: DESIGN.md. Skip if absent.

Check whether the implementation follows the planned architecture.

1. Scan DESIGN.md for structural decisions (file layout, module boundaries, execution flow).
2. Compare each against the actual codebase.
3. Flag contradictions as **CONFLICT** — "Deviates from design: \<decision\>"
4. Spot new/modified files that break project conventions.
5. Flag convention breaks as **STYLE** — "Breaks project pattern: \<details\>"

## Phase 3 — Task Coverage

> Requires: GOAL.md.

Walk every checkbox in GOAL.md (including nested sub-tasks) and classify each — the pointer-task rule precedes the two evidence-based rules, so it wins over them:

- (checked `[x]`) => counted as done — a pointer task included; only `/$CommandPrefix:goal archive`'s sub-goal completion path can have checked one
- (unchecked pointer task — a `→ subgoal: <slug>` line) => **SUBGOAL** — never **REVIEW**, never **BLOCKED**, whatever the codebase shows; the evidence belongs to that goal, not this one
- (unchecked `[ ]`, codebase evidence found) => **REVIEW** — likely done but unmarked
- (unchecked `[ ]`, no codebase evidence) => **BLOCKED** — work remains

For an unchecked pointer task, report where the delegated work stands and never check it off:

Resolve each slug with `/$CommandPrefix:goal`'s `### Resolving a Pointer Task's Slug` — use that resolver, do not match slugs here:

- (parked) => report that sub-goal's own `done / total` from `$DocsDir/suspended/<slug>/GOAL.md`
- (archived) => report it archived with the pointer left unchecked
- (dangling) => report it dangling — `/$CommandPrefix:goal subgoal` lists it and explains the repair

Output: `done / total` with list of unmarked, blocked, and **SUBGOAL** items.

## Phase 4 — Intent Match

> Requires: GOAL.md with at least one completed task.

For each completed task, check whether the implementation matches what the task describes:

1. Locate relevant code paths via function names, types, or module structure.
2. Evaluate whether the code behavior matches the stated goal.
3. Flag mismatches as **DRIFT** — "Implementation differs from stated intent: \<details\>"

If `$ARGUMENTS` narrows the scope, focus on that area first.

## Phase 5 — Report

```
## Verify Summary

| Check            | Result                |
|------------------|-----------------------|
| Design Alignment | clean / N conflicts   |
| Task Coverage    | done/total (N issues) |
| Intent Match     | N drifts found        |
```

**Issues (ordered by severity):**

- **BLOCKED**: Incomplete work that must be finished
- **CONFLICT**: Implementation contradicts design decisions
- **SUBGOAL**: Task delegated to a sub-goal. A **parked** one ranks above everything that permits archiving, because each of those would send the user into `/$CommandPrefix:goal archive`'s refusal; an **archived** or **dangling** one blocks nothing and is reported for repair only
- **DRIFT**: Completed work that doesn't match stated intent
- **REVIEW**: Ambiguous situations needing user judgment
- **STYLE**: Convention deviations worth considering

### Archive Readiness

These verdicts are **advisory by design** — they inform the user's decision at verify time. `/$CommandPrefix:goal archive` reads no verify state and runs whenever its own guards pass; the intended flow is simply to run verify before archiving.

- (highest = BLOCKED or CONFLICT) => do not archive — resolve first
- (highest = SUBGOAL, at least one parked) => nothing here blocks archiving, but `/$CommandPrefix:goal archive` will refuse while that sub-goal is parked — name the slug and point at `/$CommandPrefix:goal subgoal switch <slug>` to finish it
- (highest = SUBGOAL, none parked) => it blocks nothing and decides nothing — apply this list to the highest issue below it (clear to archive if none), reporting the archived-or-dangling pointers alongside. A dangling pointer is only repairable while this goal is still active — after archiving, `subgoal init` has no goal to attach to
- (highest = DRIFT) => archive at your discretion
- (highest = REVIEW) => surface the REVIEW items and let the user decide before archiving — REVIEW means user judgment is required
- (highest = STYLE) => archive — cosmetic findings do not block
- (no issues) => clear to archive

## Work Principles

<!-- @if subagent -->
- Load the `opengoal-subagent` skill, then follow its delegation principles and workflow.
<!-- @endif -->

> When Constraints conflict with any other instruction, Constraints win.
