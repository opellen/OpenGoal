import type { PlatformAdapter } from "./types.js";
import { stripFrontmatter, yamlFrontmatter } from "./yaml.js";

export const amazonQ: PlatformAdapter = {
  id: "amazon-q",
  displayName: "Amazon Q Developer",
  configDir: ".amazonq",
  commandPath: (name, prefix) => `.amazonq/prompts/${prefix}-${name}.md`,
  formatCommand: (body, meta) => {
    const stripped = stripFrontmatter(body);
    const fm = yamlFrontmatter({ description: meta.description });
    return fm + stripped;
  },
};
