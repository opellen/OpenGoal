---
name: "opengoal:goal"
description: "Project goal (GOAL.md) management (init|breakdown|checkpoint|suspend|resume|archive|land)"
category: Workflow
tags: [workflow, opengoal, goal]
---

# $CommandPrefix:goal

Manages `$DocsDir/GOAL.md`.

## Constraints

- (command entry, `opengoal-flow`'s own text not visible in your current context) => load the `opengoal-flow` skill BEFORE writing or moving any document, and say so in one line — its rules (self-verification before marking anything done, User Decision Support format) bind only while that text is in context.
- (command entry, `opengoal-flow`'s own text visible) => do not re-read it.
- Visible means the skill's text itself, as read or injected — remembering its rules, or a summary that mentions them, is not visible.
- GOAL.md is the single source of truth for the current goal's state.
- Never overwrite GOAL.md — a second goal while one is active goes through the four options in `### init (active goal present)` (worktree / suspend / archive / cancel); none of them overwrites.
- Preserve existing check states when updating tasks.
- Task numbers use hierarchical dot notation: `1.`, `1.1.`, `1.2.1.` — numbers are part of the checklist text, no separate id field.
- (`subgoal init`, the derived slug matches `$DocsDir/suspended/<slug>/` or the active goal's `id`) => refuse outright and ask for a different description — never offer to overwrite; a dangling `→ subgoal: <slug>` pointer task is not a collision (an interrupted `init` must stay re-runnable), and `$DocsDir/archive/` is deliberately not checked because `archive`'s `-<N>` directory rule makes an archived slug safe to reuse.
- (`land`, the merge reports a conflict) => abort the merge and report the conflicting files — never edit conflict hunks on your own; which side wins is the user's call.
- (`archive` or `land` running inside a worktree, per `### Worktree Detection`) => never modify the main checkout's working tree except through `land`'s own `git -C <main-root> merge` and its `--abort` — merge timing across worktrees belongs to the user.

> When Constraints conflict with any other instruction, Constraints win.

## Usage

`/$CommandPrefix:goal <subcommand> [content]`

`/$CommandPrefix:goal subgoal <verb> [args]` — sub-goal lifecycle (`init` | `pause` | `switch`, or no verb to list).

`/$CommandPrefix:goal land [<id>]` — merge a finished worktree goal into the base branch (runnable from any session).

`/$CommandPrefix:goal <goal description>` — shorthand for `init` with that content.

## Subcommand Dispatch

- (no subcommand given, `$DocsDir/GOAL.md` absent) => run init
- (no subcommand given, `$DocsDir/GOAL.md` exists) => prompt the user to choose
- (args = init, `$DocsDir/GOAL.md` has `parent:`) => refuse: "A sub-goal is active — nest another with `/$CommandPrefix:goal subgoal init`, or park this one with `/$CommandPrefix:goal subgoal pause` before starting a new top-level goal."
- (args = init, no `parent:`) => see Subcommands: init
- (args = breakdown) => see Subcommands: breakdown
- (args = checkpoint) => see Subcommands: checkpoint
- (args = suspend, `$DocsDir/GOAL.md` absent) => stop: "No active GOAL to suspend."
- (args = suspend, `$DocsDir/GOAL.md` has `parent:`) => refuse: "A sub-goal is active — `/$CommandPrefix:goal subgoal pause` parks it and returns to the parent; to park everything, `/$CommandPrefix:goal subgoal pause` then `/$CommandPrefix:goal suspend`."
- (args = suspend, GOAL.md exists without `parent:`) => see Subcommands: suspend
- (args = resume) => see Subcommands: resume
- (args = subgoal) => see Subcommands: subgoal
- (args = archive, `$DocsDir/GOAL.md` absent) => stop: "No active GOAL to archive."
- (args = archive, GOAL.md exists) => see Subcommands: archive
- (args = land) => see Subcommands: land — it resolves its own target and needs no active GOAL.md
- (args are free-text goal content — multi-word or quoted, not a subcommand keyword — and `$DocsDir/GOAL.md` has `parent:`) => refuse with the same message as `args = init` — free text runs init
- (args are free-text goal content — multi-word or quoted, not a subcommand keyword — and no `parent:`) => run init with that content
- (otherwise) => report unknown subcommand and list available subcommands

`subgoal` is a subcommand keyword — it never falls through to the free-text init path.
These guards bind `/$CommandPrefix:goal suspend` and `/$CommandPrefix:goal init` as user-invoked subcommands only. They do not apply to the `suspend` / `init` procedures performed from inside a `subgoal` verb, which are compositions, not dispatches.

# Subcommands

## init

Creates `$DocsDir/GOAL.md`.

1. If `$ARGUMENTS` has content, use it to write the goal.
2. If empty, derive from the current session discussion.
3. If GOAL.md already exists, run `### init (active goal present)` below. It either stops (cancel, or the new goal was created in a worktree) or returns here with the canonical slot empty.
4. Write GOAL.md with the format below. (picked from a `$DocsDir/ROADMAP.md` milestone) => record `milestone: M<N>`; (the description names a code area) => record `scope:`.
5. Assess task granularity:
   - (tasks are complex, embed multiple implicit steps) => recommend `/$CommandPrefix:goal breakdown` with 1-line rationale
   - (tasks are specific and actionable) => recommend `/$CommandPrefix:design init` (implementation task) or `/$CommandPrefix:go` (analysis task) with 1-line rationale
6. If the goal was created from a `$DocsDir/BACKLOG.md` item, remove that item from BACKLOG.md (promotion = deletion). If the item referenced a file under `$DocsDir/backlog/open/`, move it to `$DocsDir/backlog/archive/`.
7. Report: `"Created [GOAL.md]($DocsDir/GOAL.md)."`
   - (promoted from a backlog item without a detail file) => append `" Promoted from backlog: removed item from [$DocsDir/BACKLOG.md]($DocsDir/BACKLOG.md)."`
   - (promoted from a backlog item with a detail file) => append `" Promoted from backlog: removed item from [$DocsDir/BACKLOG.md]($DocsDir/BACKLOG.md), moved detail file to [$DocsDir/backlog/archive/]($DocsDir/backlog/archive/)."`

GOAL.md format:
```yaml
---
id: <goal-slug>
goal: <one-line summary>
status: in-progress
started: YYYY-MM-DD
milestone: M<N>            # optional — the ROADMAP milestone this goal implements
scope: [<dir>, <dir>]      # optional — code areas this goal expects to touch
base: <branch>             # worktree goals only — the branch the worktree was forked from
worktree: .opengoal/worktrees/<goal-slug>   # worktree goals only
---
```

Body structure:
```markdown
## Tasks

- [ ] 1. Task one
- [ ] 2. Task two
- [ ] 3. Task three
```

- Top-level tasks are numbered `1.`, `2.`, `3.`.
- Sub-tasks inherit parent number: `1.1.`, `1.2.`, and deeper: `1.2.1.`, `1.2.2.`.

### Worktree Detection

Used by `init`, `archive`, `land`, and `/$CommandPrefix:scout`. Decide once per command run:

- `<main-root>` = the first `worktree` line of `git worktree list --porcelain`.
- This session is **inside a worktree** when `git rev-parse --show-toplevel` lies under `<main-root>/.opengoal/worktrees/`. GOAL.md's `worktree:` field confirms it but is not required — a goal started by hand in such a directory still counts.
- Otherwise this session is in the **main checkout**.

### init (active goal present)

`$DocsDir/GOAL.md` exists and carries no `parent:` (a `parent:` is refused by Subcommand Dispatch before reaching here). The user's intent is ambiguous — a parallel goal, a forgotten archive, or a quick switch — so this is a genuine decision fork. Present it in `opengoal-flow`'s User Decision Support form as plain text (never a menu widget), with exactly one recommendation:

```
Active goal <id> is in progress. Options:
1. New worktree — keep <id> running; start the new goal in .opengoal/worktrees/<new-id>/ for a separate session.
2. Suspend <id> and start the new goal here.
3. Archive <id> and start the new goal here.
4. Cancel.
```

Pick the recommendation by the first rule that matches:

- (the active goal has no incomplete tasks) => recommend 3
- (this session is inside a worktree per `### Worktree Detection`) => omit option 1 from the menu — worktrees are created from the main checkout — and recommend 2
- (the new goal maps to a ROADMAP milestone, or is clearly multi-session work) => recommend 1
- (otherwise) => recommend 2

Then:

- (1) => run `#### init in a new worktree` below, and stop — do not continue `init` steps 4–7 here.
- (2) => perform the `suspend` procedure, replacing its step 5 report with the single line `"Suspended <id> to [$DocsDir/suspended/<id>/]($DocsDir/suspended/<id>/)."`, then continue `init` at step 4.
- (3) => perform the `archive` procedure, keeping its step 6 report but dropping the closer sentence, then continue `init` at step 4. Inside a worktree this runs `### archive (inside a worktree)` too; the new goal then continues on the same branch, and the worktree is merge-ready again only when that goal archives.
- (4) => stop: `"Cancelled. Active goal <id> is unchanged."`

#### init in a new worktree

Run from the main checkout. Only the main checkout may create worktrees — (this session is inside a worktree per `### Worktree Detection`) => stop: `"Worktrees are created from the main checkout. Run /$CommandPrefix:goal init there."`

1. Derive `<new-id>` the way `init` derives `id` (kebab-case English slug of the description). (`.opengoal/worktrees/<new-id>/` exists, branch `goal/<new-id>` exists, `$DocsDir/suspended/<new-id>/` exists, or `<new-id>` equals the active goal's `id`) => refuse and ask for a different description.
2. Preflight: `git status --porcelain -- $DocsDir` on the main checkout must print nothing — a worktree is a checkout of HEAD, so uncommitted docs would be invisible to the new goal. (not clean) => report the files and stop; the user commits first.
3. Record `<base>` = the branch currently checked out in the main checkout (`git rev-parse --abbrev-ref HEAD`); (`.gitignore` lacks a line covering `.opengoal/`) => append `.opengoal/` to `.gitignore` and say so.
4. `git worktree add .opengoal/worktrees/<new-id> -b goal/<new-id>`.
5. In the new worktree, delete the copied goal-owned documents: `$DocsDir/GOAL.md`, `$DocsDir/DESIGN.md`, `$DocsDir/PLAN.md`, `$DocsDir/CHECKPOINT.md` (whichever exist). They belong to the goal still running in the main checkout; `archive`'s worktree closing steps make these deletions merge-neutral.
6. Write the new goal's GOAL.md at `.opengoal/worktrees/<new-id>/$DocsDir/GOAL.md` using the format above, including `base: <base>` and `worktree: .opengoal/worktrees/<new-id>`, plus `milestone:` / `scope:` per `init` step 4.
7. Report: `"Created worktree [.opengoal/worktrees/<new-id>/](.opengoal/worktrees/<new-id>/) on branch goal/<new-id> with its GOAL.md. Open a session in that directory and run /$CommandPrefix:scout. The active goal <id> here is unchanged."` No launch command is prescribed — the directory is the contract; any session opened there sees the root install.

## breakdown

Decomposes existing GOAL.md tasks into sub-tasks.
At `goal init` time only high-level tasks are written; use breakdown when detailed decomposition emerges through discussion.

Usage: `/$CommandPrefix:goal breakdown [task-number]`

### Breakdown Targeting

- (no task number given) => decompose all top-level tasks
- (task number given, e.g. `2`) => decompose that specific task only
- (sub-task number given, e.g. `1.2`) => decompose into `1.2.1`, `1.2.2`, etc.
- (a targeted task is a pointer task — a `→ subgoal: <slug>` line) => refuse to decompose it — it is already delegated to a whole goal of its own. Resolve the slug per `### Resolving a Pointer Task's Slug` and advise by state: parked => `/$CommandPrefix:goal subgoal switch <slug>` then breakdown there; archived or dangling => nothing to decompose, bare `/$CommandPrefix:goal subgoal` explains the repair. A bulk run decomposes the remaining tasks as usual.

### Steps

1. Read `$DocsDir/GOAL.md` and `$DocsDir/DESIGN.md` at once (parallel if supported, sequential otherwise). Skip a file whose text is visible in your current context — but re-read if the goal occupying the canonical paths has changed since the last read: a `subgoal` verb, `goal suspend`/`resume`, or `goal archive`'s sub-goal completion all swap the documents at those paths. A file read error means the file does not exist — **do NOT retry failed reads.**
2. Identify target tasks based on targeting rules above.
3. Derive sub-tasks:
   - If DESIGN.md was found and has an Execution Order section, use it as a reference for deriving sub-tasks.
   - If discussion context provides additional detail, incorporate it.
   - If neither is sufficient, analyze task nature and propose sub-tasks.
4. Present decomposition as nested checklists with hierarchical numbers:
   ```markdown
   - [ ] 1. Top-level task
     - [ ] 1.1. Sub-task
     - [ ] 1.2. Sub-task
       - [ ] 1.2.1. Sub-sub-task
       - [ ] 1.2.2. Sub-sub-task
   ```
   - Each nesting level appends a sequential number to the parent's prefix.
   - Indent with 2 spaces per level.
5. Update GOAL.md.
   - Renumber all tasks at the affected level to ensure sequential ordering (no gaps).
   - (a renumbered line is a pointer task) => preserve it verbatim apart from its number — its identity is the slug, and other commands key on the exact `→ subgoal: <slug>` form.
   - (target task already has sub-tasks) => ask user whether to merge or replace before writing
6. Report: `"Updated [GOAL.md]($DocsDir/GOAL.md) — decomposed <N> task(s) into <M> sub-tasks."`
7. Assess design necessity:
   - (sub-tasks include code implementation, file changes, or architecture decisions) => recommend `/$CommandPrefix:design init` with 1-line rationale
   - (sub-tasks are analysis/RE/investigation focused) => recommend `/$CommandPrefix:go` with 1-line rationale

## checkpoint

Saves a progress snapshot to `$DocsDir/CHECKPOINT.md`.
Single file, overwritten each time — the AI only needs the latest state to resume.
Prevents loss of mid-goal progress when context is compacted.

1. Read `$DocsDir/GOAL.md` and `$DocsDir/PLAN.md` at once (parallel if supported, sequential otherwise). Skip a file whose text is visible in your current context — but re-read if the goal occupying the canonical paths has changed since the last read: a `subgoal` verb, `goal suspend`/`resume`, or `goal archive`'s sub-goal completion all swap the documents at those paths. A file read error means the file does not exist — **do NOT retry failed reads.**
2. Requires GOAL.md front-matter `id`.
3. If `$ARGUMENTS` has content, incorporate it.
4. Write based on the current session:
   - Work performed in this session
   - Findings / analysis results
   - Next steps for the following session
5. If PLAN.md was found and implementation approach changed during this session, update PLAN.md accordingly — preserving its front-matter.
6. Save to `$DocsDir/CHECKPOINT.md` (overwrite if exists).
7. Report: `"Saved [CHECKPOINT.md]($DocsDir/CHECKPOINT.md)."` — append `" Also updated [PLAN.md]($DocsDir/PLAN.md)."` if PLAN.md was modified in step 5.

CHECKPOINT.md format:
```yaml
---
goal-id: <GOAL.md id>
session-date: YYYY-MM-DD
---
```

```markdown
## Work Summary
- ...

## Findings
- ...

## Next Steps
- ...
```

## suspend

Suspends the current GOAL to work on something else.

1. Read `$DocsDir/GOAL.md` and parse front-matter `id`.
2. Set front-matter `status` to `suspended`.
3. Create `$DocsDir/suspended/<goal-id>/` directory.
4. Move `$DocsDir/GOAL.md` → `$DocsDir/suspended/<goal-id>/GOAL.md`.
   - If `$DocsDir/CHECKPOINT.md` exists, move it → `$DocsDir/suspended/<goal-id>/CHECKPOINT.md`.
   - If `$DocsDir/DESIGN.md` exists, move it → `$DocsDir/suspended/<goal-id>/DESIGN.md`.
   - If `$DocsDir/PLAN.md` exists, move it → `$DocsDir/suspended/<goal-id>/PLAN.md`.
5. Report: `"Suspended GOAL to [$DocsDir/suspended/<goal-id>/]($DocsDir/suspended/<goal-id>/). Start a new goal with /$CommandPrefix:goal init or resume with /$CommandPrefix:goal resume."`

## resume

Resumes a previously suspended GOAL.

Usage: `/$CommandPrefix:goal resume [<goal-id>]`

### Resume Targeting

- (goal-id given, `$DocsDir/suspended/<goal-id>/` exists) => select it directly, skip candidate selection
- (goal-id given, directory absent) => stop: "No suspended goal '<goal-id>'."
- (no goal-id given) => run candidate selection

### Steps

1. Read `$DocsDir/GOAL.md` and list directories in `$DocsDir/suspended/` at once (parallel if supported, sequential otherwise). A file read error means the file does not exist — **do NOT retry failed reads.**
   - (`$DocsDir/GOAL.md` exists) => stop: "Active GOAL exists. Suspend or archive it first."
2. Resolve the target based on Resume Targeting above. If candidate selection is needed, read front-matter of each `$DocsDir/suspended/*/GOAL.md`:
   - (no `parent:` field) => peer goal
   - (`parent:` field present) => parked sub-goal, shown with the parent id it belongs to
3. Process the candidate list — skip this step entirely when a `<goal-id>` target was resolved directly:
   - (none found) => report "No suspended goals."
   - (exactly one across both groups) => auto-select it
   - (multiple, session context permits a confident recommendation) => present the groups separately with a single recommendation per `opengoal-flow` User Decision Support (Recommendation + Basis + GOAL relevance)
   - (multiple, no clear context) => present the groups separately for user selection
4. Move `$DocsDir/suspended/<goal-id>/GOAL.md` → `$DocsDir/GOAL.md`.
   - If `CHECKPOINT.md` exists in the suspended folder, move it → `$DocsDir/CHECKPOINT.md`.
   - If `DESIGN.md` exists in the suspended folder, move it → `$DocsDir/DESIGN.md`.
   - If `PLAN.md` exists in the suspended folder, move it → `$DocsDir/PLAN.md`.
5. Set front-matter `status` back to `in-progress`.
6. Remove the now-empty `$DocsDir/suspended/<goal-id>/` directory.
7. Report: `"Resumed [GOAL.md]($DocsDir/GOAL.md): <goal summary>."`

## subgoal

Manages sub-goals. A sub-goal is an ordinary goal whose front-matter carries `parent: <parent-id>` — there is no new document type and no new location. The active goal always occupies the canonical `$DocsDir/` paths and the parent is parked under `$DocsDir/suspended/<parent-id>/`, so a sub-goal owns its own DESIGN.md / PLAN.md / CHECKPOINT.md exactly like any other goal.

Every verb is a composition of the `init`, `suspend`, and `resume` procedures above — no new mechanism. `resume` stops when `$DocsDir/GOAL.md` exists, so `suspend` always runs before `resume`; that ordering is required, not stylistic.

**Suppress the composed procedures' own reports** — `suspend` step 5, `resume` step 7, and `init` step 7. (`init` step 5's granularity assessment still applies — a fresh sub-goal needs its next step recommended, after the verb's own report.) Each verb's final report step is the only report the user sees. Left in, the suppressed closers fire mid-composition and hand out stale advice: `suspend`'s says "Start a new goal with `/$CommandPrefix:goal init`" while a sub-goal is being started, and a handoff must be single-path and decisive, not a menu.

Sub-goal completion is not a verb here — it is handled by `/$CommandPrefix:goal archive`.

Usage: `/$CommandPrefix:goal subgoal <verb> [args]`

Verbs are mandatory — the slug set is dynamic, so a one-word description cannot be told apart from a slug. The verb is `switch`, not `resume`: `resume` is the underlying procedure, and reusing the word would blur the layer.

### Verb Dispatch

The absent-GOAL guard precedes the **verb** rules — a verb rule fires only when `$DocsDir/GOAL.md` is present. Bare `subgoal` (list) is not a verb rule; it handles the absent-GOAL case itself.

- (verb given, `$DocsDir/GOAL.md` absent) => stop: "No active goal. Start one with /$CommandPrefix:goal init or bring one back with /$CommandPrefix:goal resume."
- (verb = `init`, description given) => see subgoal init
- (verb = `init`, no description) => stop and ask for the sub-goal description
- (verb = `pause`) => see subgoal pause
- (verb = `switch`, slug given) => see subgoal switch
- (verb = `switch`, no slug) => stop and list the valid slugs per Lineage Validation
- (no verb given) => see subgoal list
- (otherwise) => report unknown verb and list `init`, `pause`, `switch`, and bare `subgoal` (list)

### subgoal init

Parks the parent and creates a linked goal.

1. Append the pointer task to `$DocsDir/GOAL.md` as a new top-level task (form under Pointer Task below).
   - (a pointer task carrying this slug is already present — an interrupted `init` left it) => reuse that line, do not append a second one. Two unchecked pointers sharing a slug leave the completion path's check-off target undefined.
2. Perform the `suspend` procedure — the parent, with its pointer task, moves to `$DocsDir/suspended/<parent-id>/`.
3. Perform the `init` procedure with the description, writing `parent: <parent-id>` into the new GOAL.md front-matter alongside `id: <slug>`.
4. Report: `"Started sub-goal [GOAL.md]($DocsDir/GOAL.md) under <parent-id>. Return with /$CommandPrefix:goal subgoal pause."`

### subgoal pause

Parks this sub-goal and returns to the parent.

1. Read `$DocsDir/GOAL.md` and parse front-matter `parent:`.
   - (no `parent:` field) => stop: "The active goal is not a sub-goal. Use /$CommandPrefix:goal suspend instead."
   - (`$DocsDir/suspended/<parent-id>/` absent) => stop before parking anything: the parent is missing, so there is nothing to return to — report the state and point at bare `/$CommandPrefix:goal subgoal` (list). Nothing has been moved.
2. Perform the `suspend` procedure.
3. Perform the `resume` procedure targeting `<parent-id>`.
4. Report: `"Parked sub-goal <sub-goal-id>. Back on [GOAL.md]($DocsDir/GOAL.md): <parent goal summary>."`

### subgoal switch

Parks whatever is active and activates that sub-goal.

1. Validate `<slug>` per Lineage Validation below.
2. Perform the `suspend` procedure.
3. Perform the `resume` procedure targeting `<slug>`.
4. Report: `"Switched to [GOAL.md]($DocsDir/GOAL.md): <goal summary>."`

### Lineage Validation

`<slug>` must name a `$DocsDir/suspended/<slug>/` directory **exactly** — no prefix matching, since slug derivation legitimately produces both `api-v2` and `api-v2-tests`. Read the front-matter of each `$DocsDir/suspended/*/GOAL.md`, the same read `resume`'s grouped candidate list performs.

- (target's `parent:` == the active goal's `id`) => a child of the active goal — allow
- (the active goal has `parent:`, target's `parent:` == the active goal's `parent:`) => a sibling under the same parent — allow
- (otherwise) => refuse and list the valid slugs. A suspended goal outside this lineage is not a sub-goal of it — to work that one instead, park the active goal and use `/$CommandPrefix:goal resume <slug>`

### subgoal list

1. Read `$DocsDir/GOAL.md` and the front-matter of each `$DocsDir/suspended/*/GOAL.md` at once (parallel if supported, sequential otherwise), and list `$DocsDir/archive/goals/`, reading a slug-matching directory's GOAL.md front-matter — step 3's slug resolution needs both. A file read error means the file does not exist — **do NOT retry failed reads.**
2. Report, omitting any kind that does not apply:
   - (`$DocsDir/GOAL.md` absent) => there is no lineage to report against — list every suspended goal grouped by `parent:`, note that no goal is active, and point at `/$CommandPrefix:goal resume`
   - Active scope — the active goal's `id`, plus its `parent:` if it has one.
   - Parked sub-goals of this lineage — children of the active goal, and siblings sharing its `parent:`.
   - The parent — shown only when the active goal has `parent:`.
   - Unrelated peer goals — suspended goals outside this lineage.
3. Report any inconsistent pointer task alongside the four:
   - (a pointer task resolves to **dangling** per `### Resolving a Pointer Task's Slug` below) => report it as a repairable inconsistency, not an error — an interrupted `subgoal init` leaves one, and re-running `subgoal init` with that description recreates the sub-goal.
   - (an unchecked pointer task resolves to **archived**) => an interrupted completion left it; offer to check it off now — permitted by `### Pointer Task`'s check-off rule.

### Pointer Task

`subgoal init` appends a new top-level task to the parent's `$DocsDir/GOAL.md`, numbered per the hierarchical convention in `init`:

```markdown
- [ ] 10. Portfolio PDF pipeline → subgoal: portfolio-pipeline
```

- `→ subgoal: <slug>` is the **normative recogniser** for a pointer task — other commands key on this exact form.
- The reference is a slug, never a path and never a markdown link — the sub-goal's files move between `$DocsDir/`, `$DocsDir/suspended/`, and `$DocsDir/archive/` over their life, so any path written here would be wrong most of the time.
- `<slug>` is a kebab-case English slug derived from the description — English even when the description is not (a Korean description yields e.g. `job-application-pipeline`), the same form as a goal `id`.
- **Check-off rule (the single authority — other rules cite this one):** only `/$CommandPrefix:goal archive`'s sub-goal completion path may check a pointer task off. Finishing an interrupted completion counts as that path: whenever an **unchecked** pointer resolves **archived** (per `### Resolving a Pointer Task's Slug`), completing the check-off is permitted — the completion path's interruption rules route through it, and bare `/$CommandPrefix:goal subgoal` offers it.

### Resolving a Pointer Task's Slug

An unchecked pointer is in one of three states. `go`, `verify`, `scout`, and `subgoal list` all key on this — resolve it here, not with a matcher of your own:

- (`$DocsDir/suspended/<slug>/` exists whose GOAL.md carries `parent:` equal to this goal's `id`) => **parked** — the sub-goal is waiting; `/$CommandPrefix:goal subgoal switch <slug>` works it, and it blocks this goal's archive. A same-slug suspended directory without that `parent:` is an ordinary suspended goal — a coincidence; it does not resolve the pointer
- (no `suspended/<slug>/`, `$DocsDir/archive/goals/` holds a directory named `YYYY-MM-DD-<slug>` or `YYYY-MM-DD-<slug>-<N>` **whose GOAL.md carries `parent:` equal to this goal's `id`**) => **archived** — completed with the pointer left unchecked; nothing blocks archiving this goal. A same-slug directory without that `parent:` is an unrelated earlier archive — it does not resolve the pointer
- (neither) => **dangling** — an interrupted `subgoal init`; repairable by re-running `/$CommandPrefix:goal subgoal init` with that description

Match the archive directory on the full `-<slug>` suffix, never a substring: `archive/goals/2026-08-15-api-v2/` must not resolve the slug `v2`, and the `-<N>` collision suffix must still match.

## archive

Archives the current GOAL.md and its siblings.

- (a goal parked under `$DocsDir/suspended/` carries `parent:` equal to this goal's `id`) => refuse: parked sub-goals of this goal remain — offer to finish them, to `/$CommandPrefix:goal subgoal switch <slug>` into one, or to leave the parent open. Never instruct the user to delete anything. This holds whether or not this goal itself has a `parent:`: archiving a middle node would strand its children, whose `parent:` would then name a goal that is live nowhere. (Presenting these options is a genuine decision fork — only the user knows whether the remaining work still matters — not a handoff, per the single-path Constraint's own exception.)
- (no parked sub-goals of this goal, `$DocsDir/GOAL.md` front-matter has `parent:`, `$DocsDir/suspended/<parent-id>/` exists) => this is a sub-goal completing — see `### archive (sub-goal completion)` below, not the numbered steps
- (no parked sub-goals of this goal, `parent:` present, `$DocsDir/suspended/<parent-id>/` absent) => archive via `### archive (sub-goal completion)`, report the missing parent, and leave the slot empty — `/$CommandPrefix:goal resume` is the recovery
- (no parked sub-goals of this goal, no `parent:`, this session is inside a worktree per `### Worktree Detection`) => the numbered steps below, then `### archive (inside a worktree)` — its closer replaces step 6's. A sub-goal completing inside a worktree takes the sub-goal path above instead; the worktree becomes merge-ready only when its top-level goal archives
- (otherwise) => the numbered steps below, unchanged

Both `parent:` checks read the front-matter of each `$DocsDir/suspended/*/GOAL.md` — the same read `resume`'s grouped candidate list and `subgoal`'s Lineage Validation already perform.

1. Read `$DocsDir/GOAL.md` and parse front-matter `id`.
2. Set front-matter `status` to `done` and add `completed: YYYY-MM-DD`.
3. Determine archive directory: `$DocsDir/archive/goals/YYYY-MM-DD-<id>/`.
   - (directory exists, holds no GOAL.md, and **no resident file carries a `goal-id` differing from** this GOAL's `id`) => this goal's own partial archive — complete it rather than appending `-<N>`; splitting one goal across two directories would break slug resolution. Never overwrite a file already present in it — report the collision instead of moving that file
   - (directory exists, holds no GOAL.md, but a resident file carries a `goal-id` differing from this GOAL's `id`) => another goal's partial archive — append `-<N>`, re-applying this same test to the suffixed candidate
   - (directory exists with a GOAL.md — a completed archive of an earlier same-slug goal) => append `-<N>` (e.g., `YYYY-MM-DD-<id>-2/`), re-applying this same test to the suffixed candidate
4. Move all goal-scoped files to the archive directory:
   - `$DocsDir/GOAL.md` → archive/GOAL.md
   - (DESIGN.md exists) => archive/DESIGN.md
   - (PLAN.md exists) => archive/PLAN.md
   - (CHECKPOINT.md exists) => archive/CHECKPOINT.md
   - (a sibling that **carries** front-matter `goal-id` differing from this GOAL's `id` — DESIGN.md, CHECKPOINT.md, or a PLAN.md that has one; a PLAN.md without front-matter predates the format `go` now writes — treat it as this goal's) => do not move that file — it belongs to another goal, left by an interrupted move. This guard precedes the move bullets above. Report the mismatch and leave it in place for the user to triage; filing it under the wrong id would be worse than the orphan.
5. If `$DocsDir/ROADMAP.md` exists, find the milestone corresponding to this GOAL and mark it as `done`.
6. Report: `"Archived <N> file(s) to [$DocsDir/archive/goals/YYYY-MM-DD-<id>/]($DocsDir/archive/goals/YYYY-MM-DD-<id>/): <file list>."`
   - (any file was held back by step 3's collision rule or step 4's mismatch guard) => append `" Not moved: <files> — left in place for triage."`
   - (peer goals remain under `$DocsDir/suspended/`) => close with `" Resume a parked goal with /$CommandPrefix:goal resume."`
   - (no peer goals remain) => close with `" Set a new goal with /$CommandPrefix:goal init."`
7. If `$DocsDir/BACKLOG.md` has items resolved during this goal or carrying completion/dropped notes, sweep them following `opengoal-flow`'s `Backlog Disposal` section without exception, and report the sweep actions taken (e.g. `"Swept [$DocsDir/BACKLOG.md]($DocsDir/BACKLOG.md): <N> resolved item(s) deleted, <M> dropped item(s) indexed to [$DocsDir/backlog/archive/DROPPED.md]($DocsDir/backlog/archive/DROPPED.md)."`). Then, if open items remain, suggest promoting one as the next goal.

### archive (sub-goal completion)

Reached only from the dispatch above — the steps there are already at the cap, so this path is a subsection rather than more steps.

1. Archive the sub-goal to `$DocsDir/archive/goals/YYYY-MM-DD-<own-id>/` per `## archive` steps 1–4, same `-<N>` collision rule and same file list — a sub-goal archives under its own `id`, an ordinary sibling of goal archives, and the archived front-matter's `parent:` is what records the relationship.
2. Perform the `resume` procedure targeting `<parent-id>` — the parent returns to `$DocsDir/GOAL.md`. Suppress `resume` step 7's report; step 4 below is this path's only report.
3. Check off the parent's pointer task — the `- [ ] N. … → subgoal: <slug>` line whose `<slug>` is this sub-goal's `id` — and append the result as a one-line indented sub-bullet beneath it, leaving the pointer line itself intact apart from the check mark.
4. Report: `"Completed sub-goal <sub-goal-id> → [$DocsDir/archive/goals/YYYY-MM-DD-<sub-goal-id>/]($DocsDir/archive/goals/YYYY-MM-DD-<sub-goal-id>/). Back on [GOAL.md]($DocsDir/GOAL.md): <parent goal summary>. Next: <parent's next incomplete task>."`
   - (any file was held back by the inherited collision or mismatch guards in step 1) => append `" Not moved: <files> — left in place for triage."`

- `## archive` steps 5–7 do not run on this path — the composition is steps 1–4 only. In particular: no ROADMAP milestone step (sub-goals sit below the granularity ROADMAP tracks), no `init`/`resume` closer, no BACKLOG promotion suggestion. Step 4 above is the only report — a handoff must be single-path and decisive, not a menu.
- (reached from the missing-parent dispatch rule) => step 1 only; steps 2-4 do not apply. Report the sub-goal archived, the parent missing, and the slot left empty — and that `/$CommandPrefix:goal resume` is the recovery.
- (the pointer task is absent from the resumed parent) => report that and continue — the sub-goal is archived and the parent is active; do not fail.
- (the run was interrupted after step 1, `$DocsDir/suspended/<parent-id>/` exists — distinct from the missing-parent rule above, whose stop after step 1 is its normal end) => the slot is empty with the pointer unchecked; recover with `/$CommandPrefix:goal resume <parent-id>`, then carry out step 3 against the resumed parent — permitted by `### Pointer Task`'s check-off rule.
- (the run was interrupted after step 2 — parent active, pointer unchecked) => the pointer now resolves **archived**; complete step 3 directly, or let bare `/$CommandPrefix:goal subgoal` offer it — both permitted by `### Pointer Task`'s check-off rule.

### archive (inside a worktree)

Reached from the dispatch above after `## archive` steps 1–7 ran on this worktree's own copies (ROADMAP tick and BACKLOG sweep included — the merge carries them to the base branch as one-line hunks). This path closes the goal on its branch and leaves the main checkout alone; merging is `land`'s job, because other worktrees may have to land first.

1. Read `<base>` from the archived GOAL.md front-matter (`$DocsDir/archive/goals/YYYY-MM-DD-<id>/GOAL.md`); (absent) => use the main checkout's current branch.
2. Restore the goal-owned documents to the fork point so this branch carries no change to them. With `<fork>` = `git merge-base <base> HEAD`, handle **each** of `$DocsDir/GOAL.md`, `$DocsDir/DESIGN.md`, `$DocsDir/PLAN.md`, `$DocsDir/CHECKPOINT.md` separately — one combined `git restore` fails entirely if any path was absent at the fork:
   - (`git cat-file -e <fork>:<path>` succeeds — the file existed at the fork) => `git checkout <fork> -- <path>`
   - (it did not exist at the fork) => make sure it is absent now (`git rm -q --cached <path>` if tracked, delete the file if present) — absent at both ends is "no change"
   Result check: `git diff --name-only <fork> -- $DocsDir/GOAL.md $DocsDir/DESIGN.md $DocsDir/PLAN.md $DocsDir/CHECKPOINT.md` must print nothing. (it prints a path) => stop before committing and report `"Restore incomplete: <paths> still differ from the fork point."` — this check is what keeps `land` free of modify/delete conflicts when the main checkout still has a goal of its own.
3. `git add -A` and commit on `goal/<id>` with message `archive <id>`.
4. Closer: keep step 6's `"Archived <N> file(s) …"` report, and replace only its closing sentence with `" Committed on goal/<id>. This worktree is ready to merge — /$CommandPrefix:goal land merges it into <base> now."`

## land

Merges a finished worktree goal into its base branch. Runnable from any session — the user should not need to know which window to type it in.

Usage: `/$CommandPrefix:goal land [<id>]`

### Target Resolution

- (this session is inside a worktree per `### Worktree Detection`) => the target is this worktree; an `<id>` argument naming a different one is refused — land that one from the main checkout
- (main checkout, `<id>` given, `.opengoal/worktrees/<id>/` exists) => that worktree
- (main checkout, `<id>` given, directory absent) => stop: `"No worktree '<id>'."`
- (main checkout, no `<id>`, exactly one merge-ready worktree) => select it
- (main checkout, no `<id>`, several merge-ready) => list them and ask which to land first — merge order is a genuine decision fork; dependencies between goals are known only to the user
- (main checkout, no `<id>`, none merge-ready) => report the worktree states per `/$CommandPrefix:scout`'s classification and stop

**Merge-ready** means: the worktree's `$DocsDir/GOAL.md` is absent, `git status --porcelain` there prints nothing, and `goal/<id>` is ahead of `<base>` (read `<base>` from the archived GOAL.md in that worktree; fall back to the main checkout's current branch).

### Steps

1. Resolve the target per Target Resolution. (not merge-ready) => stop: `"Worktree <id> is not ready — run /$CommandPrefix:goal archive in it first."`
2. Busy check on the main checkout. Compute the branch's changed files, `git diff --name-only <base>...goal/<id>`, and the main checkout's dirty files, `git -C <main-root> status --porcelain`.
   - (a merge is in progress — `<main-root>/.git/MERGE_HEAD` exists) => stop: `"The base branch has a merge in progress. Finish or abort it, then land again."`
   - (a dirty file in the main checkout is also a changed file on the branch) => stop: `"Uncommitted changes in <main-root> touch files this merge would update: <files>. Commit or stash them there, then land again."` — the worktree stays merge-ready; nothing is lost
   - (otherwise) => continue. Unrelated uncommitted edits in the main checkout — an active goal's GOAL.md ticks, say — do not block the merge; `archive`'s worktree closing steps already made the goal documents merge-neutral, so they are never on the branch's changed-file list
3. Confirm `git -C <main-root> rev-parse --abbrev-ref HEAD` is `<base>`. (it is another branch) => stop: `"<main-root> has <branch> checked out, not <base>. Check out <base> there first."` Otherwise `git -C <main-root> merge --no-ff goal/<id>`.
   - (clean) => continue
   - (conflict) => `git -C <main-root> merge --abort`, then stop with `"Merge of goal/<id> conflicts in: <files>. Aborted; <base> is unchanged. Resolve by hand or land another worktree first."` Per Constraints, do not resolve hunks yourself.
4. Cleanup:
   - (run from the main checkout) => `git worktree remove .opengoal/worktrees/<id>` and `git branch -d goal/<id>`; the step 5 report then ends with `" Worktree and branch removed."`
   - (run from inside the worktree) => skip — a session cannot remove its own directory. The step 5 report then ends with `" Cleanup of this worktree is offered by the next /$CommandPrefix:scout in the main checkout."`
5. Report: `"Landed goal <id> into <base> (<N> commits)."` plus the cleanup sentence from step 4, then one closer:
   - (another merge-ready worktree remains) => `" Next: /$CommandPrefix:goal land <next-id>."`
   - (peer goals remain under `$DocsDir/suspended/`) => `" Resume a parked goal with /$CommandPrefix:goal resume."`
   - (otherwise) => `" Set a new goal with /$CommandPrefix:goal init."`

Every git command here is run by the agent under the normal permission flow; nothing assumes the user types git.

> When Constraints conflict with any other instruction, Constraints win.
