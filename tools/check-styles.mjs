// The library's style guard (`pnpm styles:check`, run after `pnpm build`):
// - component sheets: NOT in a cascade layer, no :root/[data-theme] token blocks or @font-face, only
//   --mud-*/--_*/--cdk-* variables;
//   abstracts modules emit nothing;
// - tokens: every --mud-* a component or the base CSS reads is declared (TS `[style.--mud-x]` counts),
//   the dark file only overrides declared tokens, and docs/stories name only tokens that exist.
import { compile } from 'sass';
import { globSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const OPTIONS = { style: 'compressed', silenceDeprecations: ['if-function'] };

// `compiled` (file → css) lets the CLI reuse one Sass pass for the token check; tests omit it.
export async function checkComponentStyles({ entriesGlobRoot, abstractsDir, compiled }) {
  const violations = [];
  const sheets = globSync(`${entriesGlobRoot}/*/src/**/*.scss`).filter((f) => !/\/_[^/]+\.scss$/.test(f));

  for (const file of sheets) {
    const css = compile(file, OPTIONS).css.trim();

    compiled?.set(file, css);

    if (!css) continue;
    // Unlayered on purpose: overriding a component takes deliberate specificity; tokens are the API.
    if (css.includes('@layer')) violations.push(`${file}: component CSS must not be in a cascade layer`);
    // Token blocks only — a selector that IS :root, [data-theme…] or :root[data-theme…] (the dark theme's
    // own form); `[data-theme='dark'] .x` is component CSS.
    if (/(?:^|[{};,])\s*(?::root(?:\[data-theme[^\]]*\])?|\[data-theme[^\]]*\])\s*[{,]/.test(css)) violations.push(`${file}: emits a :root / [data-theme] token block`);
    if (css.includes('@font-face')) violations.push(`${file}: emits @font-face`);
    for (const [, name] of css.matchAll(/var\(--([\w-]+)/g)) {
      if (!/^(mud-|_|cdk-)/.test(name)) violations.push(`${file}: uses non-mud custom property --${name}`);
    }
  }

  for (const mod of globSync(`${abstractsDir}/**/_*.scss`)) {
    if (compile(mod, OPTIONS).css.trim()) violations.push(`${mod}: abstracts module emits CSS`);
  }

  return violations;
}

const declared = (css) => new Set([...css.matchAll(/--(mud-[\w-]+)\s*:/g)].map((m) => `--${m[1]}`));
const bound = (source) =>
  new Set([...source.matchAll(/(?:\[style\.|setProperty\(\s*['"])--(mud-[\w-]+)/g)].map((m) => `--${m[1]}`));

// `componentCss`: compiled sheets and TS/HTML sources, each `{ entry, text, source? }` (or a bare string =
// one shared entry of CSS). Only CSS declares tokens (a `--mud-x:` in a TS comment must not count);
// a `[style.--mud-x]` binding (TS host metadata or template) vouches for `--mud-x` in its OWN entry only.
export function checkTokenCompleteness({ prebuiltCss, componentCss }) {
  const base = declared(prebuiltCss);
  const sources = componentCss.map((s) => (typeof s === 'string' ? { entry: '', text: s } : s));
  const fromTs = new Map();

  for (const { entry, text } of sources) {
    for (const name of bound(text)) fromTs.set(entry, (fromTs.get(entry) ?? new Set()).add(name));
  }

  const missing = new Set();

  for (const { entry, text, source } of sources) {
    const own = source ? new Set() : declared(text);

    for (const [, n] of text.matchAll(/var\(--(mud-[\w-]+)/g)) {
      const name = `--${n}`;

      if (!base.has(name) && !own.has(name) && !fromTs.get(entry)?.has(name)) missing.add(name);
    }
  }
  return [...missing].sort();
}

const OWN = /^(mud-|_|cdk-)/;

// The base CSS's own reads must resolve, library CSS must never read an app-namespace variable,
// and docs/stories must only name tokens that exist (they are copied into apps).
export function checkTokenReferences({ prebuiltCss, darkCss = '', sources }) {
  const base = declared(prebuiltCss);
  const problems = [];

  // The dark file only re-points tokens mud.css already declares.
  for (const name of declared(darkCss)) if (!base.has(name)) problems.push(`mud-dark.css overrides undeclared ${name}`);
  for (const [, n] of darkCss.matchAll(/var\(--([\w-]+)/g)) {
    if (!OWN.test(n)) problems.push(`mud-dark.css reads non-library --${n}`);
    else if (n.startsWith('mud-') && !base.has(`--${n}`)) problems.push(`mud-dark.css reads undeclared --${n}`);
  }

  for (const [, n] of prebuiltCss.matchAll(/var\(--([\w-]+)/g)) {
    if (!OWN.test(n)) problems.push(`mud.css reads non-library --${n}`);
    else if (n.startsWith('mud-') && !base.has(`--${n}`)) problems.push(`mud.css reads undeclared --${n}`);
  }
  for (const { file, text } of sources) {
    for (const [, n] of text.matchAll(/var\(--([\w-]+)/g)) {
      if (!n.startsWith('_') && !n.startsWith('cdk-') && !base.has(`--${n}`)) problems.push(`${file} references unknown --${n}`);
    }
  }
  return [...new Set(problems)];
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = 'projects/ngx-mud-ui';
  const styles = `${root}/src/lib/styles`;
  const prebuiltCss = readFileSync('dist/ngx-mud-ui/prebuilt/mud.css', 'utf8');
  const darkCss = readFileSync('dist/ngx-mud-ui/prebuilt/mud-dark.css', 'utf8');
  const compiled = new Map();
  const styleProblems = await checkComponentStyles({ entriesGlobRoot: root, abstractsDir: `${styles}/abstracts`, compiled });
  const entryOf = (f) => f.slice(root.length + 1).split('/')[0];
  const componentCss = [...compiled].map(([f, text]) => ({ entry: entryOf(f), text })).concat(
    globSync(`${root}/*/src/lib/**/*.{ts,html}`)
      .filter((f) => !f.endsWith('.spec.ts'))
      .map((f) => ({ entry: entryOf(f), text: readFileSync(f, 'utf8'), source: true })),
  );
  const docs = globSync(['README.md', `${root}/**/*.{md,mdx}`, `${root}/src/stories/**/*.ts`])
    .filter((f) => !f.includes('node_modules'))
    .map((file) => ({ file, text: readFileSync(file, 'utf8') }));

  const problems = [
    ...styleProblems,
    ...checkTokenCompleteness({ prebuiltCss, componentCss }).map((n) => `missing token ${n}`),
    ...checkTokenReferences({ prebuiltCss, darkCss, sources: docs }),
  ];

  problems.forEach((p) => console.error(p));
  console.log(`styles:check — ${problems.length} problem(s)`);
  process.exit(problems.length ? 1 : 0);
}
