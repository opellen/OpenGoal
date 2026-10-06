import { dirname } from "node:path";
import type { CompanionTarget, PlatformAdapter } from "./types.js";

const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

// Codex labels a skill from agents/openai.yaml when present; without it the
// label is derived from the frontmatter name with the casing flattened
// ("opengoal:go" shows as "Opengoal: Go").
const commandLabel = (name: string): string => `OpenGoal: ${capitalize(name)}`;

function displayName(target: CompanionTarget): string {
  return target.kind === "command"
    ? commandLabel(target.name)
    : `OpenGoal ${capitalize(target.name.replace(/^opengoal-/, ""))}`;
}

export const codex: PlatformAdapter = {
  id: "codex",
  displayName: "Codex",
  configDir: ".codex",
  commandPath: (name, prefix) => `.codex/skills/${prefix}-${name}/SKILL.md`,
  formatCommand: (body) => body,
  // Skills are invoked from Codex's picker, so prose refers to them by the
  // label the picker shows, not by a slash form.
  commandRef: (name) => commandLabel(name),
  companionFiles: (target) => [
    {
      dst: `${dirname(target.dst).replace(/\\/g, "/")}/agents/openai.yaml`,
      content:
        "interface:\n" +
        `  display_name: ${JSON.stringify(displayName(target))}\n` +
        `  short_description: ${JSON.stringify(target.description)}\n`,
    },
  ],
};
