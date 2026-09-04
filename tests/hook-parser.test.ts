import { describe, it, expect } from "vitest";
import { injectHooks, findHookPoints } from "../src/hook-parser.js";

describe("injectHooks", () => {
  it("injects into a single empty hook point", () => {
    const file = `before
<!-- @hook context-brief-source -->
<!-- @end-hook context-brief-source -->
after`;
    const result = injectHooks(file, [
      { id: "context-brief-source", content: "injected content" },
    ]);
    expect(result).toContain("injected content");
    expect(result).toContain("before");
    expect(result).toContain("after");
    expect(result).toContain("<!-- @hook context-brief-source -->");
    expect(result).toContain("<!-- @end-hook context-brief-source -->");
  });

  it("injects into multiple hooks in same file", () => {
    const file = `<!-- @hook alpha -->
<!-- @end-hook alpha -->
middle
<!-- @hook beta -->
<!-- @end-hook beta -->`;
    const result = injectHooks(file, [
      { id: "alpha", content: "A content" },
      { id: "beta", content: "B content" },
    ]);
    expect(result).toContain("A content");
    expect(result).toContain("B content");
    expect(result).toContain("middle");
  });

  it("returns file unchanged when hooks array is empty", () => {
    const file = `<!-- @hook alpha -->
<!-- @end-hook alpha -->
some text`;
    const result = injectHooks(file, []);
    expect(result).toBe(file);
  });

  it("throws when hook id is not found in file", () => {
    const file = `<!-- @hook alpha -->
<!-- @end-hook alpha -->`;
    expect(() =>
      injectHooks(file, [{ id: "missing", content: "data" }]),
    ).toThrow("Hook point 'missing' not found in file");
  });

  it("throws on unclosed hook", () => {
    const file = `<!-- @hook alpha -->
some content`;
    expect(() =>
      injectHooks(file, [{ id: "alpha", content: "data" }]),
    ).toThrow("Unclosed hook 'alpha'");
  });

  it("throws on mismatched end id", () => {
    const file = `<!-- @hook alpha -->
<!-- @end-hook beta -->`;
    expect(() =>
      injectHooks(file, [{ id: "alpha", content: "data" }]),
    ).toThrow("Mismatched hook end: expected 'alpha', got 'beta'");
  });

  it("throws when hook already has content", () => {
    const file = `<!-- @hook alpha -->
existing stuff
<!-- @end-hook alpha -->`;
    expect(() =>
      injectHooks(file, [{ id: "alpha", content: "new" }]),
    ).toThrow("Hook 'alpha' already has content");
  });

  it("preserves surrounding whitespace and structure", () => {
    const file = `line 1
  <!-- @hook indented -->
  <!-- @end-hook indented -->
line 4`;
    const result = injectHooks(file, [
      { id: "indented", content: "  inserted" },
    ]);
    const lines = result.split("\n");
    expect(lines[0]).toBe("line 1");
    expect(lines[1]).toBe("  <!-- @hook indented -->");
    expect(lines[2]).toBe("  inserted");
    expect(lines[3]).toBe("  <!-- @end-hook indented -->");
    expect(lines[4]).toBe("line 4");
  });
});

describe("findHookPoints", () => {
  it("returns correct ids for valid pairs", () => {
    const file = `<!-- @hook alpha -->
<!-- @end-hook alpha -->
<!-- @hook beta -->
<!-- @end-hook beta -->`;
    const ids = findHookPoints(file);
    expect(ids).toEqual(["alpha", "beta"]);
  });

  it("returns empty array when no hooks present", () => {
    const ids = findHookPoints("just plain text");
    expect(ids).toEqual([]);
  });

  it("throws on unclosed hook", () => {
    const file = `<!-- @hook alpha -->
no end`;
    expect(() => findHookPoints(file)).toThrow("Unclosed hook 'alpha'");
  });

  it("throws on mismatched end id", () => {
    const file = `<!-- @hook alpha -->
<!-- @end-hook beta -->`;
    expect(() => findHookPoints(file)).toThrow(
      "Mismatched hook end: expected 'alpha', got 'beta'",
    );
  });
});
