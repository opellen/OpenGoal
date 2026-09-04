import type { PlatformAdapter, CommandMeta } from "./types.js";
import {
  stripFrontmatter,
  yamlFrontmatter,
  type YamlFieldValue,
} from "./yaml.js";

export const cursor: PlatformAdapter = {
  id: "cursor",
  displayName: "Cursor",
  configDir: ".cursor",
  commandPath: (name, prefix) => `.cursor/commands/${prefix}-${name}.md`,
  formatCommand: (body, meta: CommandMeta, prefix: string) => {
    const stripped = stripFrontmatter(body);
    const fields: Record<string, YamlFieldValue> = {
      name: `/${prefix}-${meta.name}`,
      id: `${prefix}-${meta.name}`,
    };
    if (meta.category) fields.category = meta.category;
    fields.description = meta.description;
    return yamlFrontmatter(fields) + stripped;
  },
};
