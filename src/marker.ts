export interface MarkerBlock {
  fullMatch: string;
  condition: string;
  ifBlock: string;
  elseBlock: string | undefined;
}

export interface RenderContext {
  conditions: Record<string, boolean>;
}

const MARKER_SOURCE =
  "<!-- @if (\\w+) -->\\n([\\s\\S]*?)(?:<!-- @else -->\\n([\\s\\S]*?))?<!-- @endif -->";

export function parseMarkers(content: string): MarkerBlock[] {
  const blocks: MarkerBlock[] = [];
  let match: RegExpExecArray | null;
  const regex = new RegExp(MARKER_SOURCE, "g");

  while ((match = regex.exec(content)) !== null) {
    blocks.push({
      fullMatch: match[0],
      condition: match[1],
      ifBlock: match[2],
      elseBlock: match[3],
    });
  }

  return blocks;
}

export function renderTemplate(content: string, ctx: RenderContext): string {
  const regex = new RegExp(MARKER_SOURCE, "g");

  return content.replace(
    regex,
    (_match, condition: string, ifBlock: string, elseBlock?: string) => {
      const enabled = ctx.conditions[condition] ?? false;
      if (enabled) {
        return ifBlock.trimEnd();
      }
      return elseBlock?.trimEnd() ?? "";
    },
  );
}