import type { PlatformAdapter } from "./types.js";
import { stripFrontmatter, yamlFrontmatter } from "./yaml.js";

export const kimi: PlatformAdapter = {
  id: "kimi",
  displayName: "Kimi Code",
  configDir: ".kimi-code",
  commandPath: (name, prefix) => `.kimi-code/skills/${prefix}-${name}/SKILL.md`,
  formatCommand: (body, meta, prefix) =>
    yamlFrontmatter({ name: `${prefix}-${meta.name}`, description: meta.description }) +
    stripFrontmatter(body),
  commandRef: (name, prefix) => `/skill:${prefix}-${name}`,
};
