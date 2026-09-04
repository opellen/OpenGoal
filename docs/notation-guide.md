# OpenGoal Notation Guide

This guide explains why the OpenGoal template notation exists and what it accomplishes.

For the syntax reference, see [NOTATION.md](NOTATION.md).

## The Problem: When Natural Language Falls Short

Natural language works well for instructing LLMs most of the time. But once the rules get complex, problems emerge:

- **Conditional branches become ambiguous** — In a sentence like "retry on errors, but stop if it's fatal," an LLM may interpret "fatal" differently each time.
- **Priorities are unclear** — If "always get user approval" and "go ahead with minor edits" both appear in the same document, which one wins?
- **Iteration structure gets blurred** — In an instruction like "for each file, analyze, test, and report," it's unclear whether the three steps apply to every file or run only once.

## The Approach: Lightweight Structure on Top of Markdown

OpenGoal notation solves this with **five constructs**.

It's not a new language. It layers patterns the LLM already knows on top of markdown:

| Construct | What it does | Example |
|-----------|--------------|---------|
| `## Constraints` | Declare non-negotiable rules | `- Never modify production DB directly` |
| `(condition) => action` | One-line conditional behavior | `(error, retryable) => retry with backoff` |
| Numbered list | Sequential procedure | `1. Read code. 2. Write tests.` |
| `for each <unit>:` | Iterative process | `for each file: 1. Analyze. 2. Test.` |
| `loop until <condition>:` | Retry intent | `loop until approved: (rejected) => fix and resubmit` |

*The `loop until` row combines two constructs: a loop declaration (`loop until approved:`) and a dispatch rule (`(rejected) => fix and resubmit`) that handles each iteration's failure case.*

The first three (Core) are enough for most cases. `for each` and `loop until` (Advanced) are only needed for complex workflows.

## Research Background

This notation is grounded in several studies and experiments.

### Pseudocode prompting research

- **EMNLP 2023** — Pseudocode-style prompts improved F1 scores by +7–16pt over natural language.
- **CodeAgents (2025)** — Describing agent workflows in pseudocode reduced token usage by 55–87% while improving performance by +3–36pt.

These studies, however, used Python-like code and saw no production adoption.

### Where OpenGoal sits

OpenGoal picks a pragmatic point between two extremes:

```
Pure natural language ←──── OpenGoal notation ────→ Python-like pseudocode
(ambiguity risk)            (markdown + structure)   (entry barrier, adoption failure)
```

- Preserves the accessibility of natural language
- Adopts the structural clarity of pseudocode
- Excludes programming syntax

### Why Constraints Outperform Steps

LLMs follow "never do this" more reliably than "do these in order."

This stems from how LLMs are trained — declarative rules (Constraints) are referenced regardless of where they appear in the document, while procedural instructions (Steps) depend on position and ordering.

That's why OpenGoal places `## Constraints` at the top of its priority hierarchy.

## Empirical Effects

### A/B Test: Natural Language vs. OpenGoal Notation

The same task was given to Qwen 2.5B in both natural-language and OpenGoal notation versions:

- **Natural language version**: Fixed only grammar errors and missed factual errors
- **Notation version**: Detected both grammar and factual errors, separating the latter with a `[FACT CHECK]` tag

This is the effect of dispatch rules "forcing the separation of behaviors." Natural language tends to blur multiple behaviors together, but `(condition) => action` makes the action for each condition explicit.

### Constraints Priority Test

A scenario where "no merges on Friday" (Constraint) conflicts with "merge if CI passes and there are 2 approvals" (Dispatch Rule):

- **2.5B model**: Ignored the Constraint and decided to merge (failure)
- **9B model**: Explicitly explained that the Constraint wins (success)

OpenGoal's target models (Claude Sonnet/Opus tier) handle this without issue.
