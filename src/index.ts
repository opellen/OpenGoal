export { parseMarkers, renderTemplate, type MarkerBlock, type RenderContext } from "./marker.js";
export { resolveTemplates, renderFile, type OpenGoalConfig, type TemplateEntry } from "./templates.js";
export { install, dryRun, type InstallResult, type PromptFn } from "./installer.js";
export {
  getAdapter, getAdapters, getAllAdapters, isValidPlatform,
  PLATFORM_IDS, DEFAULT_PLATFORM,
  type PlatformId, type PlatformAdapter, type CommandMeta,
} from "./platforms/index.js";
