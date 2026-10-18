import { afterNextRender, Component, DOCUMENT, inject, input, signal } from '@angular/core';
import { MudSegment, MudSegmentedControl } from 'ngx-mud-ui/segmented-control';
import { unlayeredRules } from '../css-rules';

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

const normalizeSelector = (selector: string): string =>
  selector.replace(/['"]/g, '').replace(/\s+/g, ' ').trim();
const COLOR_VALUE = /^#([0-9a-f]{3,8})$|^rgba?\(/i;

@Component({
  selector: 'mud-color-grid',
  imports: [MudSegment, MudSegmentedControl],
  template: `
    @if (mode() === 'semantic') {
      <mud-segmented-control
        class="toolbar"
        [value]="theme()"
        (selectionChange)="setTheme($event.value)"
        aria-label="Token theme"
      >
        <button mud-segment value="light">Light</button>
        <button mud-segment value="dark">Dark</button>
      </mud-segmented-control>
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
              <span class="swatch__chip" [style.background]="swatch.value"></span>
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
      color: var(--mud-color-text-base-default);
    }
    .toolbar {
      display: inline-flex;
      margin-bottom: 1.5rem;
    }
    .group {
      margin-bottom: 2rem;
    }
    .group__title {
      margin: 0 0 0.75rem;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--mud-color-text-base-secondary);
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
      border: 1px solid var(--mud-color-border-base-default);
      border-radius: 10px;
      background: var(--mud-color-background-base-default);
      padding: 0.6rem;
      font: inherit;
      cursor: pointer;
    }
    .swatch:hover {
      border-color: var(--mud-color-border-base-secondary);
    }
    .swatch__chip {
      flex: 0 0 auto;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      box-shadow: inset 0 0 0 1px var(--mud-color-border-base-default);
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
      color: var(--mud-color-text-base-secondary);
    }
    .swatch__copied {
      position: absolute;
      right: 0.6rem;
      top: 0.5rem;
      font-size: 0.7rem;
      color: var(--mud-color-text-positive-default);
      opacity: 0;
      transition: opacity 0.15s;
    }
    .swatch__copied.show {
      opacity: 1;
    }
    .empty {
      color: var(--mud-color-text-base-secondary);
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
    const light = this._declared(':root');
    const dark = this._declared(":root[data-theme='dark']");
    const wantSemantic = this.mode() === 'semantic';
    const scale = wantSemantic && this.theme() === 'dark' ? dark : new Map<string, string>();
    const swatches: Swatch[] = [];

    for (const [name, lightValue] of light) {
      if (name.startsWith('--mud-color-') !== wantSemantic) continue;

      // Dark only overrides part of the palette; the rest keeps its light value.
      const value = this._resolve(scale.get(name) ?? lightValue, light, scale, 0);

      if (wantSemantic || COLOR_VALUE.test(value)) {
        swatches.push({ name, value });
      }
    }

    this.groups.set(this._group(swatches));
  }

  /** Merges the declarations of every rule matching `selector`, in cascade order. */
  private _declared(selector: string): Map<string, string> {
    const declarations = new Map<string, string>();
    const wanted = normalizeSelector(selector);

    for (const sheet of Array.from(this._document.styleSheets)) {
      let rules: CSSRule[];

      try {
        rules = unlayeredRules(sheet.cssRules);
      } catch {
        continue;
      }

      for (const rule of Array.from(rules)) {
        if (!(rule instanceof CSSStyleRule) || normalizeSelector(rule.selectorText) !== wanted) {
          continue;
        }

        for (const name of Array.from(rule.style)) {
          if (name.startsWith('--')) {
            declarations.set(name, rule.style.getPropertyValue(name).trim());
          }
        }
      }
    }

    return declarations;
  }

  private _resolve(
    value: string,
    light: Map<string, string>,
    scale: Map<string, string>,
    depth: number,
  ): string {
    const reference = /^var\(\s*(--[a-z0-9-]+)\s*\)$/i.exec(value)?.[1];

    if (!reference || depth > 10) return value;

    const next = scale.get(reference) ?? light.get(reference);

    return next === undefined ? value : this._resolve(next, light, scale, depth + 1);
  }

  private _group(swatches: Swatch[]): ColorGroup[] {
    const buckets = new Map<string, Swatch[]>();

    for (const swatch of swatches) {
      const key =
        this.mode() === 'semantic' ? this._categoryOf(swatch.name) : this._familyOf(swatch.name);
      const bucket = buckets.get(key) ?? [];

      bucket.push(swatch);
      buckets.set(key, bucket);
    }

    const order = this.mode() === 'semantic' ? SEMANTIC_ORDER : [...buckets.keys()].sort();

    return order
      .filter((key) => buckets.has(key))
      .concat([...buckets.keys()].filter((k) => !order.includes(k)).sort())
      .map((title) => ({
        title,
        swatches: buckets
          .get(title)!
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })),
      }));
  }

  private _familyOf(name: string): string {
    const parts = name.replace(/^--mud-/, '').split('-');

    while (
      parts.length > 1 &&
      (/^\d+$/.test(parts[parts.length - 1]) || parts[parts.length - 1] === 'alpha')
    ) {
      parts.pop();
    }

    return parts.join('-');
  }

  private _categoryOf(name: string): string {
    return name.replace(/^--mud-color-/, '').split('-')[0];
  }
}
