import { describe, expect, it } from 'vitest';

import { appendBodyRule, bodyRule, findGlobalStylesheet } from '../ng-add/stylesheet';

const CSS_RULE = 'body {\n  font-family: var(--mud-font-family-base);\n  font-size: 1rem;\n}\n';
const SASS_RULE = 'body\n  font-family: var(--mud-font-family-base)\n  font-size: 1rem\n';

describe('bodyRule', () => {
  it('uses block syntax for css, scss and less, indented syntax for sass', () => {
    expect(bodyRule('a.css')).toBe(CSS_RULE);
    expect(bodyRule('a.scss')).toBe(CSS_RULE);
    expect(bodyRule('a.less')).toBe(CSS_RULE);
    expect(bodyRule('a.sass')).toBe(SASS_RULE);
  });
});

describe('appendBodyRule', () => {
  it('writes the rule into an empty file', () => {
    expect(appendBodyRule('', 'a.css')).toBe(CSS_RULE);
  });

  it('separates the rule from existing content with one blank line, newline or not', () => {
    expect(appendBodyRule('h1{}', 'a.css')).toBe(`h1{}\n\n${CSS_RULE}`);
    expect(appendBodyRule('h1{}\n', 'a.css')).toBe(`h1{}\n\n${CSS_RULE}`);
  });

  it('returns null when the font is already set', () => {
    expect(appendBodyRule('body{font-family:var(--mud-font-family-base)}', 'a.css')).toBeNull();
  });
});

describe('findGlobalStylesheet', () => {
  const exists = (path: string) => path === 'src/styles.scss';

  it('skips library and node_modules entries and returns the app stylesheet', () => {
    expect(findGlobalStylesheet(['ngx-mud-ui/prebuilt/mud.css', { input: 'node_modules/x.css' }, 'src/styles.scss'], exists)).toBe(
      'src/styles.scss',
    );
  });

  it('returns null when no entry qualifies', () => {
    expect(findGlobalStylesheet(['ngx-mud-ui/prebuilt/mud.css', 'src/missing.css'], exists)).toBeNull();
  });
});
