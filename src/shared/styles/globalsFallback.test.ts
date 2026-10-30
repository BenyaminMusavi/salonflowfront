// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  auditBuiltCss,
  buildFallbackBlock,
  cssEscapeClass,
  derivedFromDerived,
  extractFallbackSection,
  imageTokensNeedingFallback,
  isTokenUsed,
  normalizeCss,
  readSources,
  readTokens,
  resolveToken,
  scanDynamicColorClasses,
  scanGradientClasses,
  scanOpacityClasses,
  topLevelHeads,
  unsupportedGradients,
} from "./globalsFallback";

const cssPath = path.resolve(__dirname, "globals.css");
const css = fs.readFileSync(cssPath, "utf8");
const srcDir = path.resolve(__dirname, "../..");
const tokens = readTokens(css);
const sources = readSources(srcDir);
const section = normalizeCss(extractFallbackSection(css));
const opacityClasses = scanOpacityClasses(srcDir, tokens);
const gradientClasses = scanGradientClasses(srcDir);
const isUsed = (name: string) => isTokenUsed(name, tokens, sources);

/** Arbitrary-value classes that hand-write color-mix(). Each needs a deliberate review: the build must bake a fallback for it (the built-CSS test below checks that). */
const REVIEWED_ARBITRARY_COLOR_MIX = new Set(["shadow-[0px_2px_4px_color-mix(in_srgb,var(--color-overlay)_10%,transparent)]"]);

describe("color-mix() fallback section in globals.css", () => {
  it("computes derived tokens with the real color-mix formula (srgb)", () => {
    // Dark values equal the hex fallbacks the build already emits for the dark theme.
    expect(resolveToken("--color-primary-hover", tokens, "dark")).toBe("#69b1a9");
    expect(resolveToken("--color-background-secondary", tokens, "dark")).toBe("#0e243a");
    expect(resolveToken("--color-foreground-muted", tokens, "dark")).toBe("#8d96a1");
    expect(resolveToken("--color-surface-brand", tokens, "dark")).toBe("#4fa39a1f");
    // Light values come from the light base tokens.
    expect(resolveToken("--color-primary-hover", tokens, "light")).toBe("#3b716b");
    expect(resolveToken("--color-background-secondary", tokens, "light")).toBe("#f2f2f3");
    expect(resolveToken("--color-foreground-muted", tokens, "light")).toBe("#7b7d84");
  });

  it("discovers derived tokens and opacity utilities from the sources (no fixed list)", () => {
    expect(tokens.derived.length).toBeGreaterThan(15);
    expect(opacityClasses.length).toBeGreaterThan(20);
  });

  it("covers every derived token, themed opacity utility, gradient and image token (fails on a new one without fallback)", () => {
    const expected = buildFallbackBlock({ tokens, opacityClasses, gradientClasses, isUsed });
    expect(
      section,
      `globals.css fallback section is out of date. Replace the text between the BEGIN/END markers with:\n\n${expected}\n`
    ).toBe(normalizeCss(expected));
  });

  it("only activates inside `@supports not (...)` guards", () => {
    const heads = topLevelHeads(extractFallbackSection(css));
    expect(heads.length).toBeGreaterThan(0);
    for (const head of heads) expect(head).toMatch(/^@supports not \((color: color-mix|background-image: linear-gradient\(in oklab)/);
  });
});

describe("N1: Tailwind gradients (`in oklab` position)", () => {
  it("has a fallback for every directional gradient used in src, keeping the direction", () => {
    expect(gradientClasses.length).toBeGreaterThan(0);
    const directions: Record<string, string> = { t: "to top", r: "to right", br: "to bottom right", b: "to bottom", tr: "to top right", bl: "to bottom left", l: "to left", tl: "to top left" };
    for (const g of gradientClasses) {
      const dir = directions[g.cls.match(/-to-([a-z]+)$/)![1]];
      expect(g.direction).toBe(dir);
      const rule = `.${cssEscapeClass(g.cls)} { --tw-gradient-position: ${dir}; }`;
      expect(section, g.cls).toContain(normalizeCss(rule));
    }
  });

  it("overrides only --tw-gradient-position, so stops, opacities and colours stay Tailwind's", () => {
    const gradientBlock = extractFallbackSection(css).split("@supports not (background-image")[1];
    const props = [...gradientBlock.matchAll(/\{\s*([\w-]+)\s*:/g)].map((m) => m[1]).filter((p) => p !== "utilities");
    expect(new Set(props)).toEqual(new Set(["--tw-gradient-position"]));
  });

  it("has no angle / radial / conic gradient utilities that the fallback does not handle", () => {
    expect(unsupportedGradients(srcDir)).toEqual([]);
  });
});

describe("N2: tokens built from other derived tokens", () => {
  const nested = derivedFromDerived(tokens);

  it("finds them from the token definitions (not by name)", () => {
    expect(nested.length).toBeGreaterThan(0);
    for (const name of nested) expect(tokens.derived).toContain(name);
  });

  it("gives every used one a dark value on :root and a light value in the light block", () => {
    for (const name of nested) {
      const dark = `${name}: ${resolveToken(name, tokens, "dark")};`;
      const light = `${name}: ${resolveToken(name, tokens, "light")};`;
      if (isUsed(name)) expect(section, `${name} dark`).toContain(dark);
      expect(section, `${name} light`).toContain(light); // the light block lists every derived token
    }
  });
});

describe("image tokens that read derived colours (e.g. bg-salon-hero-dots)", () => {
  it("get a resolved value for both themes, on the same property the original defines", () => {
    const names = imageTokensNeedingFallback(tokens);
    for (const name of names) {
      expect(tokens.dark.has(name)).toBe(true);
      if (!isUsed(name)) continue;
      const occurrences = section.split(`${name}:`).length - 1;
      expect(occurrences, `${name} should appear once for dark and once for light`).toBe(2);
      expect(section).not.toMatch(new RegExp(`${name}:[^;]*color-mix`));
    }
    const dots = "--background-image-salon-hero-dots";
    if (tokens.dark.has(dots)) {
      expect(section).toContain(`${dots}: radial-gradient(circle at 1px 1px, #8d96a18c 1px, transparent 0)`);
      expect(section).toContain(`${dots}: radial-gradient(circle at 1px 1px, #7b7d848c 1px, transparent 0)`);
    }
  });
});

describe("dynamic and hand-written colour classes", () => {
  const findings = scanDynamicColorClasses(srcDir);

  it("has no colour / opacity utilities built with template interpolation", () => {
    expect(
      findings.filter((f) => f.kind === "dynamic-class"),
      "These classes are built at runtime, so the fallback scan cannot see them. Use full class names, or extend the fallback by hand and review them."
    ).toEqual([]);
  });

  it("only has reviewed arbitrary color-mix() classes", () => {
    const unknown = findings.filter((f) => f.kind === "arbitrary-color-mix" && !REVIEWED_ARBITRARY_COLOR_MIX.has(f.snippet));
    expect(unknown, "New hand-written color-mix(): check the built CSS bakes a fallback, then add it to REVIEWED_ARBITRARY_COLOR_MIX").toEqual([]);
  });
});

/** Built CSS: only checked when a build that is at least as new as globals.css exists. */
const cssDir = path.resolve(__dirname, "../../../.next/static/css");
const builtFiles = fs.existsSync(cssDir) ? fs.readdirSync(cssDir).filter((f) => f.endsWith(".css")) : [];
const builtCss = builtFiles.map((f) => fs.readFileSync(path.join(cssDir, f), "utf8")).join("\n");
const builtIsFresh =
  builtFiles.length > 0 &&
  builtFiles.every((f) => fs.statSync(path.join(cssDir, f)).mtimeMs >= fs.statSync(cssPath).mtimeMs) &&
  /@supports not \(color:color-mix\(in srgb,red 50%,blue\)\)/.test(builtCss);

describe.skipIf(!builtIsFresh)("built CSS (.next/static/css)", () => {
  const audit = builtIsFresh ? auditBuiltCss(builtCss) : null;

  it("has no color-mix() without a guard, an earlier plain value or a fallback-section rule", () => {
    expect(audit!.colorMixCount).toBeGreaterThan(20);
    expect(audit!.colorMix).toEqual([]);
  });

  it("has no `in oklab` gradient position without a fallback", () => {
    expect(audit!.oklabGradients).toEqual([]);
  });

  it("keeps each gradient's direction in the fallback", () => {
    expect(audit!.gradientOriginals.size).toBeGreaterThan(0);
    for (const [selector, original] of audit!.gradientOriginals) {
      expect(audit!.gradientFallbacks.get(selector), selector).toBe(original.replace(" in oklab", ""));
    }
  });
});
