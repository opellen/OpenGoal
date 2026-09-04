/**
 * Escapes a TOML basic string (double-quoted).
 */
export function escapeTomlString(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

/**
 * Escapes a TOML multi-line basic string (triple-quoted).
 * Only the sequence `"""` needs escaping inside the body.
 */
export function escapeTomlMultiline(value: string): string {
  return value.replace(/"""/g, '\\"\\"\\"');
}
