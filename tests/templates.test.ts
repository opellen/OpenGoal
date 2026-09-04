import { describe, it, expect } from "vitest";
import { resolveTemplates, type OpenGoalConfig } from "../src/templates.js";

describe("resolveTemplates", () => {
  const baseConfig: OpenGoalConfig = {
    tools: ["claude"],
    subagent: false,
    root: "/tmp/test",
    docsDir: "docs",
    codebaseDir: ".",
    prefix: "opgl",
  };

  it("returns core commands and skills by default", () => {
    const entries = resolveTemplates(baseConfig);
    const dsts = entries.map((e) => e.dst);

    expect(dsts).toContain(".claude/commands/opgl/scout.md");
    expect(dsts).toContain(".claude/commands/opgl/goal.md");
    expect(dsts).toContain(".claude/commands/opgl/context.md");
    expect(dsts).toContain(".claude/commands/opgl/design.md");
    expect(dsts).toContain(".claude/commands/opgl/roadmap.md");
    expect(dsts).toContain(".claude/commands/opgl/verify.md");
    expect(dsts).toContain(".claude/commands/opgl/recap.md");
    expect(dsts).toContain(".claude/skills/opengoal-subagent/SKILL.md");
  });

  it("installs skills regardless of subagent flag", () => {
    const entries = resolveTemplates({ ...baseConfig, subagent: true });
    const dsts = entries.map((e) => e.dst);
    expect(dsts).toContain(".claude/skills/opengoal-subagent/SKILL.md");
    expect(dsts).toContain(".claude/commands/opgl/scout.md");
  });

  it("trae installs skills only (no commands)", () => {
    const entries = resolveTemplates({ ...baseConfig, tools: ["trae"] });
    const dsts = entries.map((e) => e.dst);
    expect(dsts).toContain(".trae/skills/opengoal-subagent/SKILL.md");
    expect(dsts.some((d) => d.startsWith(".trae/commands"))).toBe(false);
  });
});
