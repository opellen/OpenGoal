import type { PlatformAdapter } from "./types.js";
import { stripFrontmatter } from "./yaml.js";
import { escapeTomlString, escapeTomlMultiline } from "./toml.js";

export const gemini: PlatformAdapter = {
  id: "gemini",
  displayName: "Gemini CLI",
  configDir: ".gemini",
  commandPath: (name, prefix) => `.gemini/commands/${prefix}/${name}.toml`,
  formatCommand: (body, meta) => {
    const stripped = stripFrontmatter(body);
    const description = escapeTomlString(meta.description);
    const prompt = escapeTomlMultiline(stripped.trimEnd());
    return `description = "${description}"\n\nprompt = """\n${prompt}\n"""\n`;
  },
};
