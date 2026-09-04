import type { PlatformAdapter } from "./types.js";

export const codex: PlatformAdapter = {
  id: "codex",
  displayName: "Codex",
  configDir: ".codex",
  commandPath: (name, prefix) => `.codex/skills/${prefix}-${name}/SKILL.md`,
  formatCommand: (body) => body,
};
