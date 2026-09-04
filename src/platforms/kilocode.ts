import type { PlatformAdapter } from "./types.js";
import { stripFrontmatter } from "./yaml.js";

export const kilocode: PlatformAdapter = {
  id: "kilocode",
  displayName: "Kilo Code",
  configDir: ".kilocode",
  commandPath: (name, prefix) => `.kilocode/workflows/${prefix}-${name}.md`,
  formatCommand: (body) => stripFrontmatter(body),
};
