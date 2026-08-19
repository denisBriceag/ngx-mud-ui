import { describe, it, expect, beforeAll } from 'vitest';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { generateIcons } from './generate-icons.mjs';

const OUT = join(process.cwd(), 'tools', '__out__');

describe('generateIcons', () => {
  let result;
  beforeAll(async () => {
    await fs.rm(OUT, { recursive: true, force: true });
    result = await generateIcons({ sourceDir: join(process.cwd(), 'tools', '__fixtures__', 'icons'), outDir: OUT });
  });

  it('discovers each distinct icon name once (dedupes the flat copy)', () => {
    expect(result.names).toEqual(['arrow-left', 'business', 'delete', 'document']);
  });

  it('sanitizes a reserved-word icon name into a safe export identifier, keeping the real kebab `name`', async () => {
    const src = await fs.readFile(join(OUT, 'data', 'delete.ts'), 'utf8');
    expect(src).toContain('export const deleteIcon: EgovIcon');
    expect(src).not.toMatch(/export const delete\b/);
    expect(src).toContain("name: 'delete'");
  });

  it('normalizes hardcoded fills to currentColor', async () => {
    const src = await fs.readFile(join(OUT, 'data', 'arrow-left.ts'), 'utf8');
    expect(src).toContain('currentColor');
    expect(src).not.toContain('#121212');
  });

  it('captures per-scale viewBox and keeps geometry separate', async () => {
    const src = await fs.readFile(join(OUT, 'data', 'arrow-left.ts'), 'utf8');
    expect(src).toContain("'0 0 25 24'");
    expect(src).toContain("'0 0 21 20'");
    // Geometry must be serialized under its own scale key, not just present anywhere in the file —
    // this catches a regression that put the right viewBox under the wrong scale (e.g. the 24
    // geometry serialized under the `20` key).
    expect(src).toContain('24: {');
    expect(src).toContain('20: {');
    expect(src).toMatch(/24:\s*{\s*viewBox:\s*'0 0 25 24'/);
    expect(src).toMatch(/20:\s*{\s*viewBox:\s*'0 0 21 20'/);
  });

  it('strips the -filled suffix and assigns the filled variant', async () => {
    const src = await fs.readFile(join(OUT, 'data', 'business.ts'), 'utf8');
    expect(src).toContain('filled');
    expect(src).toContain("name: 'business'");
  });

  it('picks up icons only present in the flat `filed/` dir as filled@24, stripping -filled and normalizing fills', async () => {
    const src = await fs.readFile(join(OUT, 'data', 'document.ts'), 'utf8');
    expect(src).toContain("name: 'document'");
    expect(src).toContain('filled');
    expect(src).toContain("'0 0 24 24'");
    expect(src).toContain('currentColor');
    expect(src).not.toContain('#121212');
  });

  it('fails loudly when two icon names alias to the same export identifier', async () => {
    const src = join(OUT, 'collision-src');
    const svg = '<svg viewBox="0 0 24 24" fill="none"><path d="M0 0h24v24H0z" fill="#121212"/></svg>';

    await fs.mkdir(src, { recursive: true });
    await fs.writeFile(join(src, 'delete.svg'), svg);
    await fs.writeFile(join(src, 'delete-icon.svg'), svg);

    await expect(generateIcons({ sourceDir: src, outDir: join(OUT, 'collision-out') })).rejects.toThrow(
      /deleteIcon/,
    );
  });

  it('emits a barrel and a name union', async () => {
    const barrel = await fs.readFile(join(OUT, 'data', 'index.ts'), 'utf8');
    expect(barrel).toContain("export * from './arrow-left'");
    expect(barrel).toContain("export * from './delete'");
    const names = await fs.readFile(join(OUT, 'icon-name.ts'), 'utf8');
    expect(names).toContain("'arrow-left' | 'business' | 'delete' | 'document'");
  });
});
