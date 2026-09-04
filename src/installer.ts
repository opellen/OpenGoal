import { existsSync, mkdirSync, writeFileSync, unlinkSync, readdirSync, rmdirSync } from "node:fs";
import { createInterface } from "node:readline";
import { join, dirname, resolve, sep } from "node:path";
import { resolveTemplates, renderFile, type OpenGoalConfig, type TemplateEntry } from "./templates.js";

export interface InstallResult {
  files: string[];
  skipped: string[];
}

export type PromptFn = (question: string) => Promise<string>;

function createDefaultPrompt(): { prompt: PromptFn; close: () => void } {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  let closed = false;
  rl.on("close", () => { closed = true; });

  const prompt: PromptFn = (question: string) => {
    if (closed) return Promise.resolve("");
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer.trim().toLowerCase());
      });
      rl.once("close", () => resolve(""));
    });
  };

  return { prompt, close: () => rl.close() };
}

export async function install(
  config: OpenGoalConfig,
  prompt?: PromptFn,
): Promise<InstallResult> {
  const defaultPrompt = prompt ? null : createDefaultPrompt();
  const askUser = prompt ?? defaultPrompt!.prompt;
  const entries = resolveTemplates(config);
  const files: string[] = [];
  const skipped: string[] = [];

  let applyAll: "overwrite" | "skip" | null = null;

  try {
    for (const entry of entries) {
      const dst = join(config.root, entry.dst);
      const dir = dirname(dst);

      if (existsSync(dst) && !config.force) {
        if (applyAll === "skip") {
          skipped.push(entry.dst);
          continue;
        }
        if (applyAll !== "overwrite") {
          const answer = await askUser(`  ${entry.dst} already exists. Overwrite? [y/N/a(all)/s(skip all)] `);
          if (answer === "a" || answer === "all") {
            applyAll = "overwrite";
          } else if (answer === "s") {
            applyAll = "skip";
            skipped.push(entry.dst);
            continue;
          } else if (answer !== "y" && answer !== "yes") {
            skipped.push(entry.dst);
            continue;
          }
        }
      }

      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      const content = renderFile(entry, config);
      writeFileSync(dst, content, "utf-8");
      files.push(entry.dst);
    }

    const docsDir = join(config.root, config.docsDir);
    if (!existsSync(docsDir)) {
      mkdirSync(docsDir, { recursive: true });
    }
  } finally {
    defaultPrompt?.close();
  }

  return { files, skipped };
}

export function dryRun(config: OpenGoalConfig): { files: string[] } {
  const entries = resolveTemplates(config);
  const files = entries.map((e) => e.dst);
  return { files };
}

/**
 * Finds command files left behind by a previous install under a stale
 * prefix (e.g. after `--prefix` changes). Candidate paths are never
 * globbed: they are exactly what resolveTemplates() would produce for the
 * old prefix, so only files opengoal itself would have written are ever
 * eligible. Skill entries are excluded (rule: skills don't carry the
 * prefix, so they can never go stale), and the current prefix is never
 * considered stale even if passed in explicitly.
 */
export function detectStale(
  config: OpenGoalConfig,
  oldPrefixes: string[],
): TemplateEntry[] {
  const seen = new Set<string>();
  const stale: TemplateEntry[] = [];

  for (const oldPrefix of oldPrefixes) {
    if (oldPrefix === config.prefix) continue;
    const entries = resolveTemplates({ ...config, prefix: oldPrefix });
    for (const entry of entries) {
      if (entry.src.startsWith("skills/")) continue;
      if (seen.has(entry.dst)) continue;
      seen.add(entry.dst);
      if (existsSync(join(config.root, entry.dst))) {
        stale.push(entry);
      }
    }
  }

  return stale;
}

/**
 * Walks upward from startDir, removing directories that are now empty,
 * stopping at (and never removing) boundaryDir itself, and stopping as
 * soon as a directory still has contents. This is what lets directory-
 * shaped adapters (.claude/commands/<prefix>/) and per-command-directory
 * shapes (.codex/skills/<prefix>-<name>/) get cleaned up without any
 * adapter-specific logic.
 */
function pruneEmptyDirs(startDir: string, boundaryDir: string): void {
  const boundary = resolve(boundaryDir);
  let dir = resolve(startDir);

  while (dir !== boundary && dir.startsWith(boundary + sep)) {
    if (!existsSync(dir)) {
      dir = dirname(dir);
      continue;
    }
    if (readdirSync(dir).length > 0) break;
    rmdirSync(dir);
    dir = dirname(dir);
  }
}

/**
 * Removes previously-detected stale files, with the same consent model as
 * install(): prompt via the shared askUser style unless config.force is
 * set, never delete silently, and report what was left behind if the user
 * declines. Emptied directories are pruned afterward (see pruneEmptyDirs).
 */
export async function removeStale(
  config: OpenGoalConfig,
  stale: TemplateEntry[],
  prompt?: PromptFn,
): Promise<{ removed: string[]; kept: string[] }> {
  const removed: string[] = [];
  const kept: string[] = [];

  if (stale.length === 0) {
    return { removed, kept };
  }

  const defaultPrompt = prompt ? null : createDefaultPrompt();
  const askUser = prompt ?? defaultPrompt!.prompt;

  try {
    let proceed = config.force === true;
    if (!proceed) {
      const answer = await askUser(
        `  Found ${stale.length} stale command file(s) from a previous prefix. Remove? [y/N] `,
      );
      proceed = answer === "y" || answer === "yes";
    }

    if (!proceed) {
      for (const entry of stale) kept.push(entry.dst);
      return { removed, kept };
    }

    for (const entry of stale) {
      const dst = join(config.root, entry.dst);
      if (!existsSync(dst)) {
        continue;
      }
      unlinkSync(dst);
      removed.push(entry.dst);
      pruneEmptyDirs(join(config.root, dirname(entry.dst)), join(config.root, entry.adapter.configDir));
    }
  } finally {
    defaultPrompt?.close();
  }

  return { removed, kept };
}
