import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderTemplate } from "./marker.js";
import { getAdapters, type PlatformAdapter, type CommandMeta } from "./platforms/index.js";
import { skillInstallPath, formatSkill } from "./skills/generate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = join(__dirname, "..", "templates");

// Installed CLI version — injected into skill metadata.generatedBy.
// Read once at module load from the shipped package.json.
const OPENGOAL_VERSION: string = (() => {
  try {
    const pkg = JSON.parse(
      readFileSync(join(__dirname, "..", "package.json"), "utf-8"),
    );
    return String(pkg.version ?? "0.0.0");
  } catch {
    return "0.0.0";
  }
})();

export const DEFAULT_PREFIX = "opgl";

export interface OpenGoalConfig {
  tools: string[];
  subagent: boolean;
  root: string;
  docsDir: string;
  codebaseDir: string;
  prefix: string;
  force?: boolean;
}

export interface TemplateEntry {
  src: string;
  dst: string;
  adapter: PlatformAdapter;
  meta: CommandMeta;
  rawContent: string;
}

const COMMAND_TEMPLATES = [
  "scout", "goal", "context", "design",
  "roadmap", "verify", "recap", "overview", "go",
];

const SKILL_TEMPLATES = [
  { src: "skills/opengoal-subagent/SKILL.md", skillName: "opengoal-subagent" },
  { src: "skills/opengoal-flow/SKILL.md", skillName: "opengoal-flow" },
];

function parseMeta(content: string): CommandMeta {
  const normalized = content.replace(/\r\n/g, "\n");
  const fmMatch = normalized.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return { name: "", description: "" };
  const fm = fmMatch[1];
  const nameMatch = fm.match(/name:\s*"?(?:[\w-]+:)?([\w-]+)"?/);
  const descMatch = fm.match(/description:\s*"([^"]+)"/);
  const categoryMatch = fm.match(/category:\s*(\S+)/);
  const tagsMatch = fm.match(/tags:\s*\[([^\]]*)\]/);
  const tags = tagsMatch
    ? tagsMatch[1]
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean)
    : undefined;
  return {
    name: nameMatch?.[1] ?? "",
    description: descMatch?.[1] ?? "",
    category: categoryMatch?.[1],
    tags,
  };
}

export function resolveTemplates(config: OpenGoalConfig): TemplateEntry[] {
  const adapters = getAdapters(config.tools);
  const entries: TemplateEntry[] = [];

  const commandMetas = COMMAND_TEMPLATES.map((cmd) => {
    const src = `commands/${cmd}.md`;
    const rawContent = readFileSync(join(TEMPLATE_DIR, src), "utf-8");
    return { cmd, src, rawContent, meta: parseMeta(rawContent) };
  });

  const skillContents = SKILL_TEMPLATES.map((skill) => ({
    ...skill,
    rawContent: readFileSync(join(TEMPLATE_DIR, skill.src), "utf-8"),
  }));

  for (const adapter of adapters) {
    if (adapter.supportsCommands !== false) {
      for (const { cmd, src, rawContent, meta } of commandMetas) {
        entries.push({ src, dst: adapter.commandPath(cmd, config.prefix), adapter, meta, rawContent });
      }
    }
    for (const skill of skillContents) {
      entries.push({
        src: skill.src,
        dst: skillInstallPath(adapter, skill.skillName),
        adapter,
        meta: { name: skill.skillName, description: "" },
        rawContent: skill.rawContent,
      });
    }
  }

  return entries;
}

export function renderFile(entry: TemplateEntry, config: OpenGoalConfig): string {
  const content = entry.rawContent.replace(/\r\n/g, "\n");

  const rendered = renderTemplate(content, {
    conditions: {
      subagent: config.subagent,
    },
  });

  const substituted = rendered
    .replace(/\$DocsDir/g, config.docsDir)
    .replace(/\$CodebaseDir/g, config.codebaseDir)
    .replace(/\$OpenGoalVersion/g, OPENGOAL_VERSION)
    .replace(/\$CommandPrefix/g, config.prefix);

  if (entry.src.startsWith("skills/")) {
    return formatSkill(substituted);
  }

  return entry.adapter.formatCommand(substituted, entry.meta, config.prefix);
}
