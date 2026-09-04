import type { PlatformAdapter } from "./types.js";
import { stripFrontmatter, yamlFrontmatter } from "./yaml.js";

export const auggie: PlatformAdapter = {
  id: "auggie",
  displayName: "Augment CLI",
  configDir: ".augment",
  commandPath: (name, prefix) => `.augment/commands/${prefix}-${name}.md`,
  formatCommand: (body, meta) => {
    const stripped = stripFrontmatter(body);
    const fm = yamlFrontmatter({
      description: meta.description,
      "argument-hint": "command arguments",
    });
    return fm + stripped;
  },
};
