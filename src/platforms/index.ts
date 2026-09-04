import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { PlatformAdapter } from "./types.js";
import { claude } from "./claude.js";
import { cursor } from "./cursor.js";
import { windsurf } from "./windsurf.js";
import { cline } from "./cline.js";
import { codex } from "./codex.js";
import { githubCopilot } from "./github-copilot.js";
import { continueAdapter } from "./continue.js";
import { amazonQ } from "./amazon-q.js";
import { antigravity } from "./antigravity.js";
import { auggie } from "./auggie.js";
import { codebuddy } from "./codebuddy.js";
import { costrict } from "./costrict.js";
import { crush } from "./crush.js";
import { factory } from "./factory.js";
import { gemini } from "./gemini.js";
import { iflow } from "./iflow.js";
import { kilocode } from "./kilocode.js";
import { kiro } from "./kiro.js";
import { opencode } from "./opencode.js";
import { pi } from "./pi.js";
import { qoder } from "./qoder.js";
import { qwen } from "./qwen.js";
import { roocode } from "./roocode.js";
import { trae } from "./trae.js";

export type { PlatformAdapter, CommandMeta } from "./types.js";
export { DEFAULT_PLATFORM } from "./types.js";

const ALL_ADAPTERS: PlatformAdapter[] = [
  claude, cursor, windsurf, cline, codex, githubCopilot, continueAdapter,
  amazonQ, antigravity, auggie, codebuddy, costrict, crush, factory,
  gemini, iflow, kilocode, kiro, opencode, pi, qoder, qwen, roocode, trae,
];

const ADAPTER_MAP = new Map(ALL_ADAPTERS.map((a) => [a.id, a]));
if (ADAPTER_MAP.size !== ALL_ADAPTERS.length) throw new Error("duplicate adapter id");

export const PLATFORM_IDS = [
  "claude", "cursor", "windsurf", "cline", "codex", "github-copilot", "continue",
  "amazon-q", "antigravity", "auggie", "codebuddy", "costrict", "crush", "factory",
  "gemini", "iflow", "kilocode", "kiro", "opencode", "pi", "qoder", "qwen", "roocode", "trae",
] as const;
if (PLATFORM_IDS.length !== ALL_ADAPTERS.length) throw new Error("PLATFORM_IDS out of sync");

export type PlatformId = typeof PLATFORM_IDS[number];

export function isValidPlatform(id: string): id is PlatformId {
  return ADAPTER_MAP.has(id);
}

export function getAdapter(id: string): PlatformAdapter | undefined {
  return ADAPTER_MAP.get(id);
}

export function getAdapters(ids: string[]): PlatformAdapter[] {
  return ids.map((id) => {
    const adapter = ADAPTER_MAP.get(id);
    if (!adapter) throw new Error(`Unknown platform: ${id}`);
    return adapter;
  });
}

export function getAllAdapters(): PlatformAdapter[] {
  return [...ALL_ADAPTERS];
}

export function detectInstalledPlatforms(projectRoot: string): string[] {
  const detected: string[] = [];
  for (const adapter of ALL_ADAPTERS) {
    if (existsSync(resolve(projectRoot, adapter.configDir))) {
      detected.push(adapter.id);
    }
  }
  return detected;
}
