---
name: "opengoal:overview"
description: "Project overview (project-name)"
category: Workflow
tags: [workflow, opengoal, overview]
---

# $CommandPrefix:overview

Manages `$DocsDir/OVERVIEW.md`. Records the **project-level technical overview** — architecture, stack, key decisions.

> OVERVIEW.md is not session context (that's CONTEXT.md) or a task list (that's ROADMAP.md).
> It captures the big picture that rarely changes: what this project is, how it's built, and why key decisions were made.

## Constraints

- Never overwrite OVERVIEW.md without user confirmation.
- Focus on architecture, external interfaces, and differentiators — not code details.
- Omit unnecessary sections. Target ~200 lines or less.
- (only task-level changes in session, no architecture/strategy shifts) => skip sync, nothing to update.

> When Constraints conflict with any other instruction, Constraints win.

## Usage

`/$CommandPrefix:overview <subcommand>`

## Subcommand Dispatch

- (no subcommand given, `$DocsDir/OVERVIEW.md` absent) => run init
- (no subcommand given, `$DocsDir/OVERVIEW.md` exists) => run sync
- (args = init) => see Subcommands: init
- (args = sync) => see Subcommands: sync

# Subcommands

## init

Creates `$DocsDir/OVERVIEW.md` by exploring the codebase.

1. If OVERVIEW.md already exists, notify and confirm overwrite.
2. Explore the codebase to understand architecture, stack, and key features.
   - (codebase is large enough that a full exploration would be expensive) => ask the user to narrow scope or focus on key directories.
3. If `$DocsDir/CONTEXT.md` exists, read it for additional context.
4. Write the overview using the skeleton below.
5. Report: `"Created [OVERVIEW.md]($DocsDir/OVERVIEW.md)."`

**Skeleton:**

```markdown
# {project-name}

> {one-line description}

## Architecture

## Key Features

## Tech Stack

## Key Decisions
```

## sync

Reviews current OVERVIEW.md and **proposes updates**.

1. Read `$DocsDir/OVERVIEW.md`. If absent, suggest init.
2. Analyze changes from the current session that affect project-level understanding
   (architecture changes, new components, strategy shifts).
3. Present changes in **diff format**:
   - Content to add
   - Content to modify
   - Outdated content to remove
4. Apply the changes.
5. Report: `"Updated [OVERVIEW.md]($DocsDir/OVERVIEW.md)."`

> When Constraints conflict with any other instruction, Constraints win.
