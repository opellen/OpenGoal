#!/usr/bin/env node

import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { install, dryRun, detectStale, removeStale } from "./installer.js";
import { DEFAULT_PREFIX, type OpenGoalConfig } from "./templates.js";
import { PLATFORM_IDS, DEFAULT_PLATFORM, isValidPlatform, detectInstalledPlatforms } from "./platforms/index.js";
import { showWelcome } from "./ui/welcome.js";
import { selectPlatforms } from "./prompts/platform-select.js";
import { t } from "./i18n/index.js";
import chalk from "chalk";
import { goal, title } from "./ui/colors.js";
import { extend } from "./extend.js";

function printUsage(): void {
  console.log(`
opengoal — Goal-centric AI harness. Open structure, clear present.

Usage:
  opengoal init [options]
  opengoal extend <path> [--force] [--root <dir>]

Options:
  --docs <dir>      Documentation directory (default: docs)
  --codebase <dir>  Codebase directory (default: .)
  --tools <list>    Target platforms: comma-separated, or "all" (default: claude)
                    Available: ${PLATFORM_IDS.join(", ")}
  --no-subagent     Disable subagent delegation (enabled by default)
  --root <dir>      Target directory (default: cwd)
  --prefix <name>   Slash-command prefix (default: opgl)
  --from-prefix <name>  Also detect stale files from this previous prefix
                    (the legacy "scaff" prefix is always checked)
  --force           Overwrite existing files without prompting
  -y, --yes         Auto-confirm with detected platforms (skip interactive selection)
  --dry-run         Preview without writing files
  -h, --help        Show this help

Commands:
  init              Install opengoal into the current project
  extend <path>     Install a local extension (reads <path>/opengoal-extend.yml)
`);
}

function parseArgs(argv: string[]): {
  command: string | null;
  positional: string[];
  docsDir: string;
  codebaseDir: string;
  tools: string[] | null;
  subagent: boolean;
  root: string;
  prefix: string;
  prefixExplicit: boolean;
  fromPrefix: string | null;
  fromPrefixExplicit: boolean;
  force: boolean;
  yes: boolean;
  dryRun: boolean;
  help: boolean;
} {
  let command: string | null = null;
  const positional: string[] = [];
  let docsDir = "docs";
  let codebaseDir = ".";
  let tools: string[] | null = null;
  let subagent = true;
  let root = process.cwd();
  let prefix = DEFAULT_PREFIX;
  let prefixExplicit = false;
  let fromPrefix: string | null = null;
  let fromPrefixExplicit = false;
  let force = false;
  let yes = false;
  let isDryRun = false;
  let help = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      help = true;
    } else if (arg === "--docs") {
      const next = argv[++i];
      if (!next) {
        console.error("Error: --docs requires a directory path");
        process.exit(1);
      }
      docsDir = next;
    } else if (arg === "--codebase") {
      const next = argv[++i];
      if (!next) {
        console.error("Error: --codebase requires a directory path");
        process.exit(1);
      }
      codebaseDir = next;
    } else if (arg === "--tools") {
      const next = argv[++i];
      if (!next) {
        console.error("Error: --tools requires a platform list");
        process.exit(1);
      }
      if (next === "all") {
        tools = [...PLATFORM_IDS];
      } else {
        tools = next.split(",").map((id) => id.trim());
        for (const id of tools) {
          if (!isValidPlatform(id)) {
            console.error(`Error: unknown platform "${id}". Available: ${PLATFORM_IDS.join(", ")}`);
            process.exit(1);
          }
        }
      }
    } else if (arg === "--no-subagent") {
      subagent = false;
    } else if (arg === "--force") {
      force = true;
    } else if (arg === "-y" || arg === "--yes") {
      yes = true;
    } else if (arg === "--dry-run") {
      isDryRun = true;
    } else if (arg === "--root") {
      const next = argv[++i];
      if (!next) {
        console.error("Error: --root requires a directory path");
        process.exit(1);
      }
      root = resolve(next);
    } else if (arg === "--prefix") {
      const next = argv[++i];
      if (!next) {
        console.error("Error: --prefix requires a value");
        process.exit(1);
      }
      if (!/^[a-z][a-z0-9-]{0,15}$/.test(next)) {
        console.error(
          `Error: invalid --prefix "${next}". Must start with a lowercase letter and contain only lowercase letters, digits, and hyphens, 1-16 characters long.`,
        );
        process.exit(1);
      }
      prefix = next;
      prefixExplicit = true;
    } else if (arg === "--from-prefix") {
      const next = argv[++i];
      if (!next) {
        console.error("Error: --from-prefix requires a value");
        process.exit(1);
      }
      if (!/^[a-z][a-z0-9-]{0,15}$/.test(next)) {
        console.error(
          `Error: invalid --from-prefix "${next}". Must start with a lowercase letter and contain only lowercase letters, digits, and hyphens, 1-16 characters long.`,
        );
        process.exit(1);
      }
      fromPrefix = next;
      fromPrefixExplicit = true;
    } else if (!arg.startsWith("-")) {
      if (command === null) {
        command = arg;
      } else {
        positional.push(arg);
      }
    } else {
      console.error(`Unknown option: ${arg}`);
      printUsage();
      process.exit(1);
    }
  }

  return { command, positional, docsDir, codebaseDir, tools, subagent, root, prefix, prefixExplicit, fromPrefix, fromPrefixExplicit, force, yes, dryRun: isDryRun, help };
}

async function runExtend(args: {
  positional: string[];
  root: string;
  force: boolean;
  prefix: string;
  prefixExplicit: boolean;
}): Promise<void> {
  const extPath = args.positional[0];
  if (!extPath) {
    console.error("Error: opengoal extend requires a path argument");
    printUsage();
    process.exit(1);
  }
  const resolvedExt = resolve(extPath);
  if (!existsSync(resolvedExt)) {
    console.error(`Error: extension path does not exist: ${resolvedExt}`);
    process.exit(1);
  }
  if (!existsSync(args.root)) {
    console.error(`Error: target directory does not exist: ${args.root}`);
    process.exit(1);
  }

  try {
    const result = await extend(resolvedExt, {
      force: args.force,
      root: args.root,
      prefix: args.prefixExplicit ? args.prefix : undefined,
    });

    if (result.commandsAdded.length > 0) {
      console.log(
        `${chalk.green("\u2713")} Commands added: ${result.commandsAdded.join(", ")}`,
      );
    }
    if (result.commandsSkipped.length > 0) {
      console.log(
        `${chalk.yellow("~")} Commands skipped: ${result.commandsSkipped.join(", ")}`,
      );
    }
    if (result.hooksApplied.length > 0) {
      console.log(
        `${chalk.green("\u2713")} Hooks applied: ${result.hooksApplied.join(", ")}`,
      );
    }
    if (result.dependenciesChecked.length > 0) {
      console.log(`${chalk.green("\u2713")} Dependencies: all found`);
    }
    process.exit(0);
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || !args.command) {
    printUsage();
    process.exit(args.help ? 0 : 1);
  }

  if (args.command === "extend") {
    await runExtend(args);
    return;
  }

  if (args.command !== "init") {
    console.error(`Unknown command: ${args.command}`);
    printUsage();
    process.exit(1);
  }

  if (!existsSync(args.root)) {
    console.error(`Error: target directory does not exist: ${args.root}`);
    process.exit(1);
  }

  let tools: string[];
  if (args.tools) {
    tools = args.tools;
  } else if (args.yes) {
    const detected = detectInstalledPlatforms(args.root);
    tools = detected.length > 0 ? detected : [DEFAULT_PLATFORM];
    console.log(chalk.dim(`Auto-selected: ${tools.join(", ")}`));
  } else if (process.stdin.isTTY && !args.dryRun) {
    await showWelcome();
    tools = await selectPlatforms(args.root);
  } else {
    tools = [DEFAULT_PLATFORM];
  }

  const config: OpenGoalConfig = {
    tools,
    subagent: args.subagent,
    root: args.root,
    docsDir: args.docsDir,
    codebaseDir: args.codebaseDir,
    prefix: args.prefix,
    force: args.force,
  };

  const oldPrefixes = Array.from(
    new Set(["scaff", ...(args.fromPrefixExplicit ? [args.fromPrefix as string] : [])]),
  ).filter((p) => p !== config.prefix);
  const stale = detectStale(config, oldPrefixes);

  if (args.dryRun) {
    const result = dryRun(config);
    console.log(t("cli.dryRun") + "\n");
    for (const file of result.files) {
      console.log(`  ${chalk.green("+")} ${file}`);
    }
    if (stale.length > 0) {
      console.log("\nStale files from a previous prefix (would be removed):");
      for (const entry of stale) {
        console.log(`  ${chalk.red("-")} ${entry.dst}`);
      }
    }
    return;
  }

  const result = await install(config);
  console.log(t("cli.complete") + "\n");

  if (result.files.length > 0) {
    console.log(t("cli.installed"));
    for (const file of result.files) {
      console.log(`  ${chalk.green("+")} ${file}`);
    }
  }

  if (result.skipped.length > 0) {
    console.log("\n" + t("cli.skipped"));
    for (const file of result.skipped) {
      console.log(`  ${chalk.yellow("~")} ${file}`);
    }
  }

  if (stale.length > 0) {
    console.log("\nStale files from a previous prefix:");
    for (const entry of stale) {
      console.log(`  ${chalk.yellow("!")} ${entry.dst}`);
    }
    const { removed, kept } = await removeStale(config, stale);
    if (removed.length > 0) {
      console.log("\nRemoved stale files:");
      for (const file of removed) {
        console.log(`  ${chalk.red("-")} ${file}`);
      }
    }
    if (kept.length > 0) {
      console.log("\nLeft in place (not removed):");
      for (const file of kept) {
        console.log(`  ${chalk.dim("~")} ${file}`);
      }
    }
  }

  console.log("\n" + title(t("cli.nextSteps")));
  console.log("  " + chalk.dim("1.") + " " + t("cli.step1"));
  console.log("  " + chalk.dim("2.") + " " + t("cli.step2").replace("{cmd}", goal(`/${args.prefix}:scout`)));

  process.exit(0);
}

main();
