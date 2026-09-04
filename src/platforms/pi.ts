import type { PlatformAdapter } from "./types.js";
import { stripFrontmatter, yamlFrontmatter } from "./yaml.js";

export const pi: PlatformAdapter = {
  id: "pi",
  displayName: "Pi",
  configDir: ".pi",
  commandPath: (name, prefix) => `.pi/prompts/${prefix}-${name}.md`,
  formatCommand: (body, meta) => {
    const stripped = stripFrontmatter(body);
    const fm = yamlFrontmatter({ description: meta.description });
    return fm + stripped;
  },
};
