import { afterNextRender, Component, DOCUMENT, inject, input, signal } from '@angular/core';

type ColorMode = 'primitives' | 'semantic';

interface Swatch {
  name: string;
  value: string;
}

interface ColorGroup {
  title: string;
  swatches: Swatch[];
}

const SEMANTIC_ORDER = ['background', 'text', 'border', 'icon'];
const COLOR_VALUE = /^#([0-9a-f]{3,8})$|^rgba?\(/i;

@Component({
  selector: 'mud-color-grid',
  template: `
    @if (mode() === 'semantic') {
      <div class="toolbar">
        <span class="toolbar__label">Theme</span>
        <button type="button" [class.active]="theme() === 'light'" (click)="setTheme('light')">Light</button>
        <button type="button" [class.active]="theme() === 'dark'" (click)="setTheme('dark')">Dark</button>
      </div>
    }

    @for (group of groups(); track group.title) {
      <section class="group">
        <h3 class="group__title">{{ group.title }}</h3>
        <div class="grid">
          @for (swatch of group.swatches; track swatch.name) {
            <button
              type="button"
              class="swatch"
              [title]="'Copy var(' + swatch.name + ')'"
              (click)="copy(swatch.name)"
            >
              <span class="swatch__chip" [style.background]="'var(' + swatch.name + ')'"></span>
              <span class="swatch__meta">
                <code class="swatch__name">{{ swatch.name }}</code>
                <span class="swatch__value">{{ swatch.value }}</span>
              </span>
              <span class="swatch__copied" [class.show]="copied() === swatch.name">copied ✓</span>
            </button>
          }
        </div>
      </section>
    }

    @if (groups().length === 0) {
      <p class="empty">No color tokens found in the loaded stylesheet.</p>
    }
  `,
  styles: `
    :host {
      display: block;
      padding: 1.5rem 2rem;
      font-family: system-ui, sans-serif;
      color: #121212;
    }
    .toolbar {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      margin-bottom: 1.5rem;
      padding: 0.25rem;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
    }
    .toolbar__label {
      font-size: 0.75rem;
      color: #757575;
      padding: 0 0.5rem;
    }
    .toolbar button {
      border: 0;
      background: transparent;
      padding: 0.35rem 0.85rem;
      border-radius: 6px;
      font: inherit;
      cursor: pointer;
    }
    .toolbar button.active {
      background: #121212;
      color: #fff;
    }
    .group {
      margin-bottom: 2rem;
    }
    .group__title {
      margin: 0 0 0.75rem;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #757575;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 0.75rem;
    }
    .swatch {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      position: relative;
      text-align: left;
      border: 1px solid #ececec;
      border-radius: 10px;
      background: #fff;
      padding: 0.6rem;
      font: inherit;
      cursor: pointer;
    }
    .swatch:hover {
      border-color: #cfcfcf;
    }
    .swatch__chip {
      flex: 0 0 auto;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
    }
    .swatch__meta {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .swatch__name {
      font-family: ui-monospace, monospace;
      font-size: 0.78rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .swatch__value {
      font-size: 0.72rem;
      color: #757575;
    }
    .swatch__copied {
      position: absolute;
      right: 0.6rem;
      top: 0.5rem;
      font-size: 0.7rem;
      color: #0a7d34;
      opacity: 0;
      transition: opacity 0.15s;
    }
    .swatch__copied.show {
      opacity: 1;
    }
    .empty {
      color: #757575;
    }
  `,
})
export class ColorGridComponent {
  private readonly _document = inject(DOCUMENT);

  readonly mode = input<ColorMode>('primitives');

  protected readonly theme = signal<'light' | 'dark'>('light');
  protected readonly groups = signal<ColorGroup[]>([]);
  protected readonly copied = signal<string | null>(null);

  constructor() {
    afterNextRender(() => this._load());
  }

  protected setTheme(theme: 'light' | 'dark'): void {
    this.theme.set(theme);

    this._load();
  }

  protected copy(name: string): void {
    void navigator.clipboard?.writeText(`var(${name})`);

    this.copied.set(name);

    setTimeout(() => this.copied.update((current) => (current === name ? null : current)), 1200);
  }

  private _load(): void {
    const root = this._document.documentElement;

    if (this.mode() === 'semantic' && this.theme() === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }

    const styles = getComputedStyle(root);
    const swatches: Swatch[] = [];

    for (const name of this._collectNames()) {
      const value = styles.getPropertyValue(name).trim();

      if (this.mode() === 'semantic' || COLOR_VALUE.test(value)) {
        swatches.push({ name, value });
      }
    }

    this.groups.set(this._group(swatches));
  }

  private _collectNames(): string[] {
    const names = new Set<string>();
    const wantSemantic = this.mode() === 'semantic';

    for (const sheet of Array.from(document.styleSheets)) {
      let rules: CSSRuleList;

      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }

      for (const rule of Array.from(rules)) {
        if (!(rule instanceof CSSStyleRule) || rule.selectorText !== ':root') {
          continue;
        }

        for (const name of Array.from(rule.style)) {
          const isSemantic = name.startsWith('--color-');

          if (name.startsWith('--') && isSemantic === wantSemantic) {
            names.add(name);
          }
        }
      }
    }

    return [...names];
  }

  private _group(swatches: Swatch[]): ColorGroup[] {
    const buckets = new Map<string, Swatch[]>();

    for (const swatch of swatches) {
      const key = this.mode() === 'semantic' ? this._categoryOf(swatch.name) : this._familyOf(swatch.name);
      const bucket = buckets.get(key) ?? [];

      bucket.push(swatch);
      buckets.set(key, bucket);
    }

    const order = this.mode() === 'semantic' ? SEMANTIC_ORDER : [...buckets.keys()].sort();

    return order
      .filter((key) => buckets.has(key))
      .concat([...buckets.keys()].filter((k) => !order.includes(k)).sort())
      .map((title) => ({ title, swatches: buckets.get(title)!.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })) }));
  }

  private _familyOf(name: string): string {
    const parts = name.replace(/^--/, '').split('-');

    while (parts.length > 1 && (/^\d+$/.test(parts[parts.length - 1]) || parts[parts.length - 1] === 'alpha')) {
      parts.pop();
    }

    return parts.join('-');
  }

  private _categoryOf(name: string): string {
    return name.replace(/^--color-/, '').split('-')[0];
  }
}
