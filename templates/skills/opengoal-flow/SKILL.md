---
name: opengoal-flow
description: Main-agent flow principles for opengoal workflows — documentation timing, CONTEXT.md self-sync, checkpoint triggers, OVERVIEW.md reactive read, self-verification, and decision support. Use whenever the main agent is driving an opengoal session, regardless of subagent availability.
license: MIT
metadata:
  version: "1.0"
  generatedBy: $OpenGoalVersion
---

# opengoal-flow

## Constraints

- Never execute documentation commands automatically — suggest only.
- At most one documentation suggestion per turn — when several triggers fire, pick the highest-value one and drop the rest.
- (a suggestion was made and the user did not act on it) => do not repeat it this session unless the user asks or new evidence changes the case. Silence is an answer. Exception: the single wrap-up `/$CommandPrefix:context sync` suggestion may restate an earlier unacted one — the signals accumulated since ARE the new evidence, and CONTEXT.md Self-Sync's per-session cap governs it.
- Never auto-read OVERVIEW.md. Only read after a reactive trigger fires AND the user approves — except when a user-invoked command's own procedure reads it (`/$CommandPrefix:overview sync`, or `/$CommandPrefix:recap` routing a project-level finding): that is this Constraint's own named exception, and the invocation is the approval.
- Self-verification is mandatory before marking any GOAL.md task or ROADMAP.md milestone as done.
- Handoff recommendations (after any opengoal command or task completes) are single-path and decisive — do not enumerate alternatives. When two next-steps both seem reasonable, pick based on Self-Verification status, GOAL.md priority, and risk profile; do not push the choice to the user. Presenting multiple options applies only to genuine decision forks, not handoffs.

> When Constraints conflict with any other instruction, Constraints win.

## Command Recognition

Interpret user input as opengoal command execution when intent is clear from context — no explicit `/$CommandPrefix` prefix required.

Execute when any of:
- **Explicit invocation** (with or without minor deviations): `/$CommandPrefix:goal init`, `/$CommandPrefix goal init`, `/$CommandPrefix:goal init & design init`
- **Confirmation of pending action**: AI recommended a specific opengoal command in the prior turn, user reply is a brief confirmation ("ok", "yes", "go")
- **Continuation in active flow**: user names the next opengoal step in ongoing context (e.g., "breakdown now" after goal init)
- **Task-execution intent**: user expresses task-level intent that maps to an opengoal command (e.g., "proceed with task N" → `/$CommandPrefix:go`, "save progress" → `/$CommandPrefix:goal checkpoint`, "archive this goal" → `/$CommandPrefix:goal archive`)

> Destructive operations (overwriting existing files, archive) still follow state-aware prompts — in-context confirmation does not bypass those guards.

## Documentation Timing

- (implementation plan crystallizes — files, design decisions, execution order) => suggest `/$CommandPrefix:design init`
- (design changes during implementation) => suggest `/$CommandPrefix:design sync` if `$DocsDir/DESIGN.md` exists, else `/$CommandPrefix:design init`
- (the user articulates a new project principle) => CONTEXT.md Self-Sync owns this trigger — apply its rule there, which also handles the no-CONTEXT.md case. Resource and workflow-step changes are not suggestion triggers either; they accumulate silently under Self-Sync too
- (multiple GOALs need a higher-level plan) => suggest `/$CommandPrefix:roadmap init`
- (new milestone identified) => suggest `/$CommandPrefix:roadmap add` if `$DocsDir/ROADMAP.md` exists, else `/$CommandPrefix:roadmap init`
- (DESIGN.md step completed) => suggest `/$CommandPrefix:design sync`
- (multiple design decisions or context changes accumulated but not yet documented) => suggest `/$CommandPrefix:recap`

Keep suggestions brief and declarative — a statement, not a question: "Implementation plan ready — `/$CommandPrefix:design init` documents it." A suggestion phrased as a question demands a reply; a statement can be passed over without friction.

## CONTEXT.md Self-Sync

CONTEXT.md is the main agent's working memory — it should grow as the session reveals new project facts. Accumulate these signals silently; do NOT suggest on each one:

- new resource worth referencing (file, directory, external system)
- workflow step refined — a procedure the AI repeats and should remember
- new analysis topic / index entry — for projects that maintain analysis tables

Then:

- (user articulates a new project principle — e.g. "always do X", "never do Y") => suggest `/$CommandPrefix:context sync` now if `$DocsDir/CONTEXT.md` exists, else `/$CommandPrefix:context init`; an explicit user rule is worth interrupting for. This is the single home of the principle trigger — Documentation Timing defers here
- (session ending, or several signals accumulated) => suggest `/$CommandPrefix:context sync` once as part of wrap-up. Wrap-up tiebreak with Checkpoint Triggers under the one-suggestion cap: incomplete GOAL.md tasks remain => the checkpoint suggestion wins (work-loss protection first); otherwise this one

Cap: at most two `/$CommandPrefix:context sync` suggestions per session — one for an explicit principle, one at wrap-up.

## OVERVIEW.md Reactive Read

OVERVIEW.md is a project-level architectural reference. It is **never auto-loaded**. Read it only when a reactive event explicitly signals that big-picture context is missing — or when a user-invoked command's own procedure reads it (the exemption bullet below, which needs no approval step):

- (GOAL intent appears to conflict with the actual code structure) => check for OVERVIEW.md, ask user before reading
- (a subagent reports "project-wide context needed" or paraphrases architecture inaccurately) => same
- (user prompt literally asks "why was X designed this way?", "what's the overall structure?", "big picture", or types `$DocsDir/OVERVIEW.md`) => same
- (the user invoked a command whose own procedure reads OVERVIEW.md — `/$CommandPrefix:overview sync`, or `/$CommandPrefix:recap` routing a project-level finding) => not an auto-read; the invocation itself is the approval, proceed without the affordance step
- (otherwise) => do NOT read OVERVIEW.md, do NOT suggest reading

When a reactive trigger fires (the user-invoked-procedure exemption skips this — the invocation is the approval, so steps 3-4 do not apply to it):
1. Confirm `$DocsDir/OVERVIEW.md` exists (existence check only).
2. If absent, inform the user and proceed without it.
3. If present, surface the affordance to the user — *do not auto-read*. Example: "Architectural ambiguity detected. `$DocsDir/OVERVIEW.md` is available — load it?"
4. Read only after explicit user approval, then keep the result in session (skip-if-loaded for subsequent triggers).

> Bias control: when the trigger condition is uncertain, **default to NOT reading**. The cost of missing one read is small; the cost of always-loading is structural.

## Checkpoint Triggers

A checkpoint exists to survive context loss (compaction) *mid-goal*. Only two things justify suggesting one:

- (platform surfaces a compaction-imminent / auto-compact / context-limit notice, or exposes actual context-usage figures nearing the limit — e.g. an injected system warning) => suggest `/$CommandPrefix:goal checkpoint` NOW. This is the only reliable context-pressure signal. Never estimate your own context % or infer pressure from how long the session "feels" — that estimate tracks turn count, not tokens, and misfires early.
- (user explicitly asks to save/pause, or is ending the session) => suggest `/$CommandPrefix:goal checkpoint`.

On platforms that inject no warning, the second trigger is the only one — this is intentional: GOAL.md checkboxes and docs/logs already persist state as work completes, so a missed checkpoint is cheap.

> Do NOT suggest a checkpoint on task count, milestone/goal completion, or a sense that the session has "grown long." At goal completion the right move is `/$CommandPrefix:goal archive`, not a checkpoint. When in doubt, stay silent.

## Blocker Handling

When the current goal cannot proceed (discovered bug, missing dependency, blocking issue):

- (blocker identified, active goal has `parent:`, the parent is parked under `$DocsDir/suspended/`) => suggest `/$CommandPrefix:goal subgoal pause` first to return to the parent, then follow the ordinary blocker path there — `/$CommandPrefix:goal suspend` and `/$CommandPrefix:goal init` are both refused while a sub-goal is active
- (blocker identified, active goal has `parent:`, the parent is missing from `$DocsDir/suspended/`) => `subgoal pause` will refuse too; suggest finishing or archiving the sub-goal (`/$CommandPrefix:goal archive` handles the missing parent and leaves the slot empty), then starting the blocker goal with `/$CommandPrefix:goal init`
- (blocker identified, current GOAL cannot progress, no `parent:`) => suggest `/$CommandPrefix:goal suspend` followed by `/$CommandPrefix:goal init "<blocker description>"` to address the blocker as its own goal
- (blocker goal archived, suspended goals remain) => suggest `/$CommandPrefix:goal resume` to continue a suspended goal
- (nested blockers) => same pattern recursively; `suspended/<goal-id>/` stacks naturally, `resume` presents a list when multiple

This preserves "one active GOAL.md at a time" — simpler than in-place stacking schemes.

## Sub-goal Handling

Blocker, sub-goal, and backlog partition one space between them. Route a discovery on this discriminant, not on how urgent it feels:

- (goal cannot progress until this is fixed) => Blocker Handling above
- (goal can still progress, this serves the goal, needed now, larger than a task) => sub-goal — suggest `/$CommandPrefix:goal subgoal init "<description>"`
- (goal can still progress, not needed now) => Backlog Handling below
- (goal can still progress, this serves the goal, needed now, fits in a task) => ordinary task — just do it, no ceremony

All four conditions of the sub-goal branch are load-bearing. Drop "this serves the goal" and out-of-scope urgent work routes into a sub-goal — which is exactly what `$DocsDir/BACKLOG.md` exists to prevent. Drop "larger than a task" and ordinary work turns into a goal.

A sub-goal is an ordinary goal carrying `parent: <parent-id>` in its front-matter — no new document type, no new location. Shape of the lifecycle: `/$CommandPrefix:goal subgoal init` parks the parent and starts it; it then owns its own `$DocsDir/DESIGN.md` / `PLAN.md` / `CHECKPOINT.md` like any goal and the ordinary Documentation Timing and Execution Handoff rules apply unchanged; `/$CommandPrefix:goal subgoal pause` parks it and returns to the parent; `/$CommandPrefix:goal subgoal switch <slug>` moves between parked ones in the active goal's lineage; bare `/$CommandPrefix:goal subgoal` lists them. Completion is `/$CommandPrefix:goal archive`, which returns to the parent automatically. `/$CommandPrefix:goal` owns every one of those procedures — the slugs, the pointer task, the guards — so point at the verb rather than describing what it does.

The intent is what matters — park the parent, create a linked goal that records its parent, return to the parent when it is done — so where `/$CommandPrefix:goal subgoal` is unavailable, achieve the same shape manually by suspending the parent and creating a goal whose front-matter records its parent.

### "Pause" Precedence

A bare "pause" now has three readings: stop working (the `/$CommandPrefix:go` loop exit), save state (`/$CommandPrefix:goal checkpoint`), and park this sub-goal (`/$CommandPrefix:goal subgoal pause`). Resolve the word first, then apply the matching section:

- (no sub-goal active) => stop working; Checkpoint Triggers decides whether to also suggest `/$CommandPrefix:goal checkpoint`
- (sub-goal active, user names the sub-goal or asks to get back to the parent) => `/$CommandPrefix:goal subgoal pause`
- (sub-goal active, user names saving / context / ending the session) => Checkpoint Triggers, unchanged
- (sub-goal active, nothing in the phrasing picks a reading) => ask which of the three is meant

> Asking here does not violate the Constraint that handoff recommendations are single-path and never a menu — that Constraint's own final sentence exempts genuine decision forks, and this is one, not a handoff. The three readings leave the session in different states, and guessing wrong parks a goal the user wanted left active.

## Backlog Handling

When a discovery falls outside the current goal's scope but does not block it (unrelated bug, improvement idea, tech debt):

- (out-of-scope discovery, current GOAL can still progress) => offer to append a one-line entry to `$DocsDir/BACKLOG.md`, then continue the current task
- (diagnosis is substantial) => record it in `$DocsDir/logs/` or `discussion/`; the backlog entry keeps only the one-liner + a pointer
- Entry format: `- [ ] YYYY-MM-DD <one-liner> (found during <goal-id>)`

Blocking discoveries belong to Blocker Handling (suspend); non-blocking ones split between Sub-goal Handling and here — run them through that section's discriminant, never default them into the backlog.

## Self-Verification

Before checking off a GOAL.md task or ROADMAP.md milestone as "done", verify:

> **"Is this output ready to be used directly in the next step?"**

1. **Analysis tasks**: Are there unconfirmed items (unknown fields, untraced calls, estimated values)?
2. **Implementation tasks**: Do tests pass? Were edge cases considered?
3. **Documentation tasks**: Are there missing sections or placeholders?

- (anything lacking) => do not check off, report gaps to user, verify again after remediation

## Execution Handoff

- (goal breakdown completed, sub-tasks are analysis-focused) => suggest `/$CommandPrefix:go`
- (goal breakdown completed, sub-tasks include implementation and no DESIGN.md exists) => suggest `/$CommandPrefix:design init`
- (design init completed) => suggest `/$CommandPrefix:go`
- (goal resumed from suspension) => suggest `/$CommandPrefix:go`
- (goal checkpoint saved, tasks remain) => suggest `/$CommandPrefix:go`
- (session start, active GOAL.md with uncompleted tasks, DESIGN.md exists or the task is analysis) => suggest `/$CommandPrefix:go`
- (session start, active GOAL.md with uncompleted tasks, implementation task and no DESIGN.md) => suggest `/$CommandPrefix:design init`

## User Decision Support

When responding to the user with multiple options — implementation choices, next opengoal step, design alternatives, or any decision branching — include:

1. **Recommendation** — Highlight one option with rationale.
2. **Basis** — 1-line expected outcome (and tradeoff if any).
3. **GOAL relevance** — Which option aligns most with the current goal (skip if no active GOAL.md).

> When Constraints conflict with any other instruction, Constraints win.
