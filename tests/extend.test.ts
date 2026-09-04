import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  mkdtempSync,
  rmSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { extend } from "../src/extend.js";

interface Extension {
  manifest: string;
  commandFiles?: Record<string, string>;
  hookFiles?: Record<string, string>;
}

function makeExtensionDir(base: string, ext: Extension): string {
  const dir = join(base, "ext");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "opengoal-extend.yml"), ext.manifest, "utf-8");

  if (ext.commandFiles) {
    const cmdDir = join(dir, "commands");
    mkdirSync(cmdDir, { recursive: true });
    for (const [name, body] of Object.entries(ext.commandFiles)) {
      writeFileSync(join(cmdDir, name), body, "utf-8");
    }
  }

  if (ext.hookFiles) {
    for (const [relPath, body] of Object.entries(ext.hookFiles)) {
      const full = join(dir, relPath);
      mkdirSync(join(full, ".."), { recursive: true });
      writeFileSync(full, body, "utf-8");
    }
  }

  return dir;
}

function setupProjectTarget(root: string, relPath: string, body: string): string {
  const full = join(root, relPath);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(full, body, "utf-8");
  return full;
}

describe("extend", () => {
  let tempDir: string;
  let projectRoot: string;
  let extBase: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "opengoal-extend-"));
    projectRoot = join(tempDir, "project");
    extBase = join(tempDir, "ext-base");
    mkdirSync(projectRoot, { recursive: true });
    mkdirSync(extBase, { recursive: true });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("happy path: copies commands and applies hooks", async () => {
    const extDir = makeExtensionDir(extBase, {
      manifest: `name: opengoal-learn
version: 0.1.0
extends: opengoal

commands:
  - learn
  - drill

hooks:
  - id: context-brief-source
    target: .claude/commands/context.md
    content: |
      - source: textbook
  - id: context-workflow-steps
    target: .claude/commands/context.md
    file: hooks/context-workflow-steps.md
`,
      commandFiles: {
        "learn.md": "# Learn command\n",
        "drill.md": "# Drill command\n",
      },
      hookFiles: {
        "hooks/context-workflow-steps.md": "- step A\n- step B\n",
      },
    });

    setupProjectTarget(
      projectRoot,
      ".claude/commands/context.md",
      `# Context
<!-- @hook context-brief-source -->
<!-- @end-hook context-brief-source -->
middle
<!-- @hook context-workflow-steps -->
<!-- @end-hook context-workflow-steps -->
end
`,
    );

    const result = await extend(extDir, {
      force: true,
      root: projectRoot,
      prefix: "acme",
    });

    expect(result.commandsAdded).toEqual(["learn", "drill"]);
    expect(result.hooksApplied).toContain("context-brief-source");
    expect(result.hooksApplied).toContain("context-workflow-steps");

    expect(
      existsSync(join(projectRoot, ".claude/commands/acme/learn.md")),
    ).toBe(true);
    expect(
      existsSync(join(projectRoot, ".claude/commands/acme/drill.md")),
    ).toBe(true);

    const contextContent = readFileSync(
      join(projectRoot, ".claude/commands/context.md"),
      "utf-8",
    );
    expect(contextContent).toContain("source: textbook");
    expect(contextContent).toContain("- step A");
    expect(contextContent).toContain("- step B");
  });

  it("missing opengoal-extend.yml → error", async () => {
    const extDir = join(extBase, "empty");
    mkdirSync(extDir, { recursive: true });
    await expect(
      extend(extDir, { force: true, root: projectRoot }),
    ).rejects.toThrow(/Missing opengoal-extend\.yml/);
  });

  it("wrong extends value → error", async () => {
    const extDir = makeExtensionDir(extBase, {
      manifest: `name: bad
extends: other-tool
`,
    });
    await expect(
      extend(extDir, { force: true, root: projectRoot }),
    ).rejects.toThrow(/extends.*must be "opengoal"/);
  });

  it("content + file both present → error", async () => {
    const extDir = makeExtensionDir(extBase, {
      manifest: `name: bad
extends: opengoal
hooks:
  - id: both
    target: .claude/commands/context.md
    content: "x"
    file: hooks/both.md
`,
    });
    await expect(
      extend(extDir, { force: true, root: projectRoot }),
    ).rejects.toThrow(/both 'content' and 'file'/);
  });

  it("hook target file missing → error", async () => {
    const extDir = makeExtensionDir(extBase, {
      manifest: `name: test
extends: opengoal
hooks:
  - id: missing-target-hook
    target: .claude/commands/missing.md
    content: "stuff"
`,
    });
    await expect(
      extend(extDir, { force: true, root: projectRoot }),
    ).rejects.toThrow(/Hook target file not found/);
  });

  it("dependency check fails → error", async () => {
    const extDir = makeExtensionDir(extBase, {
      manifest: `name: test
extends: opengoal
dependencies:
  - name: definitely-not-installed-xyz
    check: "definitely-not-installed-xyz-cmd --version"
`,
    });
    await expect(
      extend(extDir, { force: true, root: projectRoot }),
    ).rejects.toThrow(/Dependency 'definitely-not-installed-xyz' not found/);
  });

  it("missing command source file → error", async () => {
    const extDir = makeExtensionDir(extBase, {
      manifest: `name: test
extends: opengoal
commands:
  - nonexistent
`,
    });
    await expect(
      extend(extDir, { force: true, root: projectRoot, prefix: "acme" }),
    ).rejects.toThrow(/Missing command source file/);
  });

  it("hook with hook-file that doesn't exist → error", async () => {
    const extDir = makeExtensionDir(extBase, {
      manifest: `name: test
extends: opengoal
hooks:
  - id: some-hook
    target: .claude/commands/context.md
    file: hooks/missing.md
`,
    });
    setupProjectTarget(
      projectRoot,
      ".claude/commands/context.md",
      `<!-- @hook some-hook -->
<!-- @end-hook some-hook -->
`,
    );
    await expect(
      extend(extDir, { force: true, root: projectRoot }),
    ).rejects.toThrow(/Hook 'some-hook' file not found/);
  });

  it("--force overwrites existing command files", async () => {
    const extDir = makeExtensionDir(extBase, {
      manifest: `name: test
extends: opengoal
commands:
  - learn
`,
      commandFiles: {
        "learn.md": "# New learn content\n",
      },
    });

    setupProjectTarget(
      projectRoot,
      ".claude/commands/acme/learn.md",
      "# Old content\n",
    );

    const result = await extend(extDir, {
      force: true,
      root: projectRoot,
      prefix: "acme",
    });

    expect(result.commandsAdded).toEqual(["learn"]);
    const content = readFileSync(
      join(projectRoot, ".claude/commands/acme/learn.md"),
      "utf-8",
    );
    expect(content).toBe("# New learn content\n");
  });

  it("dependency check that succeeds does not throw", async () => {
    // 'node --version' should always succeed in this test environment
    const extDir = makeExtensionDir(extBase, {
      manifest: `name: test
extends: opengoal
dependencies:
  - name: node
    check: "node --version"
`,
    });
    const result = await extend(extDir, { force: true, root: projectRoot });
    expect(result.dependenciesChecked).toEqual(["node"]);
  });

  describe("prefix detection", () => {
    it("detects the installed prefix from a single subdirectory under .claude/commands", async () => {
      const extDir = makeExtensionDir(extBase, {
        manifest: `name: test
extends: opengoal
commands:
  - learn
`,
        commandFiles: {
          "learn.md": "# Learn command\n",
        },
      });

      // Simulate a prior `init --prefix acme`: only the command dir exists,
      // there is no state file to read.
      mkdirSync(join(projectRoot, ".claude/commands/acme"), { recursive: true });

      const result = await extend(extDir, { force: true, root: projectRoot });

      expect(result.commandsAdded).toEqual(["learn"]);
      expect(
        existsSync(join(projectRoot, ".claude/commands/acme/learn.md")),
      ).toBe(true);
    });

    it("no subdirectory under .claude/commands → error", async () => {
      const extDir = makeExtensionDir(extBase, {
        manifest: `name: test
extends: opengoal
commands:
  - learn
`,
        commandFiles: {
          "learn.md": "# Learn command\n",
        },
      });

      // .claude/commands exists but is empty — nothing to detect from.
      mkdirSync(join(projectRoot, ".claude/commands"), { recursive: true });

      await expect(
        extend(extDir, { force: true, root: projectRoot }),
      ).rejects.toThrow(/Cannot detect installed command prefix/);
    });

    it("multiple subdirectories under .claude/commands → error", async () => {
      const extDir = makeExtensionDir(extBase, {
        manifest: `name: test
extends: opengoal
commands:
  - learn
`,
        commandFiles: {
          "learn.md": "# Learn command\n",
        },
      });

      mkdirSync(join(projectRoot, ".claude/commands/acme"), { recursive: true });
      mkdirSync(join(projectRoot, ".claude/commands/other"), { recursive: true });

      await expect(
        extend(extDir, { force: true, root: projectRoot }),
      ).rejects.toThrow(/Cannot detect installed command prefix/);
    });

    it("explicit prefix overrides detection", async () => {
      const extDir = makeExtensionDir(extBase, {
        manifest: `name: test
extends: opengoal
commands:
  - learn
`,
        commandFiles: {
          "learn.md": "# Learn command\n",
        },
      });

      // A different prefix is installed on disk; the explicit option wins.
      mkdirSync(join(projectRoot, ".claude/commands/other"), { recursive: true });

      const result = await extend(extDir, {
        force: true,
        root: projectRoot,
        prefix: "acme",
      });

      expect(result.commandsAdded).toEqual(["learn"]);
      expect(
        existsSync(join(projectRoot, ".claude/commands/acme/learn.md")),
      ).toBe(true);
    });
  });
});
