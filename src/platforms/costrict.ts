import type { PlatformAdapter } from "./types.js";
import { stripFrontmatter, yamlFrontmatter } from "./yaml.js";

export const costrict: PlatformAdapter = {
  id: "costrict",
  displayName: "CoStrict",
  configDir: ".cospec",
  commandPath: (name, prefix) => `.cospec/${prefix}/commands/${prefix}-${name}.md`,
  formatCommand: (body, meta) => {
    const stripped = stripFrontmatter(body);
    const fm = yamlFrontmatter({
      description: meta.description,
      "argument-hint": "command arguments",
    });
    return fm + stripped;
  },
};
