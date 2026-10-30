import fs from "node:fs";
import path from "node:path";

/**
 * Test helper for the "no color-mix() / no oklab gradient" fallback section in globals.css
 * (see globalsFallback.test.ts). It re-computes every derived colour token from the real base
 * tokens, lists the Tailwind opacity and gradient utilities used in src, and audits built CSS,
 * so the CSS section can be generated and verified instead of hand-written.
 */

type Rgba = { r: number; g: number; b: number; a: number };

export const FALLBACK_BEGIN = "/* BEGIN generated:color-mix-fallback */";
export const FALLBACK_END = "/* END generated:color-mix-fallback */";
export const COLOR_MIX_QUERY = "color: color-mix(in srgb, red 50%, blue)";
export const GRADIENT_QUERY = "background-image: linear-gradient(in oklab, red, blue)";
const LIGHT_SELECTOR = ':root[data-theme="light"]';

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Content of the first `{ ... }` block that follows `header` (brace-matched). */
function blockAfter(css: string, header: string): string {
  const start = css.indexOf(header);
  if (start < 0) throw new Error(`block not found: ${header}`);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  throw new Error(`unbalanced block: ${header}`);
}

function declarations(block: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const m of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) map.set(m[1], m[2].trim());
  return map;
}

export interface ThemeTokens {
  dark: Map<string, string>;
  light: Map<string, string>;
  /** Names (`--color-*`) declared in @theme with a direct color-mix(). */
  derived: string[];
}

export function readTokens(rawCss: string): ThemeTokens {
  const css = stripComments(rawCss);
  const dark = declarations(blockAfter(css, "@theme {"));
  // First top-level light block (the fallback block lives inside @supports and is read separately).
  const light = declarations(blockAfter(css, `${LIGHT_SELECTOR} {`));
  const derived = [...dark.entries()]
    .filter(([name, value]) => name.startsWith("--color-") && value.includes("color-mix("))
    .map(([name]) => name);
  return { dark, light, derived };
}

function parseColor(value: string): Rgba {
  const v = value.trim().toLowerCase();
  if (v === "white") return { r: 255, g: 255, b: 255, a: 1 };
  if (v === "black") return { r: 0, g: 0, b: 0, a: 1 };
  if (v === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = [...h].map((c) => c + c).join("");
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
    };
  }
  const rgba = v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (rgba) return { r: +rgba[1], g: +rgba[2], b: +rgba[3], a: rgba[4] === undefined ? 1 : +rgba[4] };
  throw new Error(`unsupported colour: ${value}`);
}

const byte = (n: number) => Math.round(n).toString(16).padStart(2, "0");

export function toHex({ r, g, b, a }: Rgba): string {
  const rgb = `#${byte(r)}${byte(g)}${byte(b)}`;
  return a >= 1 ? rgb : `${rgb}${byte(a * 255)}`;
}

function splitTopLevel(input: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of input) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  parts.push(cur.trim());
  return parts;
}

function mixOperand(part: string): { color: string; pct: number | null } {
  const m = part.match(/^([\s\S]*?)(?:\s+(\d+(?:\.\d+)?)%)?$/)!;
  return { color: m[1].trim(), pct: m[2] === undefined ? null : +m[2] };
}

/** Resolve a token value to a colour for one theme (`env` = that theme's merged declarations). */
function resolveValue(value: string, env: Map<string, string>): Rgba {
  const v = value.trim();
  const varM = v.match(/^var\((--[\w-]+)\)$/);
  if (varM) {
    const next = env.get(varM[1]);
    if (next === undefined) throw new Error(`undefined variable ${varM[1]}`);
    return resolveValue(next, env);
  }
  const mixM = v.match(/^color-mix\(\s*in srgb\s*,([\s\S]*)\)$/);
  if (mixM) {
    const [first, second] = splitTopLevel(mixM[1]).map(mixOperand);
    let p1 = first.pct;
    let p2 = second.pct;
    if (p1 === null && p2 === null) p1 = p2 = 50;
    else if (p1 === null) p1 = 100 - p2!;
    else if (p2 === null) p2 = 100 - p1;
    const w1 = p1! / 100;
    const w2 = p2! / 100;
    const c1 = resolveValue(first.color, env);
    const c2 = resolveValue(second.color, env);
    const a = c1.a * w1 + c2.a * w2;
    if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
    const ch = (k: "r" | "g" | "b") => (c1[k] * c1.a * w1 + c2[k] * c2.a * w2) / a;
    return { r: ch("r"), g: ch("g"), b: ch("b"), a };
  }
  return parseColor(v);
}

const themeEnv = (tokens: ThemeTokens, theme: "dark" | "light") =>
  theme === "dark" ? tokens.dark : new Map([...tokens.dark, ...tokens.light]);

export function resolveToken(name: string, tokens: ThemeTokens, theme: "dark" | "light"): string {
  return toHex(resolveValue(`var(${name})`, themeEnv(tokens, theme)));
}

/** true when the token (or something it aliases) is built with color-mix(). */
function usesColorMix(name: string, tokens: ThemeTokens, seen = new Set<string>()): boolean {
  if (seen.has(name)) return false;
  seen.add(name);
  const value = tokens.dark.get(name);
  if (!value) return false;
  if (value.includes("color-mix(")) return true;
  const alias = value.match(/^var\((--[\w-]+)\)$/);
  return alias ? usesColorMix(alias[1], tokens, seen) : false;
}

const tidy = (value: string) => value.replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")");

const varRefs = (value: string) => [...value.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1]);

/** Index of the `)` that closes the `(` at `open`. */
function closingParen(text: string, open: number): number {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")" && --depth === 0) return i;
  }
  throw new Error(`unbalanced parenthesis in: ${text}`);
}

/** Replace every color-mix(...) inside a (non-colour) value with its resolved hex for one theme. */
function inlineColorMix(value: string, env: Map<string, string>): string {
  let out = value;
  for (;;) {
    const at = out.indexOf("color-mix(");
    if (at < 0) return out;
    const end = closingParen(out, at + "color-mix".length);
    out = out.slice(0, at) + toHex(resolveValue(out.slice(at, end + 1), env)) + out.slice(end + 1);
  }
}

/* ---------- N2: tokens built from other derived tokens ---------- */

/**
 * Derived tokens whose colour-mix reads ANOTHER derived token. The build cannot precompute these, so
 * browsers without color-mix() end up with no value at all — in the dark theme too.
 */
export function derivedFromDerived(tokens: ThemeTokens): string[] {
  return tokens.derived.filter((name) =>
    varRefs(tokens.dark.get(name)!).some((ref) => ref !== name && usesColorMix(ref, tokens))
  );
}

/** `--background-image-*` tokens whose colour-mix reads a derived colour token (not precomputable either). */
export function imageTokensNeedingFallback(tokens: ThemeTokens): string[] {
  return [...tokens.dark.entries()]
    .filter(([name]) => name.startsWith("--background-image-"))
    .filter(([, value]) => {
      for (let at = value.indexOf("color-mix("); at >= 0; at = value.indexOf("color-mix(", at + 1)) {
        const expr = value.slice(at, closingParen(value, at + "color-mix".length) + 1);
        if (varRefs(expr).some((ref) => usesColorMix(ref, tokens))) return true;
      }
      return false;
    })
    .map(([name]) => name);
}

/* ---------- source scanning ---------- */

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) sourceFiles(full, out);
    else if (/\.(tsx?)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

export function readSources(srcDir: string): { file: string; text: string }[] {
  return sourceFiles(srcDir).map((file) => ({ file, text: fs.readFileSync(file, "utf8") }));
}

/** Is a theme token referenced by a utility class / var() in src (directly or through another token)? */
export function isTokenUsed(
  name: string,
  tokens: ThemeTokens,
  sources: { text: string }[],
  seen = new Set<string>()
): boolean {
  if (seen.has(name)) return false;
  seen.add(name);
  const joined = sources.map((s) => s.text).join("\n");
  const color = name.match(/^--color-([\w-]+)$/);
  if (color) {
    const direct = new RegExp(`[a-z]+-${color[1]}(?![\\w-])|var\\(${name}\\)`);
    if (direct.test(joined)) return true;
  }
  const image = name.match(/^--background-image-([\w-]+)$/);
  if (image && new RegExp(`(?<![\\w-])bg-${image[1]}(?![\\w-])`).test(joined)) return true;
  return [...tokens.dark.entries()].some(
    ([other, value]) => other !== name && varRefs(value).includes(name) && isTokenUsed(other, tokens, sources, seen)
  );
}

/* ---------- opacity utilities ---------- */

const PROPERTY_BY_PREFIX: Record<string, string> = {
  bg: "background-color",
  text: "color",
  border: "border-color",
  ring: "--tw-ring-color",
};

const VARIANT_SUFFIX: Record<string, string> = {
  hover: ":hover",
  focus: ":focus",
  "focus-visible": ":focus-visible",
  active: ":active",
  disabled: ":disabled",
  "group-hover": ":is(:where(.group):hover *)",
};

const OPACITY_CLASS = /((?:[a-z0-9-]+(?:\[[^\]\s]+\])?:)*)(!?)([a-z]+)-([a-z][a-z0-9-]*)\/(\d+|\[[0-9.]+\])(?![\w/])/g;

export function cssEscapeClass(cls: string): string {
  return [...cls].map((ch) => (/[A-Za-z0-9_-]/.test(ch) ? ch : `\\${ch}`)).join("");
}

function variantSuffix(cls: string, variants: string[]): string {
  let suffix = "";
  for (const variant of variants) {
    const s = VARIANT_SUFFIX[variant];
    if (s === undefined) throw new Error(`${cls}: no fallback support for the "${variant}:" variant`);
    suffix += s;
  }
  return suffix;
}

export interface OpacityClass {
  cls: string;
  prefix: string;
  color: string; // token name without `--color-`
  variants: string[];
  alpha: number;
}

/** Every `prefix-colour/NN` class (with variants) that appears as text in src, for known colour tokens. */
export function scanOpacityClasses(srcDir: string, tokens: ThemeTokens): OpacityClass[] {
  const found = new Map<string, OpacityClass>();
  for (const { text } of readSources(srcDir)) {
    for (const m of text.matchAll(OPACITY_CLASS)) {
      const [cls, variantPart, , prefix, color, amount] = m;
      if (!tokens.dark.has(`--color-${color}`)) continue;
      const alpha = amount.startsWith("[") ? parseFloat(amount.slice(1, -1)) : +amount / 100;
      found.set(cls, {
        cls,
        prefix,
        color,
        variants: variantPart ? variantPart.split(":").filter(Boolean) : [],
        alpha,
      });
    }
  }
  return [...found.values()].sort((a, b) => a.cls.localeCompare(b.cls));
}

/* ---------- N1: gradients (Tailwind writes `to top in oklab`) ---------- */

const GRADIENT_DIRECTION: Record<string, string> = {
  t: "to top",
  tr: "to top right",
  r: "to right",
  br: "to bottom right",
  b: "to bottom",
  bl: "to bottom left",
  l: "to left",
  tl: "to top left",
};

export interface GradientClass {
  cls: string;
  direction: string;
  variants: string[];
}

const GRADIENT_CLASS = /((?:[a-z0-9-]+(?:\[[^\]\s]+\])?:)*)(bg-(?:gradient|linear)-to-([a-z]{1,2}))(?![\w-])/g;
const OTHER_GRADIENT_CLASS = /(?<![\w-])bg-(?:linear-(?!to-)|radial|conic)[\w\[\]./-]*/g;

/** Directional gradient utilities used in src. Angle / radial / conic utilities are reported by `unsupportedGradients`. */
export function scanGradientClasses(srcDir: string): GradientClass[] {
  const found = new Map<string, GradientClass>();
  for (const { text } of readSources(srcDir)) {
    for (const m of text.matchAll(GRADIENT_CLASS)) {
      const direction = GRADIENT_DIRECTION[m[3]];
      if (!direction) continue;
      found.set(m[0], {
        cls: m[0],
        direction,
        variants: m[1] ? m[1].split(":").filter(Boolean) : [],
      });
    }
  }
  return [...found.values()].sort((a, b) => a.cls.localeCompare(b.cls));
}

export function unsupportedGradients(srcDir: string): string[] {
  const out = new Set<string>();
  for (const { file, text } of readSources(srcDir)) {
    for (const m of text.matchAll(OTHER_GRADIENT_CLASS)) out.add(`${path.relative(srcDir, file)}: ${m[0]}`);
  }
  return [...out].sort();
}

/* ---------- dynamic / hand-written colour classes ---------- */

export interface DynamicFinding {
  file: string;
  kind: "dynamic-class" | "arbitrary-color-mix";
  snippet: string;
}

const DYNAMIC_COLOR_CLASS =
  /(?<![\w-])(?:bg|text|border|ring|from|via|to|fill|stroke|outline|divide|shadow|decoration|accent|caret|placeholder)-\$\{[^}]*\}|(?<![\w-])(?:bg|text|border|ring|from|via|to|fill|stroke|outline|shadow)-[a-z][a-z0-9-]*\/\$\{[^}]*\}/g;
const ARBITRARY_COLOR_MIX = /[\w:-]*\[[^\]\s]*color-mix\([^\]]*\]/g;

/** Class names built by interpolation, and arbitrary-value classes that hand-write color-mix(). */
export function scanDynamicColorClasses(srcDir: string): DynamicFinding[] {
  const out: DynamicFinding[] = [];
  for (const { file, text } of readSources(srcDir)) {
    const rel = path.relative(srcDir, file).split(path.sep).join("/");
    if (rel === "shared/styles/globalsFallback.ts") continue; // this helper holds the patterns as source text
    if (rel.endsWith(".tsx")) for (const m of text.matchAll(DYNAMIC_COLOR_CLASS)) out.push({ file: rel, kind: "dynamic-class", snippet: m[0] });
    for (const m of text.matchAll(ARBITRARY_COLOR_MIX)) out.push({ file: rel, kind: "arbitrary-color-mix", snippet: m[0] });
  }
  return out;
}

/* ---------- generated section ---------- */

function withAlpha(hex: string, alpha: number): string {
  const c = parseColor(hex);
  return toHex({ ...c, a: c.a * alpha });
}

export interface FallbackInput {
  tokens: ThemeTokens;
  opacityClasses: OpacityClass[];
  gradientClasses: GradientClass[];
  /** Used theme tokens, so unused dark-theme gaps are not filled. */
  isUsed: (name: string) => boolean;
}

/** The exact text of the fallback section that globals.css must contain (whitespace-insensitive). */
export function buildFallbackBlock({ tokens, opacityClasses, gradientClasses, isUsed }: FallbackInput): string {
  const lightTokenLines = tokens.derived.map((name) => `        ${name}: ${resolveToken(name, tokens, "light")};`);
  const imageTokens = imageTokensNeedingFallback(tokens).filter(isUsed);
  const imageLines = (theme: "dark" | "light") =>
    imageTokens.map((name) => `        ${name}: ${tidy(inlineColorMix(tokens.dark.get(name)!, themeEnv(tokens, theme)))};`);
  const darkTokenLines = derivedFromDerived(tokens)
    .filter(isUsed)
    .map((name) => `        ${name}: ${resolveToken(name, tokens, "dark")};`);

  const darkRules: string[] = [];
  const lightRules: string[] = [];
  for (const c of opacityClasses) {
    const name = `--color-${c.color}`;
    const dark = resolveToken(name, tokens, "dark");
    const light = resolveToken(name, tokens, "light");
    const derived = usesColorMix(name, tokens);
    if (dark === light && !derived) continue; // same in both themes and baked correctly by the build

    const property = PROPERTY_BY_PREFIX[c.prefix];
    if (!property) throw new Error(`${c.cls}: no fallback support for the "${c.prefix}-" prefix`);
    const selector = `.${cssEscapeClass(c.cls)}${variantSuffix(c.cls, c.variants)}`;
    if (derived) darkRules.push(`        ${selector} { ${property}: ${withAlpha(dark, c.alpha)}; }`);
    if (dark !== light)
      lightRules.push(`        :where(${LIGHT_SELECTOR}) ${selector} { ${property}: ${withAlpha(light, c.alpha)}; }`);
  }

  const gradientRules = gradientClasses.map(
    (g) => `        .${cssEscapeClass(g.cls)}${variantSuffix(g.cls, g.variants)} { --tw-gradient-position: ${g.direction}; }`
  );

  const lines = [`@supports not (${COLOR_MIX_QUERY}) {`];
  if (darkTokenLines.length || imageTokens.length) {
    lines.push("    :root {", ...darkTokenLines, ...imageLines("dark"), "    }", "");
  }
  lines.push(`    ${LIGHT_SELECTOR} {`, ...lightTokenLines, ...imageLines("light"), "    }", "");
  lines.push("    @layer utilities {", ...darkRules, ...lightRules, "    }", "}");
  if (gradientRules.length) {
    lines.push("", `@supports not (${GRADIENT_QUERY}) {`, "    @layer utilities {", ...gradientRules, "    }", "}");
  }
  return lines.join("\n");
}

export function extractFallbackSection(css: string): string {
  const start = css.indexOf(FALLBACK_BEGIN);
  const end = css.indexOf(FALLBACK_END);
  if (start < 0 || end < 0) throw new Error("fallback markers not found in globals.css");
  return css.slice(start + FALLBACK_BEGIN.length, end);
}

export const normalizeCss = (css: string) => css.replace(/\s+/g, " ").trim();

/** Heads of the top-level at-rules of a CSS fragment, e.g. `@supports not (color: ...)`. */
export function topLevelHeads(css: string): string[] {
  const heads: string[] = [];
  let depth = 0;
  let buf = "";
  for (const ch of stripComments(css)) {
    if (ch === "{") {
      if (depth === 0) heads.push(buf.trim());
      depth++;
      buf = "";
    } else if (ch === "}") {
      depth--;
      buf = "";
    } else if (depth === 0) buf += ch;
  }
  return heads;
}

/* ---------- built CSS audit ---------- */

interface CssNode {
  head?: string;
  kids?: CssNode[];
  decl?: string;
}

function parseCssTree(css: string): CssNode[] {
  let i = 0;
  const parse = (): CssNode[] => {
    const items: CssNode[] = [];
    let buf = "";
    while (i < css.length) {
      const ch = css[i];
      if (ch === "{") {
        const head = buf.trim();
        buf = "";
        i++;
        items.push({ head, kids: parse() });
      } else if (ch === "}") {
        i++;
        if (buf.trim()) items.push({ decl: buf.trim() });
        return items;
      } else if (ch === ";") {
        if (buf.trim()) items.push({ decl: buf.trim() });
        buf = "";
        i++;
      } else {
        buf += ch;
        i++;
      }
    }
    if (buf.trim()) items.push({ decl: buf.trim() });
    return items;
  };
  return parse();
}

export interface BuiltCssAudit {
  /** color-mix() declarations that no guard, earlier plain value or fallback-block rule covers. */
  colorMix: string[];
  /** Gradient utilities that still declare `... in oklab` with no fallback-block rule. */
  oklabGradients: string[];
  /** Selectors → direction fallbacks found, for direction checks. */
  gradientFallbacks: Map<string, string>;
  gradientOriginals: Map<string, string>;
  colorMixCount: number;
  hasFallbackBlock: boolean;
}

export function auditBuiltCss(css: string): BuiltCssAudit {
  const tree = parseCssTree(css);
  type Hit = { selector: string; prop: string; value: string; ctx: string[]; plainBefore: boolean };
  const mixHits: Hit[] = [];
  const oklabHits: { selector: string; value: string; ctx: string[] }[] = [];
  const supportsNotMixProps = new Set<string>(); // `selector|prop` (custom props: prop only) set inside the fallback block
  const gradientFallbacks = new Map<string, string>();
  const gradientOriginals = new Map<string, string>();
  let hasFallbackBlock = false;

  const inNotMix = (ctx: string[]) => ctx.some((c) => /^@supports\s+not\s*\(color:\s*color-mix/.test(c));
  const inNotGradient = (ctx: string[]) => ctx.some((c) => /^@supports\s+not\s*\(background-image:\s*linear-gradient\(in oklab/.test(c));
  const guarded = (ctx: string[]) => ctx.some((c) => /^@supports\s*\(color:\s*color-mix/.test(c));

  const walk = (items: CssNode[], ctx: string[]) => {
    const decls = items.filter((x) => x.decl).map((x) => x.decl!);
    const selector = ctx[ctx.length - 1] ?? "";
    decls.forEach((d, k) => {
      const prop = d.slice(0, d.indexOf(":"));
      const value = d.slice(d.indexOf(":") + 1);
      // A light-only rule does not cover the dark (default) value of a custom property.
      if (inNotMix(ctx) && !selector.includes("data-theme"))
        supportsNotMixProps.add(prop.startsWith("--") ? prop : `${selector}|${prop}`);
      if (prop === "--tw-gradient-position") {
        if (inNotGradient(ctx)) gradientFallbacks.set(selector, value);
        else if (value.includes(" in oklab")) {
          gradientOriginals.set(selector, value);
          oklabHits.push({ selector, value, ctx });
        }
      }
      if (!d.includes("color-mix(")) return;
      const plainBefore = decls.slice(0, k).some((e) => e.startsWith(`${prop}:`) && !e.includes("color-mix("));
      mixHits.push({ selector, prop, value, ctx, plainBefore });
    });
    for (const item of items) if (item.kids) walk(item.kids, [...ctx, item.head!]);
  };
  walk(tree, []);
  hasFallbackBlock = [...supportsNotMixProps].length > 0;

  const colorMix = mixHits
    .filter((h) => !guarded(h.ctx) && !inNotMix(h.ctx) && !h.plainBefore)
    .filter((h) => !supportsNotMixProps.has(h.prop.startsWith("--") ? h.prop : `${h.selector}|${h.prop}`))
    .map((h) => `${h.selector} { ${h.prop}: ${h.value.slice(0, 90)} }`);

  const oklabGradients = oklabHits
    .filter((h) => !gradientFallbacks.has(h.selector))
    .map((h) => `${h.selector} { --tw-gradient-position: ${h.value} }`);

  return { colorMix, oklabGradients, gradientFallbacks, gradientOriginals, colorMixCount: mixHits.length, hasFallbackBlock };
}
