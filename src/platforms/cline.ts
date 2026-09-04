import type { PlatformAdapter } from "./types.js";
import { stripFrontmatter } from "./yaml.js";

export const cline: PlatformAdapter = {
  id: "cline",
  displayName: "Cline",
  configDir: ".cline",
  commandPath: (name, prefix) => `.clinerules/workflows/${prefix}-${name}.md`,
  formatCommand: (body, meta, prefix: string) => {
    const stripped = stripFrontmatter(body);
    return `# ${prefix}-${meta.name}\n\n${meta.description}\n\n${stripped}`;
  },
};
