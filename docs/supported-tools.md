# Supported tools

OpenGoal installs markdown commands into each tool's native format. The content is the same — only the wrapping differs.

## Status

| Status | Meaning |
|--------|---------|
| **Verified** | Tested in real workflows |
| **Adapter ready** | Installs correctly, not yet battle-tested |

## Tools

| Tool | Status | Install path |
|------|--------|-------------|
| Claude Code | Verified | `.claude/commands/opgl/` |
| Cursor | Adapter ready | `.cursor/commands/` |
| Windsurf | Adapter ready | `.windsurf/workflows/` |
| Cline | Adapter ready | `.clinerules/workflows/` |
| Codex | Adapter ready | `.codex/skills/` |
| GitHub Copilot | Adapter ready | `.github/prompts/` |
| Continue | Adapter ready | `.continue/prompts/` |
| Amazon Q Developer | Adapter ready | `.amazonq/prompts/` |
| Gemini CLI | Adapter ready | `.gemini/commands/` |
| Kilo Code | Adapter ready | `.kilocode/workflows/` |
| Kiro | Adapter ready | `.kiro/prompts/` |
| RooCode | Adapter ready | `.roo/commands/` |
| Trae | Adapter ready | `.trae/commands/` |
| Antigravity | Adapter ready | `.agent/workflows/` |
| Augment CLI | Adapter ready | `.augment/commands/` |
| CodeBuddy | Adapter ready | `.codebuddy/commands/` |
| CoStrict | Adapter ready | `.cospec/openspec/commands/` |
| Crush | Adapter ready | `.crush/commands/` |
| Factory Droid | Adapter ready | `.factory/commands/` |
| iFlow | Adapter ready | `.iflow/commands/` |
| OpenCode | Adapter ready | `.opencode/commands/` |
| Pi | Adapter ready | `.pi/prompts/` |
| Qoder | Adapter ready | `.qoder/commands/` |
| Qwen Code | Adapter ready | `.qwen/commands/` |

## Usage

```bash
opengoal init                          # Claude Code (default)
opengoal init --tools cursor           # Single tool
opengoal init --tools cursor,windsurf  # Multiple tools
opengoal init --tools all              # All supported tools
```

Without `--tools`, the interactive prompt lets you select from the list.

## Something wrong?

Adapter paths and frontmatter formats are based on each tool's public documentation. If an adapter doesn't work with your tool, [open an issue](https://github.com/opellen/opengoal/issues) or submit a PR — even a short "this path is wrong" helps.
