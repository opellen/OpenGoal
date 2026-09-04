import { describe, it, expect } from "vitest";
import {
  getAdapter,
  getAdapters,
  getAllAdapters,
  PLATFORM_IDS,
  type CommandMeta,
} from "../src/platforms/index.js";
import { skillInstallPath } from "../src/skills/generate.js";

const TEST_PREFIX = "tpfx";

const meta: CommandMeta = {
  name: "scout",
  description: "Project scout (project-name)",
  category: "Workflow",
  tags: ["workflow", "opengoal", "scout"],
};

const sampleContent = `---
name: "opengoal:scout"
description: "Project scout (project-name)"
category: Workflow
tags: [workflow, opengoal, scout]
---
# Scout content here
`;

describe("platforms", () => {
  describe("registry", () => {
    it("PLATFORM_IDS contains all 24 platforms", () => {
      expect(PLATFORM_IDS).toHaveLength(24);
    });

    it("getAdapter returns undefined for unknown id", () => {
      expect(getAdapter("unknown")).toBeUndefined();
    });

    it("getAdapters throws for unknown id", () => {
      expect(() => getAdapters(["claude", "nope"])).toThrow("Unknown platform: nope");
    });

    it("getAllAdapters returns all adapters", () => {
      expect(getAllAdapters()).toHaveLength(24);
    });
  });

  // ── Per-platform output verification ─────────────────────────

  describe("claude adapter", () => {
    const adapter = getAdapter("claude")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout", TEST_PREFIX)).toBe(".claude/commands/tpfx/scout.md");
    });
    it("formatCommand preserves template (pass-through)", () => {
      expect(adapter.formatCommand(sampleContent, meta, TEST_PREFIX)).toBe(sampleContent);
    });
  });

  describe("cursor adapter", () => {
    const adapter = getAdapter("cursor")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout", TEST_PREFIX)).toBe(".cursor/commands/tpfx-scout.md");
    });
    it("formatCommand emits name/id/category/description", () => {
      const out = adapter.formatCommand(sampleContent, meta, TEST_PREFIX);
      expect(out).toContain("name: /tpfx-scout");
      expect(out).toContain("id: tpfx-scout");
      expect(out).toContain("category: Workflow");
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).toContain("# Scout content here");
    });
  });

  describe("windsurf adapter", () => {
    const adapter = getAdapter("windsurf")!;
    it("commandPath", () => {
      expect(adapter.commandPath("goal", TEST_PREFIX)).toBe(".windsurf/workflows/tpfx-goal.md");
    });
    it("formatCommand emits name/description/category/tags", () => {
      const out = adapter.formatCommand(sampleContent, meta, TEST_PREFIX);
      expect(out).toContain('name: "tpfx:scout"');
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).toContain("category: Workflow");
      expect(out).toContain("tags: [workflow, opengoal, scout]");
    });
  });

  describe("cline adapter", () => {
    const adapter = getAdapter("cline")!;
    it("commandPath uses .clinerules/workflows/", () => {
      expect(adapter.commandPath("scout", TEST_PREFIX)).toBe(".clinerules/workflows/tpfx-scout.md");
    });
    it("formatCommand uses markdown header", () => {
      const out = adapter.formatCommand(sampleContent, meta, TEST_PREFIX);
      expect(out).toMatch(/^# tpfx-scout\n/);
      expect(out).toContain("Project scout (project-name)");
      expect(out).not.toContain("---");
    });
  });

  describe("codex adapter", () => {
    const adapter = getAdapter("codex")!;
    it("commandPath installs as skill file", () => {
      expect(adapter.commandPath("scout", TEST_PREFIX)).toBe(".codex/skills/tpfx-scout/SKILL.md");
    });
    it("formatCommand preserves content", () => {
      expect(adapter.formatCommand(sampleContent, meta, TEST_PREFIX)).toBe(sampleContent);
    });
  });

  describe("github-copilot adapter", () => {
    const adapter = getAdapter("github-copilot")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout", TEST_PREFIX)).toBe(".github/prompts/tpfx-scout.prompt.md");
    });
    it("formatCommand emits description only", () => {
      const out = adapter.formatCommand(sampleContent, meta, TEST_PREFIX);
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).not.toMatch(/^name:/m);
    });
  });

  describe("continue adapter", () => {
    const adapter = getAdapter("continue")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout", TEST_PREFIX)).toBe(".continue/prompts/tpfx-scout.prompt");
    });
    it("formatCommand emits name/description/invokable", () => {
      const out = adapter.formatCommand(sampleContent, meta, TEST_PREFIX);
      expect(out).toContain("name: tpfx-scout");
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).toContain("invokable: true");
    });
  });

  describe("amazon-q adapter", () => {
    const adapter = getAdapter("amazon-q")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout", TEST_PREFIX)).toBe(".amazonq/prompts/tpfx-scout.md");
    });
    it("formatCommand emits description only", () => {
      const out = adapter.formatCommand(sampleContent, meta, TEST_PREFIX);
      expect(out).toContain("description: Project scout (project-name)");
    });
  });

  describe("antigravity adapter", () => {
    const adapter = getAdapter("antigravity")!;
    it("commandPath uses .agent/workflows/", () => {
      expect(adapter.commandPath("scout", TEST_PREFIX)).toBe(".agent/workflows/tpfx-scout.md");
    });
    it("formatCommand emits description only", () => {
      const out = adapter.formatCommand(sampleContent, meta, TEST_PREFIX);
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).not.toMatch(/^name:/m);
    });
  });

  describe("auggie adapter", () => {
    const adapter = getAdapter("auggie")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout", TEST_PREFIX)).toBe(".augment/commands/tpfx-scout.md");
    });
    it("formatCommand emits description + argument-hint", () => {
      const out = adapter.formatCommand(sampleContent, meta, TEST_PREFIX);
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).toContain("argument-hint: command arguments");
    });
  });

  describe("codebuddy adapter", () => {
    const adapter = getAdapter("codebuddy")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout", TEST_PREFIX)).toBe(".codebuddy/commands/tpfx/scout.md");
    });
    it("formatCommand emits name/description/argument-hint", () => {
      const out = adapter.formatCommand(sampleContent, meta, TEST_PREFIX);
      expect(out).toContain('name: "tpfx:scout"');
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).toContain('argument-hint: "[command arguments]"');
    });
  });

  describe("costrict adapter", () => {
    const adapter = getAdapter("costrict")!;
    it("commandPath uses .cospec/opengoal/commands/", () => {
      expect(adapter.commandPath("scout", TEST_PREFIX)).toBe(".cospec/tpfx/commands/tpfx-scout.md");
    });
    it("formatCommand emits description + argument-hint", () => {
      const out = adapter.formatCommand(sampleContent, meta, TEST_PREFIX);
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).toContain("argument-hint: command arguments");
    });
  });

  describe("crush adapter", () => {
    const adapter = getAdapter("crush")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout", TEST_PREFIX)).toBe(".crush/commands/tpfx/scout.md");
    });
    it("formatCommand emits name/description/category/tags", () => {
      const out = adapter.formatCommand(sampleContent, meta, TEST_PREFIX);
      expect(out).toContain('name: "tpfx:scout"');
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).toContain("category: Workflow");
      expect(out).toContain("tags: [workflow, opengoal, scout]");
    });
  });

  describe("factory adapter", () => {
    const adapter = getAdapter("factory")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout", TEST_PREFIX)).toBe(".factory/commands/tpfx-scout.md");
    });
    it("formatCommand emits description + argument-hint", () => {
      const out = adapter.formatCommand(sampleContent, meta, TEST_PREFIX);
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).toContain("argument-hint: command arguments");
    });
  });

  describe("gemini adapter", () => {
    const adapter = getAdapter("gemini")!;
    it("commandPath uses .toml extension", () => {
      expect(adapter.commandPath("scout", TEST_PREFIX)).toBe(".gemini/commands/tpfx/scout.toml");
    });
    it("formatCommand emits TOML with description + prompt", () => {
      const out = adapter.formatCommand(sampleContent, meta, TEST_PREFIX);
      expect(out).toContain('description = "Project scout (project-name)"');
      expect(out).toContain('prompt = """');
      expect(out).toContain("# Scout content here");
      expect(out).not.toContain("---");
    });
  });

  describe("iflow adapter", () => {
    const adapter = getAdapter("iflow")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout", TEST_PREFIX)).toBe(".iflow/commands/tpfx-scout.md");
    });
    it("formatCommand emits name/id/category/description", () => {
      const out = adapter.formatCommand(sampleContent, meta, TEST_PREFIX);
      expect(out).toContain("name: /tpfx-scout");
      expect(out).toContain("id: tpfx-scout");
      expect(out).toContain("category: Workflow");
      expect(out).toContain("description: Project scout (project-name)");
    });
  });

  describe("kilocode adapter", () => {
    const adapter = getAdapter("kilocode")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout", TEST_PREFIX)).toBe(".kilocode/workflows/tpfx-scout.md");
    });
    it("formatCommand strips frontmatter entirely", () => {
      const out = adapter.formatCommand(sampleContent, meta, TEST_PREFIX);
      expect(out).not.toContain("---");
      expect(out).toContain("# Scout content here");
    });
  });

  describe("kiro adapter", () => {
    const adapter = getAdapter("kiro")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout", TEST_PREFIX)).toBe(".kiro/prompts/tpfx-scout.prompt.md");
    });
    it("formatCommand emits description only", () => {
      const out = adapter.formatCommand(sampleContent, meta, TEST_PREFIX);
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).not.toMatch(/^name:/m);
    });
  });

  describe("opencode adapter", () => {
    const adapter = getAdapter("opencode")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout", TEST_PREFIX)).toBe(".opencode/command/tpfx-scout.md");
    });
    it("formatCommand emits description only", () => {
      const out = adapter.formatCommand(sampleContent, meta, TEST_PREFIX);
      expect(out).toContain("description: Project scout (project-name)");
    });
  });

  describe("pi adapter", () => {
    const adapter = getAdapter("pi")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout", TEST_PREFIX)).toBe(".pi/prompts/tpfx-scout.md");
    });
    it("formatCommand emits description only", () => {
      const out = adapter.formatCommand(sampleContent, meta, TEST_PREFIX);
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).not.toMatch(/^name:/m);
    });
  });

  describe("qoder adapter", () => {
    const adapter = getAdapter("qoder")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout", TEST_PREFIX)).toBe(".qoder/commands/tpfx/scout.md");
    });
    it("formatCommand emits name/description/category/tags", () => {
      const out = adapter.formatCommand(sampleContent, meta, TEST_PREFIX);
      expect(out).toContain('name: "tpfx:scout"');
      expect(out).toContain("description: Project scout (project-name)");
      expect(out).toContain("category: Workflow");
      expect(out).toContain("tags: [workflow, opengoal, scout]");
    });
  });

  describe("qwen adapter", () => {
    const adapter = getAdapter("qwen")!;
    it("commandPath uses .toml extension", () => {
      expect(adapter.commandPath("scout", TEST_PREFIX)).toBe(".qwen/commands/tpfx-scout.toml");
    });
    it("formatCommand emits TOML with description + prompt", () => {
      const out = adapter.formatCommand(sampleContent, meta, TEST_PREFIX);
      expect(out).toContain('description = "Project scout (project-name)"');
      expect(out).toContain('prompt = """');
      expect(out).toContain("# Scout content here");
      expect(out).not.toContain("---");
    });
  });

  describe("roocode adapter", () => {
    const adapter = getAdapter("roocode")!;
    it("commandPath", () => {
      expect(adapter.commandPath("scout", TEST_PREFIX)).toBe(".roo/commands/tpfx-scout.md");
    });
    it("formatCommand uses markdown header", () => {
      const out = adapter.formatCommand(sampleContent, meta, TEST_PREFIX);
      expect(out).toMatch(/^# tpfx-scout\n/);
      expect(out).not.toContain("---");
    });
  });

  describe("trae adapter", () => {
    const adapter = getAdapter("trae")!;
    it("supportsCommands is false (skills-only)", () => {
      expect(adapter.supportsCommands).toBe(false);
    });
  });

  // ── Smoke test: all adapters well-formed ─────────────────────

  describe("all adapters have required shape", () => {
    for (const id of PLATFORM_IDS) {
      it(`${id} adapter is well-formed`, () => {
        const adapter = getAdapter(id)!;
        expect(adapter).toBeDefined();
        expect(adapter.id).toBe(id);
        expect(adapter.displayName).toBeTruthy();
        expect(adapter.configDir).toMatch(/^\./);
        expect(adapter.commandPath("test", TEST_PREFIX)).toBeTruthy();
        expect(skillInstallPath(adapter, "opengoal-subagent"))
          .toMatch(/\/skills\/opengoal-subagent\/SKILL\.md$/);
        const out = adapter.formatCommand(sampleContent, meta, TEST_PREFIX);
        expect(out).toBeTruthy();
        expect(out).toContain("Scout content here");
      });
    }
  });

  describe("prefix propagation", () => {
    it("every adapter's commandPath uses the given prefix", () => {
      for (const adapter of getAllAdapters()) {
        const path = adapter.commandPath("scout", TEST_PREFIX);
        expect(path, adapter.id).toContain(TEST_PREFIX);
        expect(path, adapter.id).not.toContain("opengoal");
      }
    });

    // formatCommand has no sound universal assertion: emitting the prefix is
    // optional. claude/codex/trae pass the body through unchanged, and several
    // adapters emit description only. Coverage lives in the per-adapter blocks
    // above, where every adapter that derives a field from the prefix asserts
    // it explicitly against TEST_PREFIX.
  });
});
