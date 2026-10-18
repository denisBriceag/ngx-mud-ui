import { describe, it, expect } from 'vitest';
import { compileString } from 'sass';
import { readFileSync } from 'node:fs';

const LOAD = { loadPaths: ['projects/ngx-mud-ui'] };

describe('breakpoints', () => {
  it('Sass map matches the TS constants', () => {
    const css = compileString(
      `@use 'sass:map'; @use 'breakpoints' as bp;
       @each $k, $v in bp.$breakpoints { .#{$k} { w: $v; } }`, LOAD).css;
    const sass = Object.fromEntries([...css.matchAll(/\.(\w+)\s*\{\s*w:\s*(\d+)px/g)].map(([, k, v]) => [k, Number(v)]));
    const ts = readFileSync('projects/ngx-mud-ui/breakpoints/src/lib/breakpoints.ts', 'utf8');
    const tsValues = Object.fromEntries([...ts.matchAll(/(\w+): (\d+),/g)].map(([, k, v]) => [k.toLowerCase(), Number(v)]));

    expect(sass).toEqual(tsValues);
  });

  it('up / down / between emit the documented queries', () => {
    const css = compileString(
      `@use 'breakpoints' as bp;
       @include bp.up(md) { .a { x: 1; } }
       @include bp.down(md) { .b { x: 1; } }
       @include bp.between(sm, lg) { .c { x: 1; } }`, LOAD).css;

    expect(css).toContain('@media (min-width: 768px)');
    expect(css).toContain('@media (max-width: 767.98px)');
    expect(css).toContain('@media (min-width: 576px) and (max-width: 991.98px)');
  });
});
