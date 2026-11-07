import type { PlatformAdapter } from "./types.js";
import { stripFrontmatter, yamlFrontmatter } from "./yaml.js";

// Antigravity merged slash-command workflows into skills and moved its
// workspace dir from `.agent/` to `.agents/`. A skill is invoked as `/<name>`.
export const antigravity: PlatformAdapter = {
  id: "antigravity",
  displayName: "Antigravity",
  configDir: ".agents",
  commandPath: (name, prefix) => `.agents/skills/${prefix}-${name}/SKILL.md`,
  formatCommand: (body, meta, prefix) =>
    yamlFrontmatter({ name: `${prefix}-${meta.name}`, description: meta.description }) +
    stripFrontmatter(body),
  commandRef: (name, prefix) => `/${prefix}-${name}`,
  legacyLayouts: [
    {
      configDir: ".agent",
      commandPath: (name, prefix) => `.agent/workflows/${prefix}-${name}.md`,
    },
  ],
  // `.agents/skills/` is the cross-tool Agent Skills root (Codex and others
  // read it too), so only Antigravity-specific dirs count as detection.
  detectDirs: [".agent", ".agents/workflows", ".agents/rules"],
};
