import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
} from "node:fs";
import { join, dirname, isAbsolute, resolve } from "node:path";
import { execSync } from "node:child_process";
import { createInterface } from "node:readline";
import { parse as parseYaml } from "yaml";
import { injectHooks, type HookEntry } from "./hook-parser.js";
import { getAdapter } from "./platforms/index.js";

// `index.ts` only exposes adapters by id (no per-adapter named exports), so
// look the claude adapter up once here. It's always present in the adapter
// map (it's the platform default), so this can never be undefined.
const claude = getAdapter("claude")!;

export interface ExtendOptions {
  force: boolean;
  root: string;
  prefix?: string;
}

interface DependencySpec {
  name: string;
  check: string;
}

interface HookSpec {
  id: string;
  target: string;
  content?: string;
  file?: string;
}

interface ExtendManifest {
  name: string;
  version?: string;
  extends: string;
  requires?: string;
  commands?: string[];
  hooks?: HookSpec[];
  dependencies?: DependencySpec[];
}

export type PromptFn = (question: string) => Promise<string>;

function createDefaultPrompt(): { prompt: PromptFn; close: () => void } {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  let closed = false;
  rl.on("close", () => {
    closed = true;
  });

  const prompt: PromptFn = (question: string) => {
    if (closed) return Promise.resolve("");
    return new Promise((resolveP) => {
      rl.question(question, (answer) => {
        resolveP(answer.trim().toLowerCase());
      });
      rl.once("close", () => resolveP(""));
    });
  };

  return { prompt, close: () => rl.close() };
}

function readManifest(extensionPath: string): ExtendManifest {
  const manifestPath = join(extensionPath, "opengoal-extend.yml");
  if (!existsSync(manifestPath)) {
    throw new Error(`Missing opengoal-extend.yml at ${manifestPath}`);
  }
  const raw = readFileSync(manifestPath, "utf-8");
  let parsed: unknown;
  try {
    parsed = parseYaml(raw);
  } catch (err) {
    throw new Error(
      `Failed to parse opengoal-extend.yml: ${(err as Error).message}`,
    );
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("opengoal-extend.yml must be a YAML mapping");
  }
  return validateManifest(parsed as Record<string, unknown>);
}

function validateManifest(raw: Record<string, unknown>): ExtendManifest {
  if (typeof raw.name !== "string" || !raw.name) {
    throw new Error("opengoal-extend.yml: 'name' is required");
  }
  if (typeof raw.extends !== "string" || !raw.extends) {
    throw new Error("opengoal-extend.yml: 'extends' is required");
  }
  if (raw.extends !== "opengoal") {
    throw new Error(
      `opengoal-extend.yml: 'extends' must be "opengoal" (got "${raw.extends}"). Extension chains are not supported yet.`,
    );
  }

  const commands: string[] = [];
  if (raw.commands !== undefined) {
    if (!Array.isArray(raw.commands)) {
      throw new Error("opengoal-extend.yml: 'commands' must be a list");
    }
    for (const c of raw.commands) {
      if (typeof c !== "string" || !c) {
        throw new Error("opengoal-extend.yml: each command must be a non-empty string");
      }
      commands.push(c);
    }
  }

  const hooks: HookSpec[] = [];
  if (raw.hooks !== undefined) {
    if (!Array.isArray(raw.hooks)) {
      throw new Error("opengoal-extend.yml: 'hooks' must be a list");
    }
    for (const h of raw.hooks) {
      if (!h || typeof h !== "object") {
        throw new Error("opengoal-extend.yml: each hook must be a mapping");
      }
      const hook = h as Record<string, unknown>;
      if (typeof hook.id !== "string" || !hook.id) {
        throw new Error("opengoal-extend.yml: hook 'id' is required");
      }
      if (typeof hook.target !== "string" || !hook.target) {
        throw new Error(`opengoal-extend.yml: hook '${hook.id}' missing 'target'`);
      }
      const hasContent = hook.content !== undefined;
      const hasFile = hook.file !== undefined;
      if (hasContent && hasFile) {
        throw new Error(
          `opengoal-extend.yml: hook '${hook.id}' cannot have both 'content' and 'file'`,
        );
      }
      if (!hasContent && !hasFile) {
        throw new Error(
          `opengoal-extend.yml: hook '${hook.id}' must have either 'content' or 'file'`,
        );
      }
      if (hasContent && typeof hook.content !== "string") {
        throw new Error(
          `opengoal-extend.yml: hook '${hook.id}' 'content' must be a string`,
        );
      }
      if (hasFile && typeof hook.file !== "string") {
        throw new Error(
          `opengoal-extend.yml: hook '${hook.id}' 'file' must be a string`,
        );
      }
      hooks.push({
        id: hook.id,
        target: hook.target,
        content: hasContent ? (hook.content as string) : undefined,
        file: hasFile ? (hook.file as string) : undefined,
      });
    }
  }

  const dependencies: DependencySpec[] = [];
  if (raw.dependencies !== undefined) {
    if (!Array.isArray(raw.dependencies)) {
      throw new Error("opengoal-extend.yml: 'dependencies' must be a list");
    }
    for (const d of raw.dependencies) {
      if (!d || typeof d !== "object") {
        throw new Error("opengoal-extend.yml: each dependency must be a mapping");
      }
      const dep = d as Record<string, unknown>;
      if (typeof dep.name !== "string" || !dep.name) {
        throw new Error("opengoal-extend.yml: dependency 'name' is required");
      }
      if (typeof dep.check !== "string" || !dep.check) {
        throw new Error(
          `opengoal-extend.yml: dependency '${dep.name}' missing 'check'`,
        );
      }
      dependencies.push({ name: dep.name, check: dep.check });
    }
  }

  return {
    name: raw.name,
    version: typeof raw.version === "string" ? raw.version : undefined,
    extends: raw.extends,
    requires: typeof raw.requires === "string" ? raw.requires : undefined,
    commands,
    hooks,
    dependencies,
  };
}

function checkDependencies(deps: DependencySpec[]): void {
  for (const dep of deps) {
    try {
      execSync(dep.check, { stdio: "ignore" });
    } catch {
      throw new Error(
        `Dependency '${dep.name}' not found (check: ${dep.check})`,
      );
    }
  }
}

/**
 * Directory the claude adapter installs commands under, relative to a
 * project root (currently `.claude/commands`). Derived from the adapter's
 * own commandPath rather than hard-coded, so it stays in sync if the
 * adapter's layout ever changes.
 */
function claudeCommandsDir(root: string): string {
  const probePath = claude.commandPath("__probe__", "__prefix__");
  return join(root, dirname(dirname(probePath)));
}

/**
 * Detects the installed slash-command prefix by inspecting what's actually
 * on disk under the claude adapter's command directory. A single
 * subdirectory there is taken as the installed prefix. There is no state
 * file to consult (this project guarantees zero runtime after install), so
 * when the directory is missing, empty, or ambiguous we fail with a clear
 * message rather than guess.
 */
function detectPrefix(root: string): string {
  const commandsDir = claudeCommandsDir(root);
  if (!existsSync(commandsDir)) {
    throw new Error(
      `Cannot detect installed command prefix: ${commandsDir} does not exist. Pass --prefix explicitly.`,
    );
  }
  const subdirs = readdirSync(commandsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  if (subdirs.length === 0) {
    throw new Error(
      `Cannot detect installed command prefix: no subdirectories found under ${commandsDir}. Pass --prefix explicitly.`,
    );
  }
  if (subdirs.length > 1) {
    throw new Error(
      `Cannot detect installed command prefix: multiple candidates found under ${commandsDir} (${subdirs.sort().join(", ")}). Pass --prefix explicitly.`,
    );
  }
  return subdirs[0];
}

function resolvePrefix(root: string, explicit: string | undefined): string {
  return explicit ?? detectPrefix(root);
}

function resolveWithinExtension(
  extensionPath: string,
  relPath: string,
): string {
  if (isAbsolute(relPath)) return relPath;
  return resolve(extensionPath, relPath);
}

async function copyCommands(
  extensionPath: string,
  commands: string[],
  root: string,
  prefix: string,
  force: boolean,
  ask: PromptFn,
): Promise<{ copied: string[]; skipped: string[] }> {
  const copied: string[] = [];
  const skipped: string[] = [];
  let forceAll = force;

  for (const name of commands) {
    const src = join(extensionPath, "commands", `${name}.md`);
    if (!existsSync(src)) {
      throw new Error(`Missing command source file: ${src}`);
    }
    const dst = join(root, claude.commandPath(name, prefix));

    if (existsSync(dst) && !forceAll) {
      const answer = await ask(`File exists: ${dst}. Overwrite? (y/n/a) `);
      if (answer === "a" || answer === "all") {
        forceAll = true;
      } else if (answer !== "y" && answer !== "yes") {
        skipped.push(name);
        continue;
      }
    }

    const dir = dirname(dst);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const content = readFileSync(src, "utf-8");
    writeFileSync(dst, content, "utf-8");
    copied.push(name);
  }

  return { copied, skipped };
}

function applyHooks(
  extensionPath: string,
  hooks: HookSpec[],
  root: string,
): string[] {
  const applied: string[] = [];
  const byTarget = new Map<string, HookSpec[]>();

  for (const hook of hooks) {
    const list = byTarget.get(hook.target) ?? [];
    list.push(hook);
    byTarget.set(hook.target, list);
  }

  for (const [target, specs] of byTarget) {
    const targetPath = isAbsolute(target) ? target : join(root, target);
    if (!existsSync(targetPath)) {
      throw new Error(`Hook target file not found: ${targetPath}`);
    }
    const original = readFileSync(targetPath, "utf-8");

    const entries: HookEntry[] = specs.map((spec) => {
      let content: string;
      if (spec.content !== undefined) {
        content = spec.content;
      } else {
        const filePath = resolveWithinExtension(extensionPath, spec.file!);
        if (!existsSync(filePath)) {
          throw new Error(
            `Hook '${spec.id}' file not found: ${filePath}`,
          );
        }
        content = readFileSync(filePath, "utf-8");
      }
      // Strip trailing newline so injected content fits cleanly between markers.
      if (content.endsWith("\n")) {
        content = content.slice(0, -1);
      }
      return { id: spec.id, content };
    });

    const next = injectHooks(original, entries);
    writeFileSync(targetPath, next, "utf-8");
    for (const spec of specs) applied.push(spec.id);
  }

  return applied;
}

export interface ExtendResult {
  commandsAdded: string[];
  commandsSkipped: string[];
  hooksApplied: string[];
  dependenciesChecked: string[];
}

export async function extend(
  extensionPath: string,
  opts: ExtendOptions,
  promptFn?: PromptFn,
): Promise<ExtendResult> {
  if (!existsSync(extensionPath)) {
    throw new Error(`Extension path does not exist: ${extensionPath}`);
  }

  const manifest = readManifest(extensionPath);

  const deps = manifest.dependencies ?? [];
  checkDependencies(deps);

  const commands = manifest.commands ?? [];
  // Only resolve/detect a prefix when there are commands to install — an
  // extension that only applies hooks or checks dependencies has no need
  // for one, and shouldn't fail just because no prefix can be found.
  const prefix = commands.length > 0 ? resolvePrefix(opts.root, opts.prefix) : "";

  const defaultPrompt = promptFn ? null : createDefaultPrompt();
  const ask = promptFn ?? defaultPrompt!.prompt;

  let copyResult: { copied: string[]; skipped: string[] };
  try {
    copyResult = await copyCommands(
      extensionPath,
      commands,
      opts.root,
      prefix,
      opts.force,
      ask,
    );
  } finally {
    defaultPrompt?.close();
  }

  const hooksApplied = applyHooks(
    extensionPath,
    manifest.hooks ?? [],
    opts.root,
  );

  return {
    commandsAdded: copyResult.copied,
    commandsSkipped: copyResult.skipped,
    hooksApplied,
    dependenciesChecked: deps.map((d) => d.name),
  };
}
