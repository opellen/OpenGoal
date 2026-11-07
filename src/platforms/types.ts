export interface CommandMeta {
  name: string;
  description: string;
  category?: string;
  tags?: string[];
}

/** An extra file a platform wants installed next to a command or skill. */
export interface CompanionFile {
  /** Install path relative to the project root. */
  dst: string;
  content: string;
}

export interface CompanionTarget {
  kind: "command" | "skill";
  /** Command name ("go") or skill name ("opengoal-flow"). */
  name: string;
  description: string;
  /** Install path of the file the companions accompany. */
  dst: string;
  prefix: string;
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
  /**
   * How an installed command is invoked on this platform, as written in the
   * prose that templates emit ("run /opgl:go"). Platforms whose invocation
   * differs from the Claude Code slash form `/<prefix>:<name>` override this;
   * when omitted that form is used.
   */
  commandRef?(name: string, prefix: string): string;
  /**
   * Extra files the platform needs beside an installed command or skill, such
   * as Codex's `agents/openai.yaml` display manifest. They are installed and
   * uninstalled together with the file they accompany.
   */
  companionFiles?(target: CompanionTarget): CompanionFile[];
  /**
   * Earlier install layouts of this platform (e.g. a renamed config dir).
   * Re-installing offers to remove the files opengoal itself wrote there,
   * found by exact path (never a glob). `configDir` is the root that emptied
   * directories are pruned up to; the root itself is never removed.
   */
  legacyLayouts?: Array<{
    configDir: string;
    commandPath(name: string, prefix: string): string;
  }>;
  /**
   * Directories whose presence means this platform is in use, for
   * auto-detection. Defaults to `configDir` plus every legacy `configDir`.
   * Set it when `configDir` is a root other tools share (e.g. `.agents/`),
   * so that root alone does not count as detection.
   */
  detectDirs?: string[];
}

export const DEFAULT_PLATFORM = "claude";
