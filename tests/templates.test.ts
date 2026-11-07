import { describe, it, expect } from "vitest";
import {
  resolveTemplates,
  renderFile,
  type OpenGoalConfig,
  type TemplateEntry,
} from "../src/templates.js";
import { getAdapter } from "../src/platforms/index.js";

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

  it("codex installs a display manifest beside every skill, claude none", () => {
    const codex = resolveTemplates({ ...baseConfig, tools: ["codex"] });
    const manifest = codex.find((e) => e.dst === ".codex/skills/opgl-go/agents/openai.yaml");
    expect(manifest?.generated).toBe(true);
    expect(manifest?.rawContent).toContain('display_name: "OpenGoal: Go"');
    expect(manifest?.rawContent).toContain('short_description: "Execute the next task in GOAL.md"');
    expect(renderFile(manifest!, { ...baseConfig, tools: ["codex"] })).toBe(manifest!.rawContent);

    const flow = codex.find((e) => e.dst === ".codex/skills/opengoal-flow/agents/openai.yaml");
    expect(flow?.rawContent).toContain('display_name: "OpenGoal Flow"');
    expect(flow?.rawContent).toMatch(/short_description: ".+"/);

    const claude = resolveTemplates(baseConfig);
    expect(claude.some((e) => e.dst.endsWith("agents/openai.yaml"))).toBe(false);
  });

  it("trae installs skills only (no commands)", () => {
    const entries = resolveTemplates({ ...baseConfig, tools: ["trae"] });
    const dsts = entries.map((e) => e.dst);
    expect(dsts).toContain(".trae/skills/opengoal-subagent/SKILL.md");
    expect(dsts.some((d) => d.startsWith(".trae/commands"))).toBe(false);
  });

  it("kimi renders nine workflows and two support skills without companions", () => {
    const config = { ...baseConfig, tools: ["kimi"], prefix: "acme" };
    const entries = resolveTemplates(config);
    expect(entries).toHaveLength(11);
    expect(entries.filter((e) => e.src.startsWith("commands/"))).toHaveLength(9);
    expect(entries.filter((e) => e.src.startsWith("skills/"))).toHaveLength(2);
    expect(entries.every((e) => e.dst.startsWith(".kimi-code/skills/") && e.dst.endsWith("/SKILL.md"))).toBe(true);
    expect(entries.some((e) => e.generated)).toBe(false);
    const scout = entries.find((e) => e.dst === ".kimi-code/skills/acme-scout/SKILL.md")!;
    const rendered = renderFile(scout, config);
    expect(rendered).toContain("name: acme-scout\n");
    expect(rendered).toContain("/skill:acme-");
    expect(rendered).not.toContain("/$CommandPrefix:");
    expect(rendered).not.toContain("**Delegate** exploration tasks");
    expect(renderFile(scout, { ...config, subagent: true })).toContain("**Delegate** exploration tasks");
    const flow = entries.find((e) => e.dst === ".kimi-code/skills/opengoal-flow/SKILL.md")!;
    expect(renderFile(flow, config)).toContain("/skill:acme-");
    expect(renderFile(flow, config)).not.toContain("/$CommandPrefix:");
  });

  it("antigravity renders nine skills and two support skills under .agents/skills", () => {
    const config = { ...baseConfig, tools: ["antigravity"], prefix: "acme" };
    const entries = resolveTemplates(config);
    expect(entries).toHaveLength(11);
    expect(entries.every((e) => e.dst.startsWith(".agents/skills/") && e.dst.endsWith("/SKILL.md"))).toBe(true);
    expect(entries.map((e) => e.dst)).toContain(".agents/skills/opengoal-flow/SKILL.md");
    const scout = entries.find((e) => e.dst === ".agents/skills/acme-scout/SKILL.md")!;
    const rendered = renderFile(scout, config);
    expect(rendered).toContain("name: acme-scout\n");
    expect(rendered).toContain("/acme-");
    expect(rendered).not.toContain("/acme:");
    expect(rendered).not.toContain("/$CommandPrefix:");
    const flow = entries.find((e) => e.dst === ".agents/skills/opengoal-flow/SKILL.md")!;
    expect(renderFile(flow, config)).not.toContain("/acme:");
  });
});

describe("renderFile command references", () => {
  const config: OpenGoalConfig = {
    tools: ["claude"],
    subagent: false,
    root: "/tmp/test",
    docsDir: "docs",
    codebaseDir: ".",
    prefix: "opgl",
  };
  const claude = getAdapter("claude")!;
  const rawContent = "Run /$CommandPrefix:go, then /$CommandPrefix:goal checkpoint. Dir: $CommandPrefix/";
  const entry = (adapter: typeof claude): TemplateEntry => ({
    src: "commands/go.md",
    dst: adapter.commandPath("go", config.prefix),
    adapter,
    meta: { name: "go", description: "" },
    rawContent,
  });

  it("renders the Claude slash form by default", () => {
    expect(renderFile(entry(claude), config)).toBe(
      "Run /opgl:go, then /opgl:goal checkpoint. Dir: opgl/",
    );
  });

  it("uses the adapter's commandRef when the platform invokes commands differently", () => {
    const custom = { ...claude, commandRef: (name: string, prefix: string) => `$${prefix}-${name}` };
    expect(renderFile(entry(custom), config)).toBe(
      "Run $opgl-go, then $opgl-goal checkpoint. Dir: opgl/",
    );
  });
});
