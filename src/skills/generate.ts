import type { PlatformAdapter } from "../platforms/index.js";

/**
 * Skill installation path per platform.
 * Skill content is universal (single format across all platforms);
 * platforms differ only in where the SKILL.md file is placed.
 */
export function skillInstallPath(
  adapter: PlatformAdapter,
  skillName: string,
): string {
  return `${adapter.configDir}/skills/${skillName}/SKILL.md`;
}

/**
 * Produces the final skill file content.
 * Currently a passthrough — reserved for future enrichment
 * (license, compatibility, metadata.author/version/generatedBy).
 */
export function formatSkill(body: string): string {
  return body;
}
