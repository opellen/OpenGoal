export function stripFrontmatter(content: string): string {
  const match = content.match(/^---\n[\s\S]*?\n---\n/);
  return match ? content.slice(match[0].length) : content;
}

/**
 * Escapes a string value for safe YAML output.
 * Returns a plain scalar when possible; double-quotes only when the value
 * contains special YAML characters or looks ambiguous.
 */
export function escapeYamlValue(value: string): string {
  const needsQuoting = /[:\n\r#{}[\],&*!|>'"%@`]|^\s|\s$/.test(value);
  if (needsQuoting) {
    const escaped = value
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n");
    return `"${escaped}"`;
  }
  return value;
}

export function formatYamlArray(items: string[]): string {
  return `[${items.map(escapeYamlValue).join(", ")}]`;
}

export type YamlFieldValue = string | string[];

export function yamlFrontmatter(
  fields: Record<string, YamlFieldValue>,
): string {
  const lines = Object.entries(fields).map(([k, v]) => {
    const rendered = Array.isArray(v) ? formatYamlArray(v) : escapeYamlValue(v);
    return `${k}: ${rendered}`;
  });
  return `---\n${lines.join("\n")}\n---\n`;
}
