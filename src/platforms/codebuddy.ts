import type { PlatformAdapter } from "./types.js";
import { stripFrontmatter, yamlFrontmatter } from "./yaml.js";

export const codebuddy: PlatformAdapter = {
  id: "codebuddy",
  displayName: "CodeBuddy",
  configDir: ".codebuddy",
  commandPath: (name, prefix) => `.codebuddy/commands/${prefix}/${name}.md`,
  formatCommand: (body, meta, prefix: string) => {
    const stripped = stripFrontmatter(body);
    const fm = yamlFrontmatter({
      name: `${prefix}:${meta.name}`,
      description: meta.description,
      "argument-hint": "[command arguments]",
    });
    return fm + stripped;
  },
};
