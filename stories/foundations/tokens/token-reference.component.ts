import { afterNextRender, Component, DOCUMENT, inject, signal } from '@angular/core';
import { unlayeredRules } from '../css-rules';

interface Token {
  name: string;
  value: string;
}

interface Group {
  title: string;
  kind: 'spacing' | 'radius' | 'shadow' | 'type' | 'plain';
  tokens: Token[];
}

// Public shared scales, in display order. Colors live on the Colors pages.
const SHARED: { title: string; kind: Group['kind']; match: RegExp }[] = [
  { title: 'Spacing & gaps', kind: 'spacing', match: /^--mud-spacing-/ },
  { title: 'Border radius', kind: 'radius', match: /^--mud-border-radius/ },
  { title: 'Border width', kind: 'plain', match: /^--mud-border-width/ },
  { title: 'Border style & colour', kind: 'plain', match: /^--mud-border-(style|color)/ },
  { title: 'Shadows (elevation)', kind: 'shadow', match: /^--mud-drop-shadow-/ },
  { title: 'Focus ring', kind: 'plain', match: /^--mud-focus-ring/ },
  { title: 'Font family & weight', kind: 'plain', match: /^--mud-font-(family|weight)/ },
  { title: 'Type scale', kind: 'type', match: /^--mud-text-/ },
  { title: 'Motion', kind: 'plain', match: /^--mud-motion-/ },
  { title: 'Layering', kind: 'plain', match: /^--mud-z-/ },
];
// Palette primitives (`--mud-gray-200: #…`) carry a literal colour; they belong to the Colors pages.
const COLOR_LITERAL = /^#[0-9a-f]{3,8}$|^(rgb|hsl)a?\(/i;
// Anything else outside the shared scales is a component token, grouped by the entry point it belongs
// to. Entry names come from the repo at build time (longest match first: `tree-item` before `tree`).
const ENTRIES = Object.keys(import.meta.glob('../../../projects/ngx-mud-ui/*/ng-package.json'))
  .map((path) => path.split('/').at(-2) ?? '')
  .sort((a, b) => b.length - a.length);
const ownerOf = (name: string): string | undefined =>
  ENTRIES.find((entry) => name.startsWith(`--mud-${entry}-`)) ?? name.match(/^--mud-([a-z]+)-/)?.[1];

/**
 * Storybook-only Foundations page: every non-colour `--mud-*` token declared by the base CSS,
 * read at runtime. Shared scales are public API; component tokens are listed as not recommended.
 */
@Component({
  selector: 'mud-token-reference',
  template: `
    <section class="intro">
      <h2>Shared scales — public</h2>
      <p>
        Use these in your own CSS to match the library, e.g. <code>gap: var(--mud-spacing-16)</code>,
        <code>border-radius: var(--mud-border-radius-8)</code>,
        <code>box-shadow: var(--mud-drop-shadow-300)</code>.
      </p>
    </section>

    @for (group of shared(); track group.title) {
      <section class="group">
        <h3>{{ group.title }}</h3>
        @for (token of group.tokens; track token.name) {
          <div class="row">
            <code class="name">{{ token.name }}</code>
            <span class="value">{{ token.value }}</span>
            @switch (group.kind) {
              @case ('spacing') {
                <span class="swatch swatch--spacing" [style.width]="'var(' + token.name + ')'"></span>
              }
              @case ('radius') {
                <span class="swatch swatch--box" [style.border-radius]="'var(' + token.name + ')'"></span>
              }
              @case ('shadow') {
                <span class="swatch swatch--box" [style.box-shadow]="'var(' + token.name + ')'"></span>
              }
              @default {
                <span></span>
              }
            }
          </div>
        }
      </section>
    }

    <section class="intro intro--muted">
      <h2>Component tokens — overridable, not recommended</h2>
      <p>
        The library follows the official MUD design; changing these makes a component diverge from
        it. Prefer the colour tokens and shared scales above.
      </p>
    </section>

    @for (group of component(); track group.title) {
      <section class="group">
        <h3>{{ group.title }}</h3>
        @for (token of group.tokens; track token.name) {
          <div class="row">
            <code class="name">{{ token.name }}</code>
            <span class="value">{{ token.value }}</span>
            <span></span>
          </div>
        }
      </section>
    }
  `,
  styles: `
    :host {
      display: block;
      padding: 1.5rem 2rem;
      font-family: var(--mud-font-family-base);
      color: var(--mud-color-text-base-default);
    }
    h2 {
      margin: 0 0 0.5rem;
      font-size: 1.1rem;
    }
    h3 {
      margin: 0 0 0.75rem;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--mud-color-text-base-secondary);
    }
    p {
      margin: 0 0 1.5rem;
      font-size: 0.85rem;
    }
    .intro--muted {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--mud-color-border-base-default);
    }
    .group {
      margin-bottom: 2rem;
    }
    .row {
      display: grid;
      grid-template-columns: minmax(16rem, 22rem) minmax(8rem, 1fr) 8rem;
      gap: 1rem;
      align-items: center;
      padding: 0.4rem 0;
      border-top: 1px solid var(--mud-color-border-base-default);
    }
    .name {
      font-size: 0.78rem;
    }
    .value {
      font-size: 0.75rem;
      color: var(--mud-color-text-base-secondary);
      overflow-wrap: anywhere;
    }
    .swatch--spacing {
      display: block;
      height: 0.75rem;
      max-width: 8rem;
      background: var(--mud-color-background-brand-default);
    }
    .swatch--box {
      display: block;
      width: 3rem;
      height: 2rem;
      background: var(--mud-color-background-base-default);
      border: 1px solid var(--mud-color-border-base-default);
    }
  `,
})
export class TokenReferenceComponent {
  private readonly _document = inject(DOCUMENT);

  protected readonly shared = signal<Group[]>([]);
  protected readonly component = signal<Group[]>([]);

  constructor() {
    afterNextRender(() => this._load());
  }

  private _load(): void {
    const tokens = this._rootTokens();
    const taken = new Set<string>();

    this.shared.set(
      SHARED.map(({ title, kind, match }) => {
        const list = tokens.filter((t) => match.test(t.name) && !taken.has(t.name));

        list.forEach((t) => taken.add(t.name));

        return { title, kind, tokens: list };
      }).filter((g) => g.tokens.length),
    );

    const byComponent = new Map<string, Token[]>();

    for (const token of tokens) {
      if (taken.has(token.name) || COLOR_LITERAL.test(token.value)) continue;

      const owner = ownerOf(token.name);

      if (owner) byComponent.set(owner, [...(byComponent.get(owner) ?? []), token]);
    }
    this.component.set([...byComponent].map(([title, list]) => ({ title, kind: 'plain', tokens: list })));
  }

  private _rootTokens(): Token[] {
    const found = new Map<string, string>();

    for (const sheet of Array.from(this._document.styleSheets)) {
      let rules: CSSRule[];

      try {
        rules = unlayeredRules(sheet.cssRules);
      } catch {
        continue;
      }
      for (const rule of rules) {
        if (!(rule instanceof CSSStyleRule) || rule.selectorText.trim() !== ':root') continue;

        for (const name of Array.from(rule.style)) {
          if (name.startsWith('--mud-') && !name.startsWith('--mud-color-')) found.set(name, rule.style.getPropertyValue(name).trim());
        }
      }
    }

    return [...found].map(([name, value]) => ({ name, value })).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }
}
