---
name: "opengoal:roadmap"
description: "Project roadmap (ROADMAP.md) management (init|add|archive)"
category: Workflow
tags: [workflow, opengoal, roadmap]
---

# $CommandPrefix:roadmap

Manages `$DocsDir/ROADMAP.md`. Records the project's **high-level execution plan**.

> ROADMAP.md is one level above GOAL.md.
> Individual ROADMAP milestones correspond to one GOAL each — GOALs are sub-units of ROADMAP milestones.
> "Peer-goal entries" below means `$DocsDir/suspended/*/GOAL.md` with no `parent:` field — the same front-matter read `goal.md`'s `resume` and `subgoal` Lineage Validation perform. Parked sub-goals sit below ROADMAP's granularity and are not counted.

## Constraints

- Never overwrite ROADMAP.md while an active GOAL exists — force archive/suspend first (`/$CommandPrefix:goal subgoal pause` first, for a sub-goal).
- Never archive ROADMAP while an active GOAL exists — force archive/suspend first (`/$CommandPrefix:goal subgoal pause` first, for a sub-goal).
- Suspended peer GOALs (no `parent:`) must be acknowledged before replacing or archiving a ROADMAP.

> When Constraints conflict with any other instruction, Constraints win.

## Usage

`/$CommandPrefix:roadmap <subcommand> [content]`

## Subcommand Dispatch

- (no subcommand given, `$DocsDir/ROADMAP.md` absent) => run init
- (no subcommand given, `$DocsDir/ROADMAP.md` exists) => prompt the user to choose
- (args = init) => see Subcommands: init
- (args = add) => see Subcommands: add
- (args = archive) => see Subcommands: archive
- (otherwise) => report unknown subcommand and list available subcommands

# Subcommands

## init

Creates `$DocsDir/ROADMAP.md`.

1. If `$ARGUMENTS` has content, use it as roadmap source.
2. If empty, derive from the current session and `$DocsDir/GOAL.md`.
3. If ROADMAP.md already exists, run pre-replace checks (see Init Guards below).
4. Write ROADMAP.md using the format template below.
5. Report: `"Created [ROADMAP.md]($DocsDir/ROADMAP.md)."`
6. If `$DocsDir/CONTEXT.md` exists AND the roadmap introduced new project-level context (principles, resources, processes), suggest declaratively: "Project context needs updating — `/$CommandPrefix:context sync`." Otherwise say nothing — `opengoal-flow` caps context-sync suggestions per session.

### Init Guards

- (ROADMAP.md exists, `$DocsDir/GOAL.md` exists, GOAL.md has `parent:`) => stop: "A sub-goal is active. Run `/$CommandPrefix:goal subgoal pause` — repeat until no `parent:` remains — then `/$CommandPrefix:goal suspend`; the ROADMAP can only be replaced with the GOAL slot empty."
- (ROADMAP.md exists, `$DocsDir/GOAL.md` exists, no `parent:`) => stop: "Active GOAL exists. Suspend it before replacing the ROADMAP — or archive it, though archive refuses while it still has parked sub-goals."
- (ROADMAP.md exists, no active GOAL, `$DocsDir/suspended/` has peer-goal entries) => warn: "N suspended GOALs remain under this ROADMAP. Resolve them before replacing?" — proceed only on user confirmation
- (ROADMAP.md exists, no active GOAL, no suspended peer-goal entries) => suggest: "Archive current ROADMAP first with `/$CommandPrefix:roadmap archive`? Or overwrite?"

### ROADMAP.md Format Template

```markdown
---
id: <roadmap-slug>
title: <one-line summary>
status: active
started: YYYY-MM-DD
---

- [ ] **M1: <title>**
  - <details>

- [ ] **M2: <title>**
  - <details>
```

## add

Adds a milestone entry to `$DocsDir/ROADMAP.md`.

1. Add `$ARGUMENTS` content as a new milestone entry.
2. Number sequentially after existing milestones.
3. Report: `"Updated [ROADMAP.md]($DocsDir/ROADMAP.md) — added milestone M<N>."`

## archive

Archives the entire ROADMAP.md. Use when all milestones are complete or the roadmap is being replaced.

1. Run archive guards (see Archive Guards below).
2. Read `$DocsDir/ROADMAP.md` and parse front-matter `id`.
3. Set front-matter `status` to `done` and add `completed: YYYY-MM-DD`.
4. Move to `$DocsDir/archive/roadmaps/YYYY-MM-DD-<id>.md`.
   - (that file already exists) => append `-<N>` before `.md` (e.g., `YYYY-MM-DD-<id>-2.md`) — never overwrite an earlier archive
5. Report: `"Archived to [$DocsDir/archive/roadmaps/YYYY-MM-DD-<id>.md]($DocsDir/archive/roadmaps/YYYY-MM-DD-<id>.md). Create a new roadmap with /$CommandPrefix:roadmap init."`

### Archive Guards

- (`$DocsDir/GOAL.md` exists, GOAL.md has `parent:`) => stop: "A sub-goal is active. Run `/$CommandPrefix:goal subgoal pause` — repeat until no `parent:` remains — then `/$CommandPrefix:goal suspend`; the ROADMAP can only be archived with the GOAL slot empty."
- (`$DocsDir/GOAL.md` exists, no `parent:`) => stop: "Active GOAL exists. Suspend it before archiving the ROADMAP — or archive it, though archive refuses while it still has parked sub-goals."
- (no active GOAL, `$DocsDir/suspended/` has peer-goal entries) => warn: "N suspended GOALs remain under this ROADMAP. Resolve them before archiving?" — proceed only on user confirmation

> When Constraints conflict with any other instruction, Constraints win.
