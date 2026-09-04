import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { install, dryRun, detectStale, removeStale, type PromptFn } from "../src/installer.js";
import type { OpenGoalConfig } from "../src/templates.js";

describe("installer", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "opengoal-test-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  function makeConfig(overrides?: Partial<OpenGoalConfig>): OpenGoalConfig {
    return { tools: ["claude"], subagent: false, root: tempDir, docsDir: "docs", codebaseDir: ".", prefix: "opgl", ...overrides };
  }

  const alwaysNo: PromptFn = async () => "n";
  const alwaysYes: PromptFn = async () => "y";

  describe("install - default", () => {
    it("creates core command files", async () => {
      const result = await install(makeConfig());

      expect(result.files).toContain(".claude/commands/opgl/scout.md");
      expect(result.files).toContain(".claude/commands/opgl/goal.md");
      expect(result.files).toContain(".claude/commands/opgl/context.md");
      expect(result.files).toContain(".claude/commands/opgl/design.md");
      expect(result.files).toContain(".claude/commands/opgl/roadmap.md");
      expect(result.files).toContain(".claude/commands/opgl/verify.md");
      expect(result.files).toContain(".claude/commands/opgl/recap.md");

      expect(existsSync(join(tempDir, ".claude/commands/opgl/scout.md"))).toBe(true);
      expect(existsSync(join(tempDir, ".claude/commands/opgl/goal.md"))).toBe(true);
    });

    it("creates opengoal-subagent skill by default", async () => {
      const result = await install(makeConfig());
      expect(result.files).toContain(".claude/skills/opengoal-subagent/SKILL.md");
    });

    it("creates docs/ directory", async () => {
      await install(makeConfig());
      expect(existsSync(join(tempDir, "docs"))).toBe(true);
    });

    it("does not create AGENTS.md", async () => {
      await install(makeConfig());
      expect(existsSync(join(tempDir, "AGENTS.md"))).toBe(false);
    });

    it("renders scout.md with substituted paths", async () => {
      await install(makeConfig());
      const content = readFileSync(
        join(tempDir, ".claude/commands/opgl/scout.md"),
        "utf-8",
      );
      expect(content).not.toContain("@if");
      expect(content).not.toContain("$DocsDir");
      expect(content).toContain("docs/CONTEXT.md");
    });
  });

  describe("install - custom paths", () => {
    it("substitutes custom docsDir", async () => {
      await install(makeConfig({ docsDir: "my-docs" }));
      const content = readFileSync(
        join(tempDir, ".claude/commands/opgl/scout.md"),
        "utf-8",
      );
      expect(content).toContain("my-docs");
      expect(content).not.toContain("$DocsDir");
    });

    it("substitutes custom codebaseDir", async () => {
      await install(makeConfig({ codebaseDir: "src/app" }));
      const content = readFileSync(
        join(tempDir, ".claude/commands/opgl/context.md"),
        "utf-8",
      );
      expect(content).toContain("src/app");
      expect(content).not.toContain("$CodebaseDir");
    });

    it("creates custom docs directory", async () => {
      await install(makeConfig({ docsDir: "custom/docs" }));
      expect(existsSync(join(tempDir, "custom/docs"))).toBe(true);
    });
  });

  describe("install - subagent", () => {
    it("creates opengoal-subagent skill", async () => {
      const result = await install(makeConfig({ subagent: true }));
      expect(result.files).toContain(".claude/skills/opengoal-subagent/SKILL.md");
      expect(existsSync(join(tempDir, ".claude/skills/opengoal-subagent/SKILL.md"))).toBe(true);
    });

    it("scout.md contains subagent delegation", async () => {
      await install(makeConfig({ subagent: true }));
      const content = readFileSync(
        join(tempDir, ".claude/commands/opgl/scout.md"),
        "utf-8",
      );
      expect(content).toContain("Delegate");
      expect(content).toContain("opengoal-subagent");
    });
  });

  describe("install - file protection", () => {
    it("overwrites existing files with --force", async () => {
      await install(makeConfig());

      const result = await install(makeConfig({ force: true }));
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.skipped).toHaveLength(0);
    });

    it("skips when user answers no", async () => {
      await install(makeConfig());

      const result = await install(makeConfig(), alwaysNo);
      expect(result.files).toHaveLength(0);
      expect(result.skipped.length).toBeGreaterThan(0);
      expect(result.skipped).toContain(".claude/commands/opgl/scout.md");
    });

    it("overwrites when user answers yes", async () => {
      await install(makeConfig());

      const scoutPath = join(tempDir, ".claude/commands/opgl/scout.md");
      writeFileSync(scoutPath, "custom content", "utf-8");

      const result = await install(makeConfig(), alwaysYes);
      expect(result.files.length).toBeGreaterThan(0);

      const content = readFileSync(scoutPath, "utf-8");
      expect(content).not.toBe("custom content");
    });

    it("preserves content when skipping", async () => {
      await install(makeConfig());

      const scoutPath = join(tempDir, ".claude/commands/opgl/scout.md");
      writeFileSync(scoutPath, "custom content", "utf-8");

      await install(makeConfig(), alwaysNo);

      const content = readFileSync(scoutPath, "utf-8");
      expect(content).toBe("custom content");
    });
  });

  describe("install - apply all / skip all", () => {
    it("overwrites all remaining files when user answers 'a'", async () => {
      await install(makeConfig());

      let firstCall = true;
      const answerA: PromptFn = async () => {
        if (firstCall) { firstCall = false; return "a"; }
        throw new Error("should not prompt again after 'a'");
      };

      const result = await install(makeConfig(), answerA);
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.skipped).toHaveLength(0);
    });

    it("skips all remaining files when user answers 's'", async () => {
      await install(makeConfig());

      let firstCall = true;
      const answerS: PromptFn = async () => {
        if (firstCall) { firstCall = false; return "s"; }
        throw new Error("should not prompt again after 's'");
      };

      const result = await install(makeConfig(), answerS);
      expect(result.files).toHaveLength(0);
      expect(result.skipped.length).toBeGreaterThan(0);
    });

    it("'all' works as alias for 'a'", async () => {
      await install(makeConfig());

      let firstCall = true;
      const answerAll: PromptFn = async () => {
        if (firstCall) { firstCall = false; return "all"; }
        throw new Error("should not prompt again after 'all'");
      };

      const result = await install(makeConfig(), answerAll);
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.skipped).toHaveLength(0);
    });
  });

  describe("install - multi-platform", () => {
    it("installs to cursor platform", async () => {
      const result = await install(makeConfig({ tools: ["cursor"] }));
      expect(result.files).toContain(".cursor/commands/opgl-scout.md");
      expect(existsSync(join(tempDir, ".cursor/commands/opgl-scout.md"))).toBe(true);

      const content = readFileSync(join(tempDir, ".cursor/commands/opgl-scout.md"), "utf-8");
      expect(content).toContain("name: /opgl-scout");
      expect(content).toContain("id: opgl-scout");
      expect(content).toContain("category: Workflow");
    });

    it("installs to multiple platforms simultaneously", async () => {
      const result = await install(makeConfig({ tools: ["claude", "cursor"] }));
      expect(result.files).toContain(".claude/commands/opgl/scout.md");
      expect(result.files).toContain(".cursor/commands/opgl-scout.md");
    });

    it("skills install for all platforms", async () => {
      const result = await install(makeConfig({ tools: ["claude", "cursor"], subagent: true }));
      expect(result.files).toContain(".claude/skills/opengoal-subagent/SKILL.md");
      expect(result.files).toContain(".cursor/skills/opengoal-subagent/SKILL.md");
    });

    it("cline adapter uses markdown header instead of YAML frontmatter", async () => {
      await install(makeConfig({ tools: ["cline"] }));
      const content = readFileSync(join(tempDir, ".clinerules/workflows/opgl-scout.md"), "utf-8");
      expect(content).toMatch(/^# opgl-scout\n/);
      expect(content).not.toMatch(/^---\n/);
    });

    it("github-copilot uses .prompt.md extension", async () => {
      const result = await install(makeConfig({ tools: ["github-copilot"] }));
      expect(result.files).toContain(".github/prompts/opgl-scout.prompt.md");
    });
  });

  describe("dryRun", () => {
    it("returns file list without creating files", () => {
      const result = dryRun(makeConfig());
      expect(result.files.length).toBeGreaterThan(0);
      expect(existsSync(join(tempDir, ".claude"))).toBe(false);
    });
  });

  describe("stale prefix detection and removal", () => {
    it("detects a stale install and removes it with consent", async () => {
      await install(makeConfig({ prefix: "scaff" }));
      expect(existsSync(join(tempDir, ".claude/commands/scaff/scout.md"))).toBe(true);

      const config = makeConfig({ prefix: "opgl" });
      const stale = detectStale(config, ["scaff"]);
      expect(stale.map((e) => e.dst)).toContain(".claude/commands/scaff/scout.md");
      expect(stale.map((e) => e.dst)).toContain(".claude/commands/scaff/goal.md");

      const { removed, kept } = await removeStale(config, stale, alwaysYes);
      expect(removed).toContain(".claude/commands/scaff/scout.md");
      expect(kept).toHaveLength(0);
      expect(existsSync(join(tempDir, ".claude/commands/scaff/scout.md"))).toBe(false);
    });

    it("leaves stale files in place when the prompt is declined", async () => {
      await install(makeConfig({ prefix: "scaff" }));
      const config = makeConfig({ prefix: "opgl" });
      const stale = detectStale(config, ["scaff"]);

      const { removed, kept } = await removeStale(config, stale, alwaysNo);
      expect(removed).toHaveLength(0);
      expect(kept.length).toBe(stale.length);
      expect(existsSync(join(tempDir, ".claude/commands/scaff/scout.md"))).toBe(true);
    });

    it("removes stale files without prompting when config.force is set", async () => {
      await install(makeConfig({ prefix: "scaff" }));
      const config = makeConfig({ prefix: "opgl", force: true });
      const stale = detectStale(config, ["scaff"]);

      const { removed } = await removeStale(config, stale);
      expect(removed.length).toBe(stale.length);
      expect(existsSync(join(tempDir, ".claude/commands/scaff/scout.md"))).toBe(false);
    });

    it("never touches an unrelated file sharing the same directory", async () => {
      await install(makeConfig({ prefix: "scaff", tools: ["cursor"] }));
      const otherFile = join(tempDir, ".cursor/commands/othertool-foo.md");
      writeFileSync(otherFile, "unrelated content", "utf-8");

      const config = makeConfig({ prefix: "opgl", tools: ["cursor"] });
      const stale = detectStale(config, ["scaff"]);
      await removeStale(config, stale, alwaysYes);

      expect(existsSync(otherFile)).toBe(true);
      expect(readFileSync(otherFile, "utf-8")).toBe("unrelated content");
      expect(existsSync(join(tempDir, ".cursor/commands/scaff-scout.md"))).toBe(false);
      // the shared directory itself must survive since the unrelated file remains
      expect(existsSync(join(tempDir, ".cursor/commands"))).toBe(true);
    });

    it("prunes a fully emptied stale directory, including up through configDir", async () => {
      await install(makeConfig({ prefix: "scaff" }));
      const config = makeConfig({ prefix: "opgl" });
      const stale = detectStale(config, ["scaff"]);
      await removeStale(config, stale, alwaysYes);

      expect(existsSync(join(tempDir, ".claude/commands/scaff"))).toBe(false);
      // no other prefix was ever installed, so commands/ itself is now empty too
      expect(existsSync(join(tempDir, ".claude/commands"))).toBe(false);
      // configDir itself is never removed, and the unrelated skills subtree survives
      expect(existsSync(join(tempDir, ".claude"))).toBe(true);
      expect(existsSync(join(tempDir, ".claude/skills/opengoal-subagent/SKILL.md"))).toBe(true);
    });

    it("does not prune a directory that still holds another prefix's files", async () => {
      await install(makeConfig({ prefix: "scaff" }));
      await install(makeConfig({ prefix: "opgl" }), alwaysYes);

      const config = makeConfig({ prefix: "opgl" });
      const stale = detectStale(config, ["scaff"]);
      await removeStale(config, stale, alwaysYes);

      expect(existsSync(join(tempDir, ".claude/commands/scaff"))).toBe(false);
      expect(existsSync(join(tempDir, ".claude/commands"))).toBe(true);
      expect(existsSync(join(tempDir, ".claude/commands/opgl/scout.md"))).toBe(true);
    });

    it("excludes skill entries from stale candidates", async () => {
      await install(makeConfig({ prefix: "scaff", subagent: true }));
      const config = makeConfig({ prefix: "opgl", subagent: true });
      const stale = detectStale(config, ["scaff"]);

      expect(stale.every((e) => !e.src.startsWith("skills/"))).toBe(true);
      await removeStale(config, stale, alwaysYes);
      expect(existsSync(join(tempDir, ".claude/skills/opengoal-subagent/SKILL.md"))).toBe(true);
    });

    it("never considers the current prefix stale", () => {
      const config = makeConfig({ prefix: "opgl" });
      const stale = detectStale(config, ["opgl", "scaff"]);
      expect(stale.every((e) => !e.dst.includes("/opgl/"))).toBe(true);
    });

    it("returns nothing to remove when there is no stale install", async () => {
      const config = makeConfig({ prefix: "opgl" });
      const stale = detectStale(config, ["scaff"]);
      expect(stale).toHaveLength(0);

      const { removed, kept } = await removeStale(config, stale, alwaysYes);
      expect(removed).toHaveLength(0);
      expect(kept).toHaveLength(0);
    });
  });
});
