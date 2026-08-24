import { afterNextRender, Component, DOCUMENT, inject, signal } from '@angular/core';

interface WidthItem {
  className: string;
  value: string;
  percent: number | null;
}

interface WidthSection {
  title: string;
  kind: 'bar' | 'value' | 'truncate';
  items: WidthItem[];
}

const PERCENT = ['w-25', 'w-33', 'w-50', 'w-66', 'w-75', 'w-100'];
const KEYWORD = ['w-auto', 'w-full', 'w-screen'];
const CONSTRAINT = ['min-w-0', 'min-w-full', 'max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-xxl'];

@Component({
  selector: 'mud-width-grid',
  template: `
    <p class="note">
      Width utilities set a fixed <code>width</code> (or min/max width). Percentage widths also have responsive
      variants — <code>{{ prefix() }}w-{{ '{' }}breakpoint{{ '}' }}-{{ '{' }}value{{ '}' }}</code> (e.g.
      <code>{{ prefix() }}w-md-50</code>). Click a row to copy the class name.
    </p>

    @for (section of sections(); track section.title) {
      <section class="group">
        <h3 class="group__title">{{ section.title }}</h3>

        @switch (section.kind) {
          @case ('bar') {
            <div class="bars">
              @for (item of section.items; track item.className) {
                <button type="button" class="bar-row" [title]="'Copy ' + item.className" (click)="copy(item.className)">
                  <code class="bar-row__name">{{ item.className }}</code>
                  <span class="bar-row__value">{{ item.value }}</span>
                  <span class="bar-track">
                    <span class="bar-fill" [style.width]="item.percent + '%'"></span>
                  </span>
                  <span class="copied" [class.show]="copied() === item.className">copied ✓</span>
                </button>
              }
            </div>
          }
          @case ('truncate') {
            @for (item of section.items; track item.className) {
              <button type="button" class="card" [title]="'Copy ' + item.className" (click)="copy(item.className)">
                <span class="truncate-demo {{ item.className }}">
                  This is a very long line of text that will be clipped with an ellipsis when it overflows.
                </span>
                <div class="meta">
                  <code class="meta__name">{{ item.className }}</code>
                  <span class="meta__value">{{ item.value }}</span>
                </div>
                <span class="copied" [class.show]="copied() === item.className">copied ✓</span>
              </button>
            }
          }
          @default {
            <div class="grid">
              @for (item of section.items; track item.className) {
                <button type="button" class="card card--value" [title]="'Copy ' + item.className" (click)="copy(item.className)">
                  <code class="meta__name">{{ item.className }}</code>
                  <span class="meta__value">{{ item.value }}</span>
                  <span class="copied" [class.show]="copied() === item.className">copied ✓</span>
                </button>
              }
            </div>
          }
        }
      </section>
    }

    @if (sections().length === 0) {
      <p class="empty">No width utilities found in the loaded stylesheet.</p>
    }
  `,
  styles: `
    :host {
      display: block;
      padding: 1.5rem 2rem;
      font-family: system-ui, sans-serif;
      color: var(--color-text-base-default);
    }
    .note {
      margin: 0 0 1.5rem;
      font-size: 0.82rem;
      color: var(--color-text-base-secondary);
    }
    code {
      font-family: ui-monospace, monospace;
    }
    .group {
      margin-bottom: 2rem;
    }
    .group__title {
      margin: 0 0 0.75rem;
      font-size: 0.95rem;
      font-weight: 600;
    }
    .bars {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .bar-row {
      position: relative;
      display: grid;
      grid-template-columns: 120px 90px 1fr;
      align-items: center;
      gap: 0.75rem;
      text-align: left;
      border: 1px solid var(--color-border-base-default);
      border-radius: 8px;
      background: var(--color-background-base-default);
      padding: 0.6rem 0.75rem;
      font: inherit;
      cursor: pointer;
    }
    .bar-row:hover {
      border-color: var(--color-border-base-secondary);
    }
    .bar-row__name {
      font-size: 0.78rem;
    }
    .bar-row__value {
      font-size: 0.72rem;
      color: var(--color-text-base-secondary);
    }
    .bar-track {
      background: var(--color-background-positive-secondary);
      border-radius: 4px;
      overflow: hidden;
    }
    .bar-fill {
      display: block;
      height: 20px;
      border-radius: 4px;
      background: var(--color-background-positive-default);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 0.6rem;
    }
    .card {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      position: relative;
      text-align: left;
      border: 1px solid var(--color-border-base-default);
      border-radius: 10px;
      background: var(--color-background-base-default);
      padding: 0.75rem;
      font: inherit;
      cursor: pointer;
    }
    .card:hover {
      border-color: var(--color-border-base-secondary);
    }
    .card--value {
      flex-direction: row;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.75rem;
    }
    .meta {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .meta__name {
      font-size: 0.78rem;
    }
    .meta__value {
      font-size: 0.72rem;
      color: var(--color-text-base-secondary);
    }
    .truncate-demo {
      display: block;
      max-width: 260px;
      padding: 0.5rem;
      background: var(--color-background-base-secondary);
      border-radius: 6px;
      font-size: 0.8rem;
    }
    .copied {
      position: absolute;
      right: 0.6rem;
      top: 0.5rem;
      font-size: 0.7rem;
      color: var(--color-text-positive-default);
      opacity: 0;
      transition: opacity 0.15s;
    }
    .copied.show {
      opacity: 1;
    }
    .empty {
      color: var(--color-text-base-secondary);
    }
  `,
})
export class WidthGridComponent {
  private readonly _document = inject(DOCUMENT);

  protected readonly prefix = signal('mud-');
  protected readonly sections = signal<WidthSection[]>([]);
  protected readonly copied = signal<string | null>(null);

  constructor() {
    afterNextRender(() => this._load());
  }

  protected copy(className: string): void {
    void navigator.clipboard?.writeText(className);
    this.copied.set(className);

    setTimeout(() => this.copied.update((current) => (current === className ? null : current)), 1200);
  }

  private _load(): void {
    const prefix = this._detectPrefix();

    this.prefix.set(prefix);

    const percent = PERCENT.map((stem) => this._item(prefix + stem)).filter((item): item is WidthItem => item !== null);
    const keyword = KEYWORD.map((stem) => this._item(prefix + stem)).filter((item): item is WidthItem => item !== null);
    const constraint = CONSTRAINT.map((stem) => this._item(prefix + stem)).filter(
      (item): item is WidthItem => item !== null,
    );
    const truncate = this._item(prefix + 'truncate', 'overflow: hidden; text-overflow: ellipsis');

    const sections: WidthSection[] = [];

    if (percent.length) sections.push({ title: 'Percentage widths', kind: 'bar', items: percent });

    if (keyword.length) sections.push({ title: 'Keyword widths', kind: 'value', items: keyword });

    if (constraint.length) sections.push({ title: 'Min / max width', kind: 'value', items: constraint });

    if (truncate) sections.push({ title: 'Text truncation', kind: 'truncate', items: [truncate] });

    this.sections.set(sections);
  }

  private _detectPrefix(): string {
    return this._findRule('.mud-w-50') ? 'mud-' : '';
  }

  private _item(className: string, valueOverride?: string): WidthItem | null {
    const rule = this._findRule('.' + className);

    if (!rule) {
      return null;
    }

    const property = rule.style.item(0);
    const value = valueOverride ?? (property ? rule.style.getPropertyValue(property).trim() : '');
    const percent = value.endsWith('%') ? parseFloat(value) : null;

    return { className, value, percent };
  }

  private _findRule(selector: string): CSSStyleRule | null {
    for (const sheet of Array.from(this._document.styleSheets)) {
      let rules: CSSRuleList;

      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }

      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSStyleRule && rule.selectorText === selector) {
          return rule;
        }
      }
    }

    return null;
  }
}
