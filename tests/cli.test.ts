import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const CLI_PATH = join(import.meta.dirname, "..", "dist", "cli.js");

describe("CLI E2E", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "opengoal-e2e-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  function run(...args: string[]): string {
    return execFileSync("node", [CLI_PATH, ...args], {
      encoding: "utf-8",
      cwd: tempDir,
    });
  }

  function runExpectFail(...args: string[]): string {
    try {
      execFileSync("node", [CLI_PATH, ...args], {
        encoding: "utf-8",
        cwd: tempDir,
        stdio: ["pipe", "pipe", "pipe"],
      });
      throw new Error("Expected command to fail");
    } catch (err: unknown) {
      const e = err as { stderr?: string; status?: number };
      return e.stderr ?? "";
    }
  }

  it("shows help with --help", () => {
    const output = run("--help");
    expect(output).toContain("opengoal");
    expect(output).toContain("init");
    expect(output).toContain("--docs");
    expect(output).toContain("--no-subagent");
    expect(output).toContain("--tools");
    expect(output).toContain("--prefix");
    expect(output).toContain("--from-prefix");
  });

  it("shows help with no arguments", () => {
    const stderr = runExpectFail();
    // No command → exits with 1 but shows usage
    expect(stderr).toBe(""); // usage goes to stdout
  });

  it("fails on unknown command", () => {
    const stderr = runExpectFail("foobar");
    expect(stderr).toContain("Unknown command");
  });

  it("fails on non-existent root directory", () => {
    const stderr = runExpectFail("init", "--root", "/nonexistent/path/xyz");
    expect(stderr).toContain("does not exist");
  });

  it("installs files with init", () => {
    const output = run("init", "--root", tempDir);
    expect(output).toContain("opengoal init complete");
    expect(output).toContain("scout.md");
    expect(existsSync(join(tempDir, ".claude/commands/opgl/scout.md"))).toBe(true);
    expect(existsSync(join(tempDir, ".claude/commands/opgl/goal.md"))).toBe(true);
    expect(existsSync(join(tempDir, ".claude/commands/opgl/verify.md"))).toBe(true);
    expect(existsSync(join(tempDir, "AGENTS.md"))).toBe(false);
    // subagent is enabled by default
    expect(existsSync(join(tempDir, ".claude/skills/opengoal-subagent/SKILL.md"))).toBe(true);
  });

  it("no-subagent mode still installs opengoal-subagent skill", () => {
    run("init", "--root", tempDir, "--no-subagent");
    expect(existsSync(join(tempDir, ".claude/skills/opengoal-subagent/SKILL.md"))).toBe(true);
    expect(existsSync(join(tempDir, ".claude/commands/opgl/scout.md"))).toBe(true);
  });

  it("skips existing files on second run (no stdin → default no)", () => {
    run("init", "--root", tempDir);
    const output = run("init", "--root", tempDir);
    expect(output).toContain("Skipped");
  });

  it("overwrites with --force", () => {
    run("init", "--root", tempDir);
    const output = run("init", "--root", tempDir, "--force");
    expect(output).not.toContain("Skipped");
    expect(output).toContain("scout.md");
  });

  it("dry-run does not create files", () => {
    const output = run("init", "--root", tempDir, "--dry-run");
    expect(output).toContain("Dry run");
    expect(existsSync(join(tempDir, ".claude"))).toBe(false);
  });

  it("custom --docs substitutes $DocsDir in templates", () => {
    run("init", "--root", tempDir, "--docs", "my-docs");
    const content = readFileSync(
      join(tempDir, ".claude/commands/opgl/scout.md"),
      "utf-8",
    );
    expect(content).toContain("my-docs");
    expect(content).not.toContain("$DocsDir");
  });

  it("custom --codebase substitutes $CodebaseDir in templates", () => {
    run("init", "--root", tempDir, "--codebase", "src/app");
    const content = readFileSync(
      join(tempDir, ".claude/commands/opgl/context.md"),
      "utf-8",
    );
    expect(content).toContain("src/app");
  });

  it("uses the default prefix when --prefix is absent", () => {
    run("init", "--root", tempDir);
    expect(existsSync(join(tempDir, ".claude/commands/opgl/scout.md"))).toBe(true);
  });

  it("accepts a valid custom --prefix", () => {
    run("init", "--root", tempDir, "--prefix", "acme");
    expect(existsSync(join(tempDir, ".claude/commands/acme/scout.md"))).toBe(true);
  });

  it("rejects a --prefix with an uppercase letter", () => {
    const stderr = runExpectFail("init", "--root", tempDir, "--prefix", "Acme");
    expect(stderr).toContain("invalid --prefix");
  });

  it("rejects a --prefix containing a slash", () => {
    const stderr = runExpectFail("init", "--root", tempDir, "--prefix", "ac/me");
    expect(stderr).toContain("invalid --prefix");
  });

  it("fails when --prefix is missing its value", () => {
    const stderr = runExpectFail("init", "--root", tempDir, "--prefix");
    expect(stderr).toContain("--prefix requires a value");
  });

  it("--tools installs to specified platform", () => {
    run("init", "--root", tempDir, "--tools", "cursor");
    expect(existsSync(join(tempDir, ".cursor/commands/opgl-scout.md"))).toBe(true);
    expect(existsSync(join(tempDir, ".claude"))).toBe(false);
  });

  it("--tools all installs to all platforms", () => {
    run("init", "--root", tempDir, "--tools", "all", "--no-subagent");
    expect(existsSync(join(tempDir, ".claude/commands/opgl/scout.md"))).toBe(true);
    expect(existsSync(join(tempDir, ".cursor/commands/opgl-scout.md"))).toBe(true);
    expect(existsSync(join(tempDir, ".windsurf/workflows/opgl-scout.md"))).toBe(true);
  });

  it("--tools claude,cursor installs to both platforms", () => {
    run("init", "--root", tempDir, "--tools", "claude,cursor", "--no-subagent");
    expect(existsSync(join(tempDir, ".claude/commands/opgl/scout.md"))).toBe(true);
    expect(existsSync(join(tempDir, ".cursor/commands/opgl-scout.md"))).toBe(true);
    expect(existsSync(join(tempDir, ".windsurf"))).toBe(false);
  });

  it("without --tools, non-TTY defaults to claude", () => {
    // In test env, stdin is not TTY, so tools defaults to ["claude"]
    run("init", "--root", tempDir);
    expect(existsSync(join(tempDir, ".claude/commands/opgl/scout.md"))).toBe(true);
    expect(existsSync(join(tempDir, ".cursor"))).toBe(false);
    expect(existsSync(join(tempDir, ".windsurf"))).toBe(false);
  });

  it("--tools rejects unknown platform", () => {
    const stderr = runExpectFail("init", "--root", tempDir, "--tools", "unknown");
    expect(stderr).toContain("unknown platform");
  });

  it("subagent skill is installed by default", () => {
    run("init", "--root", tempDir);
    expect(existsSync(join(tempDir, ".claude/skills/opengoal-subagent/SKILL.md"))).toBe(true);

    const content = readFileSync(
      join(tempDir, ".claude/commands/opgl/scout.md"),
      "utf-8",
    );
    expect(content).toContain("Delegate");
  });

  describe("stale prefix cleanup", () => {
    it("--dry-run reports stale files from a previous prefix without deleting them", () => {
      run("init", "--root", tempDir, "--prefix", "scaff");
      const output = run("init", "--root", tempDir, "--prefix", "acme", "--dry-run");
      expect(output).toContain(".claude/commands/scaff/scout.md");
      expect(existsSync(join(tempDir, ".claude/commands/scaff/scout.md"))).toBe(true);
    });

    it("leaves stale files in place when the removal prompt is declined (no stdin)", () => {
      run("init", "--root", tempDir, "--prefix", "scaff");
      const output = run("init", "--root", tempDir, "--prefix", "acme");
      expect(output).toContain(".claude/commands/scaff/scout.md");
      expect(existsSync(join(tempDir, ".claude/commands/scaff/scout.md"))).toBe(true);
    });

    it("--force removes stale files from a previous prefix and prunes the emptied directory", () => {
      run("init", "--root", tempDir, "--prefix", "scaff");
      run("init", "--root", tempDir, "--prefix", "acme", "--force");
      expect(existsSync(join(tempDir, ".claude/commands/scaff/scout.md"))).toBe(false);
      expect(existsSync(join(tempDir, ".claude/commands/scaff"))).toBe(false);
      expect(existsSync(join(tempDir, ".claude/commands/acme/scout.md"))).toBe(true);
    });

    it("never touches an unrelated file living in the same shared directory", () => {
      run("init", "--root", tempDir, "--prefix", "scaff", "--tools", "cursor");
      const otherFile = join(tempDir, ".cursor/commands/othertool-foo.md");
      writeFileSync(otherFile, "unrelated", "utf-8");

      run("init", "--root", tempDir, "--prefix", "acme", "--tools", "cursor", "--force");
      expect(existsSync(otherFile)).toBe(true);
      expect(readFileSync(otherFile, "utf-8")).toBe("unrelated");
      expect(existsSync(join(tempDir, ".cursor/commands/scaff-scout.md"))).toBe(false);
    });

    it("--from-prefix detects stale files under a custom legacy prefix", () => {
      run("init", "--root", tempDir, "--prefix", "oldname");
      const output = run(
        "init", "--root", tempDir, "--prefix", "newname", "--from-prefix", "oldname", "--dry-run",
      );
      expect(output).toContain(".claude/commands/oldname/scout.md");
    });

    it("rejects an invalid --from-prefix value", () => {
      const stderr = runExpectFail("init", "--root", tempDir, "--from-prefix", "Bad Name");
      expect(stderr).toContain("invalid --from-prefix");
    });

    it("fails when --from-prefix is missing its value", () => {
      const stderr = runExpectFail("init", "--root", tempDir, "--from-prefix");
      expect(stderr).toContain("--from-prefix requires a value");
    });

    it("does not report stale files when nothing from a legacy prefix is installed", () => {
      run("init", "--root", tempDir);
      const output = run("init", "--root", tempDir, "--force");
      expect(output).not.toContain("Stale");
    });
  });
});
