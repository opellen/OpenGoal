import type { PlatformAdapter, CommandMeta } from "./types.js";
import {
  stripFrontmatter,
  yamlFrontmatter,
  type YamlFieldValue,
} from "./yaml.js";

export const windsurf: PlatformAdapter = {
  id: "windsurf",
  displayName: "Windsurf",
  configDir: ".windsurf",
  commandPath: (name, prefix) => `.windsurf/workflows/${prefix}-${name}.md`,
  formatCommand: (body, meta: CommandMeta, prefix: string) => {
    const stripped = stripFrontmatter(body);
    const fields: Record<string, YamlFieldValue> = {
      name: `${prefix}:${meta.name}`,
      description: meta.description,
    };
    if (meta.category) fields.category = meta.category;
    if (meta.tags && meta.tags.length > 0) fields.tags = meta.tags;
    return yamlFrontmatter(fields) + stripped;
  },
};
