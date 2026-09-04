import type { PlatformAdapter } from "./types.js";
import { stripFrontmatter } from "./yaml.js";

export const roocode: PlatformAdapter = {
  id: "roocode",
  displayName: "RooCode",
  configDir: ".roo",
  commandPath: (name, prefix) => `.roo/commands/${prefix}-${name}.md`,
  formatCommand: (body, meta, prefix: string) => {
    const stripped = stripFrontmatter(body);
    return `# ${prefix}-${meta.name}\n\n${meta.description}\n\n${stripped}`;
  },
};
