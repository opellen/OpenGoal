import { describe, it, expect } from "vitest";
import { resolveTemplates, renderFile, type OpenGoalConfig } from "../src/templates.js";

const base: OpenGoalConfig = {
  tools: ["claude"],
  subagent: true,
  root: "/tmp/test",
  docsDir: "docs",
  codebaseDir: ".",
  prefix: "opgl",
};

function render(name: string, config: OpenGoalConfig): string {
  const entry = resolveTemplates(config).find((e) => e.dst === `.claude/commands/opgl/${name}.md`);
  if (!entry) throw new Error(`template ${name} not resolved`);
  return renderFile(entry, config);
}

const modes = [
  ["subagent", base],
  ["no subagent", { ...base, subagent: false }],
] as const;

describe.each(["goal", "scout"])("worktree template: %s", (name) => {
  describe.each(modes)("%s", (_label, config) => {
    const out = render(name, config);

    it("leaves no $Variable tokens", () => {
      // $ARGUMENTS is the host runtime placeholder, intentionally kept
      const left = (out.match(/\$[A-Z]\w*/g) ?? []).filter((t) => t !== "$ARGUMENTS");
      expect(left).toEqual([]);
    });

    it("leaves no marker syntax", () => {
      expect(out).not.toContain("<!-- @if");
      expect(out).not.toContain("@else");
      expect(out).not.toContain("@endif");
    });
  });
});

describe("goal.md worktree sections", () => {
  const out = render("goal", base);

  it.each([
    "/opgl:goal land [<id>]",
    "(args = land)",
    "### Worktree Detection",
    "### init (active goal present)",
    "#### init in a new worktree",
    "### archive (inside a worktree)",
    "## land",
    "### Target Resolution",
    "### Steps",
    ".opengoal/worktrees/",
    "goal/<id>",
    "|archive|land)",
    "/opgl:goal init --worktree",
    "##### Parking commit",
    "##### Worktree setup",
    "Never commit the user's work",
    "Fork precondition:",
  ])("contains %s", (s) => {
    expect(out).toContain(s);
  });

  it("states that land never resolves conflicts", () => {
    expect(out).toMatch(/land[^\n]*(never|not)[^\n]*(resolv|conflict)/i);
  });

  it("archive inside a worktree neither commits nor restores", () => {
    const section = out.slice(out.indexOf("### archive (inside a worktree)"), out.indexOf("## land"));
    expect(section).not.toMatch(/git add|git commit|git restore|git checkout/);
  });
});

describe("scout.md worktree sections", () => {
  const out = render("scout", base);

  it.each([
    "**in progress**",
    "**merge-ready**",
    "**archived, awaiting commit**",
    "**cleanup-pending**",
    "**stale**",
    "**Worktrees**",
    "Tier 0 — worktrees",
    "/opgl:goal land <id>",
    ".opengoal/worktrees/",
    "### Worktree Detection",
  ])("contains %s", (s) => {
    expect(out).toContain(s);
  });
});
