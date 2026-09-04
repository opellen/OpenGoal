import { describe, it, expect } from "vitest";
import { parseMarkers, renderTemplate } from "../src/marker.js";

describe("parseMarkers", () => {
  it("parses @if without @else", () => {
    const content = `before
<!-- @if monorepo -->
mono content
<!-- @endif -->
after`;
    const blocks = parseMarkers(content);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].condition).toBe("monorepo");
    expect(blocks[0].ifBlock).toContain("mono content");
    expect(blocks[0].elseBlock).toBeUndefined();
  });

  it("parses @if with @else", () => {
    const content = `<!-- @if subagent -->
agent content
<!-- @else -->
direct content
<!-- @endif -->`;
    const blocks = parseMarkers(content);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].condition).toBe("subagent");
    expect(blocks[0].ifBlock).toContain("agent content");
    expect(blocks[0].elseBlock).toContain("direct content");
  });

  it("parses multiple blocks", () => {
    const content = `<!-- @if monorepo -->
A
<!-- @endif -->
middle
<!-- @if subagent -->
B
<!-- @else -->
C
<!-- @endif -->`;
    const blocks = parseMarkers(content);
    expect(blocks).toHaveLength(2);
  });
});

describe("renderTemplate", () => {
  it("includes if-block when condition is true", () => {
    const content = `before
<!-- @if monorepo -->
mono only
<!-- @endif -->
after`;
    const result = renderTemplate(content, { conditions: { monorepo: true } });
    expect(result).toContain("mono only");
    expect(result).toContain("before");
    expect(result).toContain("after");
    expect(result).not.toContain("@if");
  });

  it("removes if-block when condition is false", () => {
    const content = `before
<!-- @if monorepo -->
mono only
<!-- @endif -->
after`;
    const result = renderTemplate(content, { conditions: { monorepo: false } });
    expect(result).not.toContain("mono only");
    expect(result).toContain("before");
    expect(result).toContain("after");
  });

  it("uses else-block when condition is false", () => {
    const content = `<!-- @if subagent -->
agent
<!-- @else -->
direct
<!-- @endif -->`;
    const result = renderTemplate(content, { conditions: { subagent: false } });
    expect(result).toContain("direct");
    expect(result).not.toContain("agent");
  });

  it("handles multiple conditions", () => {
    const content = `<!-- @if monorepo -->
mono
<!-- @endif -->
<!-- @if subagent -->
agent
<!-- @else -->
direct
<!-- @endif -->`;
    const result = renderTemplate(content, {
      conditions: { monorepo: true, subagent: false },
    });
    expect(result).toContain("mono");
    expect(result).toContain("direct");
    expect(result).not.toContain("agent");
  });

  it("defaults unknown conditions to false", () => {
    const content = `<!-- @if unknown -->
hidden
<!-- @endif -->
visible`;
    const result = renderTemplate(content, { conditions: {} });
    expect(result).not.toContain("hidden");
    expect(result).toContain("visible");
  });
});
