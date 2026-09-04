<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/opengoal-banner-light.webp">
    <img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/opengoal-banner-dark.webp" alt="OpenGoal — goal-centric AI harness"/>
  </picture>
  <p>One question, one file — <code>CONTEXT.md</code>, <code>GOAL.md</code>, <code>ROADMAP.md</code></p>
  <p>
    Open <code>GOAL.md</code> and see <b>what to do now</b>.<br/>
    Open <code>CONTEXT.md</code> and see <b>the current context</b>.<br/>
    Open <code>ROADMAP.md</code> and see <b>the current big picture</b>.
  </p>
  <p><strong>English</strong> · <a href="README.ko.md">한국어</a> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.ja.md">日本語</a></p>
</div>

## What is it?

OpenGoal keeps the current goal visible, in plain markdown, for both you and your AI agent.

One npx command installs markdown slash-commands and agent skills into your project. After that
there is no runtime — no CLI in the loop, no hooks intercepting your actions, no MCP server
holding tool definitions open. What is left on disk is markdown your agent reads and you can
edit in any editor.

## What does it solve?

**What you need to do right now isn't visible.**
The current goal ends up scattered across state files, task lists, and design documents.
You can't open one file and immediately see what to do next — and neither can your agent,
which is worse, because it will confidently proceed from whichever fragment it read last.

In OpenGoal, one question maps to one file.

```text
ROADMAP.md  ─────────  where am I in the big picture?
     CONTEXT.md  ──────  what is this project?
            ● GOAL.md  ──  what do I do now?
```

**Keeping context shouldn't cost more than the context.**
Frameworks that maintain state across sessions tend to reach for CLIs, hooks, and MCP servers.
Light exploration triggers a CLI run, hooks intercept every action, and a configured MCP server
spends tokens on tool definitions in sessions that never call them. Persistence is worth paying
for; that price isn't.

## Quick start

```bash
npx @opellen/opengoal init
```

Markdown commands are installed in your project. No CLI needed after this.

```
/opgl:scout          # Start session — just remember this
```

Whether it's a new project or an existing codebase, scout reads the current state and guides you to the next step.
Got existing code? It starts with context setup (`/opgl:context`). Empty project? It starts by exploring your idea through conversation.

Most commands auto-run `init` on first use — `/opgl:goal "my goal"` works immediately without typing `init`.

### Options

```bash
opengoal init --docs .planning      # Use a different path instead of docs/
opengoal init --codebase src        # Point templates at a sub-directory codebase (default: .)
opengoal init --tools cursor        # Install for a specific tool
opengoal init --tools cursor,windsurf  # Multiple tools
opengoal init --no-subagent         # Disable subagent delegation (enabled by default)
opengoal init --root path/to/proj   # Install into a different project directory
opengoal init --force               # Overwrite existing files
opengoal init --dry-run             # Preview files to install
opengoal init --prefix <name>       # Slash-command prefix (default: opgl)
opengoal init --from-prefix <name>  # Clean up command files left by a previous prefix
```

`--tools` targets `Claude Code`, `Cursor`, `Windsurf`, and [20+ others](docs/supported-tools.md).

## Document structure

```
docs/
├── CONTEXT.md       ← Project context, principles, workflow
├── GOAL.md          ← Current objective and checklist
├── CHECKPOINT.md    ← Last session progress
├── DESIGN.md        ← Implementation design (as needed)
├── PLAN.md          ← Implementation plan (auto-generated for complex tasks)
├── ROADMAP.md       ← Milestone-based overall plan
├── BACKLOG.md       ← Deferred out-of-scope discoveries
├── OVERVIEW.md      ← Full project overview (as needed)
└── suspended/       ← Suspended goals and parked sub-goals
```

| Document | Question it answers | Lifespan |
|----------|-------------------|----------|
| `CONTEXT.md` | What is this project and how do I work on it? | Project lifetime |
| `GOAL.md` | What should I do right now? | Until goal is achieved |
| `CHECKPOINT.md` | Where did the last session leave off? | Per session (overwritten) |
| `DESIGN.md` | How do I implement this? | Until goal is achieved |
| `PLAN.md` | How do I implement this task? | Auto-generated → auto-archived |
| `ROADMAP.md` | Where am I in the big picture? | Project lifetime |
| `BACKLOG.md` | What did I discover but defer? | Project lifetime |
| `OVERVIEW.md` | What does this whole project look like? | Project lifetime |

Start with just `GOAL.md` and expand to `ROADMAP.md`, or lay out the big picture in `ROADMAP.md` and drill down to `GOAL.md`. Either way, OpenGoal keeps "what to do now" visible on markdown.

<details>
<summary>GOAL.md example</summary>

```markdown
---
id: session-auth
goal: Migrate auth from JWT to session-based
status: in-progress
started: 2026-04-04
---

## Tasks

- [x] 1. Set up session store
- [ ] 2. Replace middleware — Step 1/2 (session middleware in progress)
  - [x] 2.1. Implement session middleware
  - [ ] 2.2. Remove legacy JWT code
- [ ] 3. DB schema migration
- [ ] 4. Integration tests
```

</details>

<details>
<summary>CONTEXT.md example</summary>

```markdown
# Project Overview
Express + PostgreSQL REST API server.
Auth migration from JWT to session-based in progress.

# Architecture
- src/server/ — HTTP routing (Express)
- src/auth/ — Auth middleware
- src/db/ — Database access layer

# Principles
- Zero downtime during migration
- Backward compatibility with existing clients

# Resources
- DB: PostgreSQL 14, migrations via prisma
- Auth: express-session + connect-pg-simple
```

</details>

<details>
<summary>ROADMAP.md example</summary>

```markdown
---
id: api-v2
title: API v2 migration
status: active
started: 2026-03-01
---

- [x] **M1: Auth migration**
- [ ] **M2: Rate limiting**
- [ ] **M3: API versioning**
```

</details>

## Commands

| | Command | Description |
|---|---------|-------------|
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-scout-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-scout.webp" alt="" width="20"/></picture> | `/opgl:scout` | Start session — read docs, assess current state, suggest next action |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-go-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-go.webp" alt="" width="20"/></picture> | `/opgl:go` | Execute goal — proceed through `GOAL.md` tasks in order |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-context-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-context.webp" alt="" width="20"/></picture> | `/opgl:context` | Create and sync `CONTEXT.md` |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-goal-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-goal.webp" alt="" width="20"/></picture> | `/opgl:goal` | `GOAL.md` management (init, breakdown, checkpoint, suspend, resume, subgoal, archive) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-design-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-design.webp" alt="" width="20"/></picture> | `/opgl:design` | `DESIGN.md` management (init, sync, archive) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-roadmap-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-roadmap.webp" alt="" width="20"/></picture> | `/opgl:roadmap` | `ROADMAP.md` milestone management (init, add, archive) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-overview-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-overview.webp" alt="" width="20"/></picture> | `/opgl:overview` | `OVERVIEW.md` full project overview |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-verify-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-verify.webp" alt="" width="20"/></picture> | `/opgl:verify` | Verify consistency across goal, design, and implementation |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-recap-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-recap.webp" alt="" width="20"/></picture> | `/opgl:recap` | Session wrap-up — sync decisions into living documents |

Two skills install alongside them — `opengoal-flow` (when to document, when to checkpoint,
and when a discovery becomes a goal of its own) and `opengoal-subagent` (how work is split,
and what the main agent never hands off). You never invoke a skill directly; the commands
load them when they need them.

### Invocation

You don't always need to type `/opgl:` — when intent is clear from context, natural language works too.

| Path | `/opgl` required? | Example |
|------|-------------------|---------|
| **Explicit invocation** | Yes | `/opgl goal init`, `/opgl:goal init & design init` |
| **Confirming a recent recommendation** | No | AI: "Recommend `/opgl:goal init`" → User: "ok" / "go" |
| **Continuation in active flow** | No | (after goal init) User: "breakdown now" |
| **Task-execution intent** | No | "proceed with task 6" → `/opgl:go`, "save progress" → `/opgl:goal checkpoint` |

With clear context, natural language alone triggers execution. `/opgl` serves as an escape hatch when context is ambiguous.

## Usage flow

### Applying to an existing project

```
You: /opgl:scout
AI:  Found an existing codebase. No CONTEXT.md yet.
     Set up project context with `/opgl:context`?

You: /opgl:context init
AI:  ✓ docs/CONTEXT.md created
     To set a goal: `/opgl:goal init`

You: /opgl:goal Migrate auth module from JWT to session-based
AI:  ✓ docs/GOAL.md created (5 tasks)
     Recommend `/opgl:design init` — implementation task with file-level decisions.

You: /opgl:design init
AI:  ✓ docs/DESIGN.md created
     Session store selection, migration strategy, rollback plan included

You: /opgl:go
AI:  Task 1/5: Set up session store... ✓ done
     Task 2/5: Replace middleware... ✓ done
     Task 3/5 requires DB schema changes. Proceed?
```

### New project

```
You: /opgl:scout Let's discuss building a real-time collaborative editor
AI:  (Discovery Mode — exploring tech stack, requirements, constraints)
     ...
     ✓ docs/CONTEXT.md created

You: /opgl:roadmap init
AI:  ✓ docs/ROADMAP.md created
     ├── M1: Core editor engine
     ├── M2: Real-time sync (CRDT)
     └── M3: Deployment & infrastructure

You: /opgl:goal
AI:  Selecting M1 from ROADMAP.md.
     ✓ docs/GOAL.md created

You: /opgl:goal breakdown
AI:  Decomposed into 7 subtasks

You: /opgl:goal breakdown 3
AI:  Decomposed Task 3 into 4 subtasks (3.1–3.4)

You: /opgl:go
AI:  Task 1/7: Project initialization... ✓ done
     Task 2/7: Editor core implementation... ✓ done
     Task 3/7: CRDT sync engine... ✓ done

You: /opgl:goal checkpoint
AI:  ✓ docs/CHECKPOINT.md saved
     (If the session drops, the next one picks up where you left off)

     ... (continue in next session, all tasks complete)

You: /opgl:goal archive
AI:  ✓ Archived 4 files to docs/archive/goals/2026-04-04-editor-core/
     (GOAL.md, DESIGN.md, PLAN.md, CHECKPOINT.md)
     Marked M1 done in ROADMAP.md.
```

### Resuming work

```
You: /opgl:scout
AI:  CONTEXT.md ✓ | GOAL.md ✓ (3/5 complete)
     You were working on API endpoints in the previous session.
     Resume with `/opgl:go`?
```

### After a context compaction

When the conversation gets compacted mid-work, just re-invoke the command:

```
You: /opgl:go
AI:  GOAL.md ✓ (3/7 complete) — Task 4, Step 2/3
     Resuming: conflict resolution in the CRDT sync engine.
```

One command brings everything back — `GOAL.md`, and the checkpoint if you made one — and work continues from the `— Step N/M` annotation instead of starting over. Use `/opgl:scout` if you want a state report first.

### Handling blockers

When something comes up mid-goal that must be fixed first:

```
You: (during Goal A) Let's fix this dependency bug first.
AI:  Suggest: /opgl:goal suspend + /opgl:goal init "Fix dependency bug"
You: ok
AI:  ✓ Goal A suspended to docs/suspended/goal-a/
     ✓ New GOAL.md created for the blocker.

     ... (work through the blocker, archive when done)

You: /opgl:goal resume
AI:  Resumed: Goal A. Continue with /opgl:go?
```

Nested blockers follow the same pattern — suspend stacks, resume presents a list when multiple goals are paused. If a sub-goal is active, park it first with `/opgl:goal subgoal pause` — `suspend` and `init` are refused while one is active.

### Handling sub-goals

Sometimes what comes up isn't a blocker — the goal can still move forward — but it's bigger than a task, needed now, and a different kind of work than the goal itself, so it can't just wait in `BACKLOG.md` either:

```
You: (during Goal A: job-application pipeline) I need a YAML→PDF portfolio builder for this — it needs its own architecture decisions first.
AI:  Doesn't block Goal A, but it's too big to just do inline. Suggest: /opgl:goal subgoal init "Portfolio PDF builder"
You: ok
AI:  ✓ Goal A parked to docs/suspended/job-application-pipeline/
     ✓ New GOAL.md created, linked to Goal A.

     ... (design and build the portfolio tool, archive when done)

AI:  ✓ Sub-goal archived. Back on Goal A — pointer task checked off.
```

If the goal can't proceed without it, park it as a blocker instead — see above.

## In the field

The same goal documents carry a multi-year application build and a weekend plugin.
That range is the point.

**Long-horizon builds**

- [Planura](https://github.com/opellen/Planura) — a native direct-modeling 3D application
  (C++20 / Qt 6 / OpenGL): half-edge geometry kernel, CSG solid modeling, inference-driven
  drawing, on [Ordo](https://github.com/opellen/Ordo), its purpose-built application framework.
- [Ordo](https://github.com/opellen/Ordo) — a typed-event application framework for C++20, extracted from
  Planura. An event is a plain struct: the type is the identity, the fields are the payload.
- Reverse-engineering campaigns — the domain OpenGoal was designed in, where the goal is
  large, the path is unknown, and progress depends on splitting it finely.

**Applications & tools**

- [SeedNote](https://github.com/opellen/Seed-Note) — a structured block editor for Android (Kotlin / Jetpack Compose)
- [ScreenUse](https://github.com/opellen/Screen-Use) — a scenario-driven UI replay and verification tool that drives a real app and records it
- [OpenIllust](https://github.com/opellen/OpenIllust) — campaign-driven AI vector asset production for Claude Code and
  Codex; the logo set in this repository was produced with it

**Focused tools**

- [Hilo](https://github.com/opellen/Hilo) — an Obsidian highlighting plugin
- [Loft](https://github.com/opellen/Loft) — an Obsidian image upload plugin

## From the **gap**

> **It didn't start with application development.**
>
> OpenGoal was built for work where the goal is large, the path is unknown, and progress
> only comes from splitting the unknown into small, verifiable steps that a human and an
> agent can hand back and forth over a long horizon — long reverse-engineering campaigns,
> in the original case. Everything else it is used for inherited that shape.
>
> **Heavy workflows weren't always necessary.**
>
> All I wanted was a small fix — did I really need all this?
> Exhaustive discussions with question bombardment and airtight specifications weren't always necessary.
> Thorough processes are appealing. But AI kept absorbing more and more,
> and I started to think that maybe the safety nets we want to lean on were, in many cases, becoming excessive shackles.
> Yet context needed to persist.
>
> **I wanted to focus on the present.**
>
> I wanted to pull the "current goal" out from under specs and task lists.
> I wanted to create a "present" that both I and AI could immediately understand and focus on.
> Whether you grow from small to large, or descend from the big picture —
> either direction, I wanted a structure where "what to do now" is immediately visible.
>
> **I wanted to fill the gap.**
>
> I sometimes start with OpenSpec and cross over to OpenGoal, and vice versa.
> Sometimes I equip Superpowers.
> What works well should still be used well.
> I needed something that could sit in front of — or between — completeness and power.

## Notation

OpenGoal's commands and skills aren't written as plain prose. They follow a small markdown notation — `## Constraints`, `(condition) => action` dispatch rules, `for each`, `loop until`.

The form follows published work on pseudocode prompting. CodeAgents (2025) reported that describing agent workflows as pseudocode rather than prose cut token usage by 55–87% while improving task performance by 3–36 points.

The syntax and priority rules are documented in [docs/NOTATION.md](docs/NOTATION.md) — useful if you tweak the installed commands in your own project. For the rationale and research background behind the notation, see [docs/notation-guide.md](docs/notation-guide.md).

## Contributing

Issues are welcome — bugs, questions, ideas, disagreements.

Pull requests are accepted for platform adapters (`src/platforms/`); I maintain the
prompt templates myself. See [CONTRIBUTING.md](CONTRIBUTING.md).

### Development

```bash
git clone https://github.com/opellen/OpenGoal.git
cd OpenGoal
npm install
npm run build
npm test
```

## License

MIT License — see [LICENSE](LICENSE) for details.
