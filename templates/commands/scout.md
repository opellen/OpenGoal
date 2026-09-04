---
name: "opengoal:scout"
description: "Project scout (project-name)"
category: Workflow
tags: [workflow, opengoal, scout]
---

# $CommandPrefix:scout

## Constraints

- (command entry, and again on the first turn after a compaction) => load the `opengoal-flow` skill BEFORE reporting status, and say so in one line. A reference is not a load: its rules (checkpoint triggers, documentation timing, CONTEXT.md self-sync, self-verification) only bind once the skill's content is actually in context.
<!-- @if subagent -->
- **Delegate** exploration tasks (e.g., file discovery, keyword search, tracing) to **subagents** — analysis and judgment stay with main. Direct implementation work is limited to one-line fixes, except where `opengoal-subagent` designates work main-only (iterative collaboration, 2nd-iteration rework, evolving design).
- Report subagent results to the user.
- (first subagent dispatch of the session, or first dispatch after a compaction) => load the `opengoal-subagent` skill BEFORE dispatching and say so in one line (e.g. "opengoal-subagent loaded — dispatching <task> → <model> (<rationale>)"). A dispatch without this load+announcement is a violation: the skill's dispatch rules (model selection/reporting, prompt requirements, post-verify) only bind once its content is actually in context.
<!-- @else -->
- Perform analysis and implementation tasks directly.
- Report results to the user.
<!-- @endif -->
- Report status based solely on docs files read during initialization — this includes the `$DocsDir/suspended/*/GOAL.md` front-matter reads in step 2 below and, when a pointer task needs resolving, listing `$DocsDir/archive/goals/` and reading a matching directory's GOAL.md front-matter (the resolver's `parent:` check) — do not read other files proactively.
- Keep suggestions to 1-2 lines — follow the user's direction if they want something different.
- Skip suggestions if the user starts with a specific task instruction.
- GOAL.md tasks are always the unit of progress — DESIGN.md is a reference document, not a progress tracker.
- In Discovery Mode: don't rush to formalize — sometimes thinking IS the value.
- (creating CONTEXT.md) => suggest `/$CommandPrefix:context init` — do not write CONTEXT.md directly.
- (creating GOAL.md) => suggest `/$CommandPrefix:goal init` — do not write GOAL.md directly.

> When Constraints conflict with any other instruction, Constraints win.

# Session Initialization

1. Read all of these files at once (parallel if supported, sequential otherwise):
   - `$DocsDir/CONTEXT.md`, `$DocsDir/GOAL.md`, `$DocsDir/DESIGN.md`, `$DocsDir/PLAN.md`, `$DocsDir/ROADMAP.md`, `$DocsDir/CHECKPOINT.md`
   - A file read error means the file does not exist — mark it as "not present" and move on. **Do NOT retry failed reads.**
2. Always check for suspended goals by listing `$DocsDir/suspended/` (this can be a separate call only if needed), and read the front-matter of each `$DocsDir/suspended/*/GOAL.md` — the same read `goal.md`'s `resume` candidate list and `subgoal`'s Lineage Validation already perform. This is what surfaces a parked parent or sibling even while a sub-goal is the active GOAL.md.
3. If no GOAL.md exists, also read `$DocsDir/BACKLOG.md` (skip this read when a GOAL is active).
4. Report status based solely on the above files, then suggest the next action based on the dispatch rules below.
   - (the active goal has `parent:`, or a suspended goal's front-matter has `parent:` equal to the active goal's `id`) => report the four kinds `goal.md`'s `subgoal list` uses: **Active scope** (the active goal's `id`, and its `parent:` if present); **Parked sub-goals of this lineage** (children of the active goal, and siblings sharing its `parent:`); **the parent**, shown only when the active goal has `parent:`, together with its return promise — it comes back automatically when this sub-goal completes via `/$CommandPrefix:goal archive`, or immediately via `/$CommandPrefix:goal subgoal pause`; **Unrelated peer goals** (suspended goals outside this lineage).
   - (no active GOAL.md, a suspended goal carries `parent:`) => group the parked sub-goals under their `parent:` alongside the peer goals, so the lineage is visible before `/$CommandPrefix:goal resume` runs.
   - (otherwise) => no lineage grouping; report suspended goals per State Dispatch below, unchanged. This suppresses the four-kind presentation only — it never suppresses the goals themselves.
   - (a `→ subgoal: <slug>` pointer task in GOAL.md resolves to **dangling** per `/$CommandPrefix:goal`'s `### Resolving a Pointer Task's Slug`) => report it as a repairable inconsistency, not an error. Use that resolver; do not match slugs here.
   - (DESIGN.md's or CHECKPOINT.md's front-matter `goal-id` — or PLAN.md's, when it carries one — differs from GOAL.md's `id`) => report it as a repairable inconsistency: an interrupted `suspend`/`resume`/`archive` move left another goal's document at the canonical path. Report only; do not repair.

## State Dispatch

Three exclusive tiers — no CONTEXT.md and no GOAL.md, CONTEXT.md present without GOAL.md, GOAL.md present. Exactly one rule fires per session start; within each tier the conditions are mutually exclusive.

Tier 1 — no CONTEXT.md and no GOAL.md (an active GOAL.md without CONTEXT.md is unusual but belongs to Tier 3 — work proceeds, and Documentation Timing may suggest `/$CommandPrefix:context init` later):

- (no CONTEXT.md, no GOAL.md, no/minimal code — no source files yet; a README or manifest alone is still minimal) => enter **Discovery Mode**
- (no CONTEXT.md, no GOAL.md, existing codebase — source files present) => suggest `/$CommandPrefix:context init`

Tier 2 — CONTEXT.md present, no GOAL.md (parked work outranks new work):

- (suspended goals exist) => list suspended goals, suggest `/$CommandPrefix:goal resume`
- (no suspended goals, BACKLOG.md has open items) => list items as next-goal candidates, suggest `/$CommandPrefix:goal init`
- (no suspended goals, no open BACKLOG items, ROADMAP.md exists) => suggest picking a milestone from ROADMAP.md and starting with `/$CommandPrefix:goal init`
- (no suspended goals, no open BACKLOG items, no ROADMAP.md) => suggest `/$CommandPrefix:goal init` or `/$CommandPrefix:roadmap init`

Tier 3 — GOAL.md present. Showing the checkpoint summary is a display action, not a handoff — it never competes with the suggestion:

- (CHECKPOINT.md exists) => show the checkpoint summary first, then apply the one matching suggestion rule below
- (no incomplete tasks remain) => suggest `/$CommandPrefix:goal archive`
- (every remaining incomplete task is a pointer task) => suggest by the resolver's state — `/$CommandPrefix:goal subgoal switch <slug>` for the first parked one, or `/$CommandPrefix:goal archive` when none is parked (an archived pointer's check-off and a dangling one's repair are offered by bare `/$CommandPrefix:goal subgoal`) — rather than bouncing the user through `/$CommandPrefix:go`
- (a non-pointer incomplete task remains, it is implementation work, no DESIGN.md) => suggest `/$CommandPrefix:design init`
- (a non-pointer incomplete task remains — otherwise: DESIGN.md exists, or the task is analysis) => suggest `/$CommandPrefix:go`

**Implementation vs Analysis criteria**: If GOAL.md sub-tasks contain keywords like "analyze", "investigate", "audit", "research", "document", "RE", or the deliverable is an `.md` analysis doc, it's an analysis task. If the goal is coding, porting, implementation, file changes, or architecture decisions, it's an implementation task. **A mixed goal is classified by its next incomplete task** — the one `/$CommandPrefix:go` would pick up — not by the goal as a whole.

# Discovery Mode

When the user's intent is unclear or exploratory (`/$CommandPrefix:scout` with no specific task, or a vague topic):

- Be curious, not prescriptive — ask questions, don't follow a script
- Explore multiple directions and let the user follow what resonates
- Visualize with ASCII diagrams when they'd help clarify thinking
- Ground discussions in actual codebase, don't just theorize
- When insights crystallize, use the corresponding commands to capture them:
  - Project context => run `/$CommandPrefix:context init`
  - First objective => suggest `/$CommandPrefix:goal init`

# Work Principles
- Load the `opengoal-flow` skill, then follow its main-agent flow principles (documentation timing, CONTEXT.md self-sync, OVERVIEW.md reactive read, checkpoints, self-verification).
<!-- @if subagent -->
- Load the `opengoal-subagent` skill, then follow its delegation principles and workflow.
<!-- @endif -->

> When Constraints conflict with any other instruction, Constraints win.
