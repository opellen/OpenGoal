import type { PlatformAdapter } from "./types.js";
import { stripFrontmatter, yamlFrontmatter } from "./yaml.js";

export const factory: PlatformAdapter = {
  id: "factory",
  displayName: "Factory Droid",
  configDir: ".factory",
  commandPath: (name, prefix) => `.factory/commands/${prefix}-${name}.md`,
  formatCommand: (body, meta) => {
    const stripped = stripFrontmatter(body);
    const fm = yamlFrontmatter({
      description: meta.description,
      "argument-hint": "command arguments",
    });
    return fm + stripped;
  },
};
