# OpenGoal Notation

A notation for describing workflow rules that LLMs follow in OpenGoal commands and skill templates.

> This document is the **reference** for OpenGoal notation. Follow these conventions when writing or modifying OpenGoal templates.
> For why this notation is needed and what effects it has, see [notation-guide.md](notation-guide.md).

---

## Design Principles

1. **Markdown-first** — Built on standard Markdown. Additional syntax is minimal.
2. **Documents read by LLMs** — Content interpreted directly by LLMs, not a preprocessor.
3. **Declarative-first** — Constraints (invariant rules) > Steps (procedures). LLMs are stronger at adhering to rules.
4. **Zero-shot interpretation** — LLMs understand immediately without a separate spec. All syntax derives from existing training data.
5. **Natural language is OK** — This syntax is optional, not mandatory. If you want to write in natural language, go ahead. Use structure only where it's needed.

---

## Syntax — Core

Basic syntax used by all users. Zero learning cost.

### 1. Constraints

Rules that must always hold true throughout the workflow. **Take priority over all other instructions.**

```markdown
## Constraints

- Rule in natural language.
- Another rule — with inline rationale after dash.
- (condition) => constrained behavior
```

**Rules:**
- Bullet list under a `## Constraints` header
- Rules placed under `## Constraints` have the highest priority — priority is determined by **section placement**, not syntax
- Each item is a single sentence. Shorter is better
- If rationale is needed, add it inline after `—`
- When conflicting with instructions in other sections, **Constraints always win**

**Deciding between Constraints and Dispatch Rules:**
- Rules that must always be followed → Constraints
- Behavior that varies by situation → Dispatch Rules
- You can use `(condition) => action` inside Constraints too. In that context, it means "if this condition holds, this behavior is **mandatory**" — a conditional notation of an inviolable rule. In Dispatch Rules, `(condition) => action` represents a workflow branch.

**Priority reinforcement:** Place the following statement both below the Constraints section at the top and at the bottom of the document:

> When Constraints conflict with any other instruction, Constraints win.

This counteracts the LLM's position/recency bias.

**Example:**
```markdown
## Constraints

- Main agent analyzes code directly — summaries lose critical detail.
- Delegate only implementation to subagents.
- Proceed with implementation only after user approval.
- (5+ consecutive Read/Grep without Edit/Write) => stop and report.

> When Constraints conflict with any other instruction, Constraints win.
```

---

### 2. Dispatch Rules — `(condition) => action`

Compress conditional behavior into a single line.

```markdown
- (condition) => action
- (condition A, condition B) => action        # AND
- (condition) => action — rationale           # inline rationale
```

**Rules:**
- Inside parentheses: condition (natural language, comma for AND)
- After `=>`: action (natural language)
- Each dispatch line starts with `- ` (bullet) for proper Markdown rendering
- OR branches: write as separate lines
- default/else: use the `(otherwise) => action` pattern
- action should be a **single action**. For compound actions, split into a numbered list or delegate to a separate Phase
- **No double `=>`** — `(A) => B => C` is not allowed. Break the condition down into separate lines

```markdown
# Forbidden:
(DONE_WITH_CONCERNS) => correctness issue => address; observation => proceed

# Correct:
(DONE_WITH_CONCERNS, correctness issue) => address first
(DONE_WITH_CONCERNS, observation only) => proceed
```

- No nesting — `(A) => (B) => C` is not allowed
- Group under section headers (e.g., `## Dispatch Rules`, `## Status Protocol`)

**Example:**
```markdown
## Dispatch Rules

- (implementation task, clear spec) => delegate to subagent
- (file discovery, structure mapping) => Explore subagent OK
- (code analysis, logic tracing) => main agent directly
- (trivial fix, < 3 lines) => main agent inline
- (otherwise) => ask user for clarification
```

**OR branch example:**
```markdown
- (error, retryable) => retry with backoff
- (error, non-retryable) => report and stop
```

---

### 3. Numbered List

Step-by-step procedures. Standard Markdown as-is.

```markdown
## Phase Name

1. First step.
2. Second step.
3. Third step.
   - Sub-detail (bullet for elaboration, not sub-step)
```

**Rules:**
- No more than 7 steps per Phase (cognitive load limit)
- If sub-steps form an independent procedure, split them into a separate Phase

---

## Syntax — Advanced

For workflow designers. Used to express complex process flows.

### 4. `for each` (iteration / process boundary)

Apply the same process to each item in a list.

```markdown
for each <unit>:
  1. Step one.
  2. Step two.
```

**Rules:**
- `for each` + unit name + colon
- Body is a numbered list indented by 2 spaces
- Use only for short lists (3–5 iterable units)
- If the number of items is unknown or exceeds 5, describe in natural language (e.g., "Apply the following process to each file")
- Default semantics is **sequential execution**
- No nesting — `for each` inside `for each` is not allowed

---

### 5. `loop until` (retry intent declaration)

Conveys the intent "repeat until this condition is met."

```markdown
loop until <condition>:
  - (status A) => action A
  - (status B) => action B
```

**Rules:**
- `loop until` + exit condition + colon
- Body is dispatch rules or a numbered list
- Exit condition is required to prevent infinite loops
- The only allowed nesting is `for each` > `loop until`. The reverse (`loop until` > `for each`) and same-kind nesting (`loop until` > `loop until`) are not allowed
- When nested, `loop until` must be separated into its own subsection (no inline nesting)

**Nesting separation example:**
```markdown

## Phase 3 — Execute

for each task:
  1. Read relevant code.
  2. Construct subagent prompt.
  3. Dispatch subagent.
  4. Handle status response (see Status Protocol below).
  5. Report result to user.

### Status Protocol

loop until resolved:
  - (DONE) => verify output, mark complete
  - (NEEDS_CONTEXT) => provide context, re-dispatch
  - (BLOCKED) => break down or escalate
```

---

## Structural Rules

### Document Structure Template

```markdown
---
name: skill-name
description: One-line description.
---

# Section Title

## Constraints                         ← Invariant rules (always take priority)
- Rule 1.
- Rule 2.
> When Constraints conflict with any other instruction, Constraints win.

## Dispatch Rules                      ← Conditional behavior
- (condition) => action

# Workflow

## Phase 1 — Name
1. Step.
2. Step.

## Phase 2 — Name
for each unit:                         ← Advanced
  1. Step.
  2. Step.

> When Constraints conflict with any other instruction, Constraints win.
```

### Priority

```
Constraints > Dispatch Rules > Workflow Steps
```

When conflicts arise, rules in Constraints take the highest priority. Dispatch Rules override Workflow Steps for specific situations. Workflow Steps define the default flow.

### Nesting Limits

| Allowed | Not Allowed |
|---------|-------------|
| Phase > numbered list | `for each` > `for each` |
| Phase > `for each` > numbered list | `loop until` > `for each` |
| `for each` > `loop until` (separate section) | `loop until` > `loop until` |
| | `(A) => (B) => C` |
| | Double `=>` usage |

### Preventing Rule Conflicts

- Do not have rules that prescribe different actions for the same situation
- Workflow should **refine** Constraints, never **contradict** them
- Verification: for each Dispatch Rule, ask "Does this violate any Constraint?"

---

## Coexistence with Natural Language

This syntax does not **replace** natural language. Use syntax where structure is needed, and natural language where explanation is needed.

| Situation | Use | Reason |
|-----------|-----|--------|
| Inviolable rules | `## Constraints` | LLMs comply more strongly with declarative rules |
| Condition → action mapping | `(condition) => action` | More token-efficient than natural language, eliminates ambiguity |
| Sequential procedures | Numbered list | Standard Markdown |
| Iterative processes | `for each` | Makes process boundaries explicit |
| Retry intent | `loop until` | Makes exit conditions explicit |
| Context / background / rationale | Natural language | Compressing into syntax loses meaning |

---

## Quick Reference

```
Priority: Constraints > Dispatch Rules > Workflow Steps

── Core ──

## Constraints                         Invariant rules. Always take priority.
- Rule.

- (condition) => action                 Condition → action. One line.
- (cond A, cond B) => action            AND conditions.
- (otherwise) => action                 default/else.

1. Step one.                            Sequential procedure.
2. Step two.

── Advanced ──

for each <unit>:                        Iteration. Sequential. 3–5 units.
  1. Step.

loop until <condition>:                 Retry intent. Exit required.
  - (status) => action
```

> When Constraints conflict with any other instruction, Constraints win.
