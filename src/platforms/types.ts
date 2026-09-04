export interface CommandMeta {
  name: string;
  description: string;
  category?: string;
  tags?: string[];
}

export interface PlatformAdapter {
  id: string;
  displayName: string;
  configDir: string;
  /**
   * Whether this platform supports slash commands. When false, only skills
   * are installed (e.g. Trae). Defaults to true.
   */
  supportsCommands?: boolean;
  commandPath(name: string, prefix: string): string;
  formatCommand(body: string, meta: CommandMeta, prefix: string): string;
}

export const DEFAULT_PLATFORM = "claude";
