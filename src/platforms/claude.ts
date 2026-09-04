import type { PlatformAdapter } from "./types.js";

export const claude: PlatformAdapter = {
  id: "claude",
  displayName: "Claude Code",
  configDir: ".claude",
  commandPath: (name, prefix) => `.claude/commands/${prefix}/${name}.md`,
  formatCommand: (body) => body,
};
