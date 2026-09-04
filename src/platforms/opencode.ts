import type { PlatformAdapter } from "./types.js";
import { stripFrontmatter, yamlFrontmatter } from "./yaml.js";

export const opencode: PlatformAdapter = {
  id: "opencode",
  displayName: "OpenCode",
  configDir: ".opencode",
  commandPath: (name, prefix) => `.opencode/command/${prefix}-${name}.md`,
  formatCommand: (body, meta) => {
    const stripped = stripFrontmatter(body);
    const fm = yamlFrontmatter({ description: meta.description });
    return fm + stripped;
  },
};
