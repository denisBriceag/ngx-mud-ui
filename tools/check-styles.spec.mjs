import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { checkComponentStyles, checkTokenCompleteness } from './check-styles.mjs';

const FIX = join(process.cwd(), 'tools', '__fixtures__', 'styles');
const run = () => checkComponentStyles({ entriesGlobRoot: FIX, abstractsDir: join(FIX, 'abstracts') });

// Component CSS is unlayered (overriding it takes deliberate specificity); tokens live in the base CSS.
describe('checkComponentStyles', () => {
  it('accepts a plain, unlayered component sheet', async () => {
    expect((await run()).filter((v) => v.includes('good.scss'))).toEqual([]);
  });
  it('rejects a component sheet inside a cascade layer', async () => {
    expect((await run()).some((v) => v.includes('a.scss') && v.includes('cascade layer'))).toBe(true);
  });
  it('rejects :root / [data-theme] token blocks', async () => {
    expect((await run()).some((v) => v.includes('c.scss') && v.includes('token block'))).toBe(true);
  });
  it("rejects the dark theme's own `:root[data-theme='dark']` token block", async () => {
    expect((await run()).some((v) => v.includes('e.scss') && v.includes('token block'))).toBe(true);
  });
  it("accepts a component's own dark-theme rule ([data-theme='dark'] .x)", async () => {
    expect((await run()).filter((v) => v.includes('g.scss'))).toEqual([]);
  });
  it('rejects a component sheet reading a token outside the --mud-* namespace', async () => {
    const v = await run();
    expect(v.some((x) => x.includes('h.scss') && x.includes('--color-text-base-default'))).toBe(true);
    expect(v.some((x) => x.includes('h.scss') && x.includes('--mud-spacing-8'))).toBe(false);
  });
  it('rejects @font-face', async () => {
    expect((await run()).some((v) => v.includes('d.scss') && v.includes('@font-face'))).toBe(true);
  });
  it('rejects an abstracts module that emits CSS, accepts a quiet one', async () => {
    const v = await run();
    expect(v.some((x) => x.includes('_loud.scss'))).toBe(true);
    expect(v.some((x) => x.includes('_quiet.scss'))).toBe(false);
  });
});

describe('checkTokenCompleteness', () => {
  it('reports a --mud-* token read by a component but not declared by mud.css', () => {
    const prebuiltCss = ':root{--mud-a:1}';
    const componentCss = ['.x{color:var(--mud-a);margin:var(--mud-b, 2px)}'];
    expect(checkTokenCompleteness({ prebuiltCss, componentCss })).toEqual(['--mud-b']);
  });

  it('ignores private --_ locals and --mud-* props a component sets on itself', () => {
    const prebuiltCss = ':root{--mud-a:1}';
    const componentCss = ['.x{--mud-tooltip-max-width:200px;width:var(--mud-tooltip-max-width);top:var(--_t)}'];
    expect(checkTokenCompleteness({ prebuiltCss, componentCss })).toEqual([]);
  });

  it('treats a --mud-* property a component sets from TypeScript ([style.--mud-x]) as declared', () => {
    const prebuiltCss = ':root{--mud-a:1}';
    const componentCss = ["host: { '[style.--mud-tree-item-depth]': 'depth()' }", '.x{padding-left:calc(var(--mud-tree-item-depth) * 8px)}'];
    expect(checkTokenCompleteness({ prebuiltCss, componentCss })).toEqual([]);
  });

  it('a token named in a TypeScript comment does not count as declared', () => {
    const prebuiltCss = ':root{--mud-a:1}';
    const componentCss = [
      { entry: 'x', text: '// --mud-foo: documented here only', source: true },
      { entry: 'x', text: '.x{width:var(--mud-foo)}' },
    ];
    expect(checkTokenCompleteness({ prebuiltCss, componentCss })).toEqual(['--mud-foo']);
  });

  it('a TypeScript-bound token vouches only for its own entry point', () => {
    const prebuiltCss = ':root{--mud-a:1}';
    const componentCss = [
      { entry: 'tree-item', text: "host: { '[style.--mud-tree-item-depth]': 'depth()' }" },
      { entry: 'tree-item', text: '.x{padding-left:var(--mud-tree-item-depth)}' },
      { entry: 'sidebar', text: '.y{padding-left:var(--mud-tree-item-depth)}' },
    ];
    expect(checkTokenCompleteness({ prebuiltCss, componentCss })).toEqual(['--mud-tree-item-depth']);
  });
});

describe('checkTokenReferences', () => {
  it('reports --mud-* reads inside the base CSS itself that it never declares', async () => {
    const { checkTokenReferences } = await import('./check-styles.mjs');
    const prebuiltCss = ':root{--mud-a:1} :where(x){letter-spacing:var(--mud-b)}';

    expect(checkTokenReferences({ prebuiltCss, sources: [] })).toEqual(['mud.css reads undeclared --mud-b']);
  });

  it('reports non-library custom properties read by library CSS (they would bind to an app variable)', async () => {
    const { checkTokenReferences } = await import('./check-styles.mjs');
    const prebuiltCss = ':root{--mud-a:var(--font-weight-medium, 500)}';

    expect(checkTokenReferences({ prebuiltCss, sources: [] })).toEqual(['mud.css reads non-library --font-weight-medium']);
  });

  it('reports token names in docs/stories that the base CSS does not define', async () => {
    const { checkTokenReferences } = await import('./check-styles.mjs');
    const prebuiltCss = ':root{--mud-color-x:red}';
    const sources = [{ file: 'README.md', text: 'color: var(--color-x); ok: var(--mud-color-x); local: var(--_y)' }];

    expect(checkTokenReferences({ prebuiltCss, sources })).toEqual(['README.md references unknown --color-x']);
  });
});

describe('dark theme tokens', () => {
  it('reports a dark override whose token mud.css never declares (it would override nothing)', async () => {
    const { checkTokenReferences } = await import('./check-styles.mjs');
    const prebuiltCss = ':root{--mud-color-a:#000}';
    const darkCss = "[data-theme='dark']{--mud-color-a:#fff;--mud-color-b:#eee}";

    expect(checkTokenReferences({ prebuiltCss, darkCss, sources: [] })).toEqual(['mud-dark.css overrides undeclared --mud-color-b']);
  });

  it('lets the dark file read tokens that mud.css declares', async () => {
    const { checkTokenReferences } = await import('./check-styles.mjs');
    const prebuiltCss = ':root{--mud-color-a:#000;--mud-white:#fff}';
    const darkCss = "[data-theme='dark']{--mud-color-a:var(--mud-white)}";

    expect(checkTokenReferences({ prebuiltCss, darkCss, sources: [] })).toEqual([]);
  });
});
