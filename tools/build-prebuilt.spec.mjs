import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildPrebuilt } from './build-prebuilt.mjs';

// Own temp dir: generate-icons.spec wipes tools/__out__ concurrently.
const OUT = mkdtempSync(join(tmpdir(), 'mud-prebuilt-'));

describe('buildPrebuilt', () => {
  afterAll(() => rmSync(OUT, { recursive: true, force: true }));

  let css;
  let darkCss;

  beforeAll(async () => {
    ({ css, darkCss } = await buildPrebuilt({ outDir: OUT }));
  });

  it('writes prebuilt/mud.css with everything in the mud.base layer (and no other layer)', () => {
    expect(readFileSync(join(OUT, 'prebuilt', 'mud.css'), 'utf8')).toBe(css);
    expect(css.trimStart().startsWith('@layer mud.base {')).toBe(true);
    expect(css).not.toContain('mud.components');
  });

  it('declares the light color tokens and NO dark theme (dark is opt-in)', () => {
    expect(css).toMatch(/:root\s*\{[^}]*--mud-color-text-base-default:/);
    expect(css).not.toContain('[data-theme');
  });

  it('writes the opt-in dark theme to prebuilt/mud-dark.css: only :root[data-theme=dark] token blocks (out-rank the light :root whatever the file order), in mud.base', () => {
    expect(readFileSync(join(OUT, 'prebuilt', 'mud-dark.css'), 'utf8')).toBe(darkCss);
    expect(darkCss.trimStart().startsWith('@layer mud.base {')).toBe(true);
    expect(darkCss).toMatch(/\[data-theme=['"]?dark['"]?\]\s*\{[^}]*--mud-color-text-base-default:/);
    // nothing but dark token blocks: every selector is the dark attribute, every declaration a token
    for (const [, selector] of darkCss.matchAll(/([^{};@]+)\{[^{}]*\}/g)) {
      expect(selector.trim()).toMatch(/^:root\[data-theme=['"]?dark['"]?\]$/);
    }
    expect(darkCss).not.toContain('@font-face');
  });

  it('ships the Onest font next to it, referenced relatively', () => {
    expect(css).toContain("url(\"../fonts/Onest/OnestRegular1602-hint.woff\")");
    expect(existsSync(join(OUT, 'fonts', 'Onest', 'OnestRegular1602-hint.woff'))).toBe(true);
  });

  it('emits no class selectors (no utilities, no component CSS)', () => {
    expect(css).not.toMatch(/(^|[}\s,])\.[a-zA-Z][\w-]*[^{]*\{/m);
  });
});
