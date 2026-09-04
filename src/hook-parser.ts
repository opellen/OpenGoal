export interface HookEntry {
  id: string;
  content: string;
}

const HOOK_BEGIN = /^\s*<!--\s*@hook\s+(\S+)\s*-->/;
const HOOK_END = /^\s*<!--\s*@end-hook\s+(\S+)\s*-->/;

/**
 * Validate that a file has properly paired hook markers.
 * Returns list of hook ids found.
 */
export function findHookPoints(fileContent: string): string[] {
  const ids: string[] = [];
  const lines = fileContent.split("\n");
  let openId: string | null = null;

  for (const line of lines) {
    const beginMatch = line.match(HOOK_BEGIN);
    const endMatch = line.match(HOOK_END);

    if (beginMatch) {
      if (openId !== null) {
        throw new Error(`Unclosed hook '${openId}'`);
      }
      openId = beginMatch[1];
    } else if (endMatch) {
      const endId = endMatch[1];
      if (openId === null) {
        throw new Error(`Unexpected hook end '${endId}'`);
      }
      if (endId !== openId) {
        throw new Error(
          `Mismatched hook end: expected '${openId}', got '${endId}'`,
        );
      }
      ids.push(openId);
      openId = null;
    }
  }

  if (openId !== null) {
    throw new Error(`Unclosed hook '${openId}'`);
  }

  return ids;
}

/**
 * Inject hook content into a file's text.
 * Returns the modified text.
 * Throws on errors (missing markers, mismatched pairs, non-empty hooks).
 */
export function injectHooks(fileContent: string, hooks: HookEntry[]): string {
  if (hooks.length === 0) {
    return fileContent;
  }

  const lines = fileContent.split("\n");
  const result: string[] = [];
  const injected = new Set<string>();
  const hookMap = new Map(hooks.map((h) => [h.id, h.content]));
  let openId: string | null = null;
  let openLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const beginMatch = line.match(HOOK_BEGIN);
    const endMatch = line.match(HOOK_END);

    if (beginMatch) {
      if (openId !== null) {
        throw new Error(`Unclosed hook '${openId}'`);
      }
      openId = beginMatch[1];
      openLine = i;
      result.push(line);
    } else if (endMatch) {
      const endId = endMatch[1];
      if (openId === null) {
        throw new Error(`Unexpected hook end '${endId}'`);
      }
      if (endId !== openId) {
        throw new Error(
          `Mismatched hook end: expected '${openId}', got '${endId}'`,
        );
      }

      if (i !== openLine + 1) {
        throw new Error(`Hook '${openId}' already has content`);
      }

      if (hookMap.has(openId)) {
        result.push(hookMap.get(openId)!);
        injected.add(openId);
      }

      result.push(line);
      openId = null;
    } else {
      result.push(line);
    }
  }

  if (openId !== null) {
    throw new Error(`Unclosed hook '${openId}'`);
  }

  for (const hook of hooks) {
    if (!injected.has(hook.id)) {
      throw new Error(`Hook point '${hook.id}' not found in file`);
    }
  }

  return result.join("\n");
}
