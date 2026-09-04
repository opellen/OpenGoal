import type { PlatformAdapter } from "./types.js";
import { stripFrontmatter, yamlFrontmatter } from "./yaml.js";

export const githubCopilot: PlatformAdapter = {
  id: "github-copilot",
  displayName: "GitHub Copilot",
  configDir: ".github",
  commandPath: (name, prefix) => `.github/prompts/${prefix}-${name}.prompt.md`,
  formatCommand: (body, meta) => {
    const stripped = stripFrontmatter(body);
    const fm = yamlFrontmatter({ description: meta.description });
    return fm + stripped;
  },
};
