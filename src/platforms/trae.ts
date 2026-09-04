import type { PlatformAdapter } from "./types.js";

export const trae: PlatformAdapter = {
  id: "trae",
  displayName: "Trae",
  configDir: ".trae",
  supportsCommands: false,
  // Trae is skills-only; commandPath/formatCommand are never invoked by the
  // installer because supportsCommands=false. They exist to satisfy the
  // interface contract.
  commandPath: (name, prefix) => `.trae/commands/${prefix}-${name}.md`,
  formatCommand: (body) => body,
};
