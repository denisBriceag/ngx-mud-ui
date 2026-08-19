import { promises as fs } from 'node:fs';
import { basename, join } from 'node:path';
import { optimize } from 'svgo';

const VARIANT_DIRS = { Outlined: 'outlined', Filled: 'filled' };
const SCALES = [12, 16, 20, 24];

const camel = (kebab) => kebab.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

// ECMAScript reserved words (keywords + strict-mode reserved words). An icon name whose
// camelCase form collides with one of these can't be used as an `export const <ident>` name
// (e.g. `delete.svg` -> `delete`, a syntax error as a binding name).
const RESERVED_WORDS = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do',
  'else', 'enum', 'export', 'extends', 'false', 'finally', 'for', 'function', 'if', 'implements',
  'import', 'in', 'instanceof', 'interface', 'let', 'new', 'null', 'package', 'private',
  'protected', 'public', 'return', 'static', 'super', 'switch', 'this', 'throw', 'true', 'try',
  'typeof', 'var', 'void', 'while', 'with', 'yield', 'await',
]);

/** Safe `export const` identifier for an icon's camelCased name: reserved words and (defensively)
 * digit-leading identifiers get an `Icon` suffix (e.g. `delete` -> `deleteIcon`). The icon's own
 * `name` field always keeps the real kebab-case value — only the JS/TS export identifier changes. */
const safeIdent = (ident) => (RESERVED_WORDS.has(ident) || /^\d/.test(ident) ? `${ident}Icon` : ident);

const IDENT_KEY = /^[A-Za-z_$][A-Za-z0-9_$]*$|^\d+$/;

/** Serializes a plain JSON-shaped value as a single-quoted TS object literal (JSON.stringify emits
 * double quotes, which conflicts with this repo's `singleQuote: true` Prettier config). */
function serialize(value, indent = '') {
  if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  if (typeof value !== 'object' || value === null) return String(value);
  const inner = indent + '  ';
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map((v) => `${inner}${serialize(v, inner)}`).join(',\n');
    return `[\n${items}\n${indent}]`;
  }
  const entries = Object.entries(value);
  if (entries.length === 0) return '{}';
  const body = entries
    .map(([k, v]) => `${inner}${IDENT_KEY.test(k) ? k : `'${k}'`}: ${serialize(v, inner)}`)
    .join(',\n');
  return `{\n${body}\n${indent}}`;
}

function normalizeBody(svg) {
  // NOTE: SVGO v4's `preset-default` no longer includes `removeViewBox` in its default plugin
  // set (viewBox is preserved out of the box), so no override is needed here. Passing
  // `overrides: { removeViewBox: false }` (as in SVGO v2/v3) is a harmless no-op in v4 but emits
  // a deprecation warning on every call, so it's omitted.
  const optimized = optimize(svg, { plugins: ['preset-default'] }).data;
  const viewBox = (optimized.match(/viewBox="([^"]+)"/) || [])[1] ?? '';
  const inner = optimized.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const body = inner
    .replace(/fill="#121212"/gi, 'fill="currentColor"')
    .replace(/fill='#121212'/gi, "fill='currentColor'");
  return { viewBox, body };
}

async function listSvgs(dir) {
  try { return (await fs.readdir(dir)).filter((f) => f.endsWith('.svg')).map((f) => join(dir, f)); }
  catch { return []; }
}

export async function generateIcons({ sourceDir, outDir }) {
  /** key `${name}|${variant}|${scale}` -> geometry; first writer wins (canonical dirs processed first) */
  const geo = new Map();
  const add = (name, variant, scale, geometry) => {
    const key = `${name}|${variant}|${scale}`;
    if (!geo.has(key)) geo.set(key, { name, variant, scale, geometry });
  };

  // 1) canonical structured dirs
  for (const [dir, variant] of Object.entries(VARIANT_DIRS)) {
    for (const scale of SCALES) {
      for (const file of await listSvgs(join(sourceDir, dir, String(scale)))) {
        const name = basename(file, '.svg').replace(/-filled$/, '');
        add(name, variant, scale, normalizeBody(await fs.readFile(file, 'utf8')));
      }
    }
  }
  // 2) flat outlined defaults @24
  for (const file of await listSvgs(sourceDir)) {
    const name = basename(file, '.svg').replace(/-filled$/, '');
    add(name, 'outlined', 24, normalizeBody(await fs.readFile(file, 'utf8')));
  }
  // 3) filed/ filled defaults @24
  for (const file of await listSvgs(join(sourceDir, 'filed'))) {
    const name = basename(file, '.svg').replace(/-filled$/, '');
    add(name, 'filled', 24, normalizeBody(await fs.readFile(file, 'utf8')));
  }

  // group by icon name
  const byName = new Map();
  for (const { name, variant, scale, geometry } of geo.values()) {
    const icon = byName.get(name) ?? { name, variants: {} };
    (icon.variants[variant] ??= {})[scale] = geometry;
    byName.set(name, icon);
  }

  const names = [...byName.keys()].sort();

  // safeIdent can alias two distinct names onto one export identifier
  // ("delete" -> deleteIcon, "delete-icon" -> deleteIcon); fail loudly
  // instead of emitting duplicate exports in the generated barrel.
  const identOwner = new Map();
  for (const name of names) {
    const ident = safeIdent(camel(name));
    const other = identOwner.get(ident);
    if (other) {
      throw new Error(
        `generate-icons: icons "${other}" and "${name}" both produce the export identifier "${ident}"; rename one of the SVGs.`,
      );
    }
    identOwner.set(ident, name);
  }
  const dataDir = join(outDir, 'data');
  await fs.rm(dataDir, { recursive: true, force: true });
  await fs.mkdir(dataDir, { recursive: true });

  for (const name of names) {
    const icon = byName.get(name);
    const src =
      `// GENERATED FILE — do not edit. Regenerate with \`pnpm icons:generate\`.\n` +
      `import type { EgovIcon } from '../types';\n\n` +
      `export const ${safeIdent(camel(name))}: EgovIcon = ${serialize(icon)};\n`;
    await fs.writeFile(join(dataDir, `${name}.ts`), src);
  }

  await fs.writeFile(
    join(dataDir, 'index.ts'),
    `// GENERATED FILE — do not edit. Regenerate with \`pnpm icons:generate\`.\n` +
      names.map((n) => `export * from './${n}';`).join('\n') + '\n',
  );

  await fs.writeFile(
    join(outDir, 'icon-name.ts'),
    `// GENERATED FILE — do not edit. Regenerate with \`pnpm icons:generate\`.\n` +
      `export type EgovIconName =\n  ` + names.map((n) => `'${n}'`).join(' | ') + ';\n',
  );

  return { names, count: names.length };
}

// CLI: node tools/generate-icons.mjs <sourceDir> <outDir>
if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , sourceDir, outDir] = process.argv;
  generateIcons({ sourceDir, outDir }).then((r) => console.log(`Generated ${r.count} icons.`));
}
