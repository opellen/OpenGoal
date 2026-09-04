import type { PlatformAdapter } from "./types.js";
import { stripFrontmatter, yamlFrontmatter } from "./yaml.js";

export const kiro: PlatformAdapter = {
  id: "kiro",
  displayName: "Kiro",
  configDir: ".kiro",
  commandPath: (name, prefix) => `.kiro/prompts/${prefix}-${name}.prompt.md`,
  formatCommand: (body, meta) => {
    const stripped = stripFrontmatter(body);
    const fm = yamlFrontmatter({ description: meta.description });
    return fm + stripped;
  },
};
