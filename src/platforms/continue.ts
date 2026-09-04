import type { PlatformAdapter } from "./types.js";
import { stripFrontmatter, yamlFrontmatter } from "./yaml.js";

export const continueAdapter: PlatformAdapter = {
  id: "continue",
  displayName: "Continue",
  configDir: ".continue",
  commandPath: (name, prefix) => `.continue/prompts/${prefix}-${name}.prompt`,
  formatCommand: (body, meta, prefix: string) => {
    const stripped = stripFrontmatter(body);
    const fm = yamlFrontmatter({
      name: `${prefix}-${meta.name}`,
      description: meta.description,
      invokable: "true",
    });
    return fm + stripped;
  },
};
