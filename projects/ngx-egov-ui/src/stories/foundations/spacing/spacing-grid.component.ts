import { afterNextRender, Component, DOCUMENT, inject, input, signal } from '@angular/core';

export type SpacingKind = 'gap' | 'margin' | 'padding';

interface SpacingItem {
  className: string;
  scale: number;
  label: string;
}

interface SpacingSection {
  key: string;
  title: string;
  items: SpacingItem[];
}

interface KindConfig {
  note: string;
  test: RegExp;
  variantOf: (match: RegExpExecArray) => string;
  scaleOf: (match: RegExpExecArray) => number;
  sections: { key: string; title: string }[];
}

const CONFIG: Record<SpacingKind, KindConfig> = {
  gap: {
    note: 'Flexbox / grid gap utilities on the shared spacing scale (each step = 4px). Click a card to copy the class name.',
    test: /^\.(gap|row-gap|col-gap)-(\d+)$/,
    variantOf: (m) => m[1],
    scaleOf: (m) => Number(m[2]),
    sections: [
      { key: 'gap', title: 'Gap — both axes' },
      { key: 'col-gap', title: 'Column gap — horizontal' },
      { key: 'row-gap', title: 'Row gap — vertical' },
    ],
  },
  margin: {
    note: 'Margin utilities on the shared spacing scale (each step = 4px). The light zone is the margin around the box. Click a card to copy the class name.',
    test: /^\.m([trblxy]?)-(\d+)$/,
    variantOf: (m) => m[1] || 'a',
    scaleOf: (m) => Number(m[2]),
    sections: [
      { key: 'a', title: 'All sides' },
      { key: 'x', title: 'Horizontal — x' },
      { key: 'y', title: 'Vertical — y' },
      { key: 't', title: 'Top' },
      { key: 'r', title: 'Right' },
      { key: 'b', title: 'Bottom' },
      { key: 'l', title: 'Left' },
    ],
  },
  padding: {
    note: 'Padding utilities on the shared spacing scale (each step = 4px). The light zone is the padding inside the box. Click a card to copy the class name.',
    test: /^\.p([trblxy]?)-(\d+)$/,
    variantOf: (m) => m[1] || 'a',
    scaleOf: (m) => Number(m[2]),
    sections: [
      { key: 'a', title: 'All sides' },
      { key: 'x', title: 'Horizontal — x' },
      { key: 'y', title: 'Vertical — y' },
      { key: 't', title: 'Top' },
      { key: 'r', title: 'Right' },
      { key: 'b', title: 'Bottom' },
      { key: 'l', title: 'Left' },
    ],
  },
};

@Component({
  selector: 'egov-spacing-grid',
  template: `
    <p class="note">{{ config().note }}</p>

    @for (section of sections(); track section.key) {
      <section class="group">
        <h3 class="group__title">{{ section.title }}</h3>
        <div class="grid">
          @for (item of section.items; track item.className) {
            <button type="button" class="card" [title]="'Copy ' + item.className" (click)="copy(item.className)">
              <div class="demo">
                @switch (kind()) {
                  @case ('gap') {
                    <div class="gapwrap {{ item.className }}">
                      @for (n of BOXES; track n) {
                        <span class="gbox"></span>
                      }
                    </div>
                  }
                  @case ('margin') {
                    <div class="mzone"><span class="mbox {{ item.className }}"></span></div>
                  }
                  @case ('padding') {
                    <div class="pzone {{ item.className }}"><span class="pinner"></span></div>
                  }
                }
              </div>
              <div class="meta">
                <code class="meta__name">{{ item.className }}</code>
                <span class="meta__value">{{ item.label }}</span>
              </div>
              <span class="copied" [class.show]="copied() === item.className">copied ✓</span>
            </button>
          }
        </div>
      </section>
    }

    @if (sections().length === 0) {
      <p class="empty">No {{ kind() }} utilities found in the loaded stylesheet.</p>
    }
  `,
  styles: `
    :host {
      display: block;
      padding: 1.5rem 2rem;
      font-family: system-ui, sans-serif;
      color: #121212;
    }
    .note {
      margin: 0 0 1.5rem;
      font-size: 0.82rem;
      color: #757575;
    }
    .group {
      margin-bottom: 2rem;
    }
    .group__title {
      margin: 0 0 0.75rem;
      font-size: 0.95rem;
      font-weight: 600;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 0.75rem;
      align-items: start;
    }
    .card {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      position: relative;
      text-align: left;
      border: 1px solid #ececec;
      border-radius: 10px;
      background: #fff;
      padding: 0.75rem;
      font: inherit;
      cursor: pointer;
    }
    .card:hover {
      border-color: #cfcfcf;
    }
    .demo {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 72px;
      max-height: 200px;
      overflow: auto;
      background: #f5f5f5;
      border-radius: 8px;
      padding: 0.5rem;
    }
    .gapwrap {
      display: flex;
      flex-wrap: wrap;
      width: 96px;
    }
    .gbox {
      width: 28px;
      height: 20px;
      border-radius: 4px;
      background: #7aa7ff;
    }
    .mzone {
      display: inline-flex;
      background: #dbe7ff;
      border-radius: 4px;
    }
    .mbox {
      width: 44px;
      height: 26px;
      border-radius: 4px;
      background: #2563eb;
    }
    .pzone {
      display: inline-block;
      background: #dbe7ff;
      border-radius: 4px;
    }
    .pinner {
      display: block;
      width: 44px;
      height: 26px;
      border-radius: 2px;
      background: #2563eb;
    }
    .meta {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .meta__name {
      font-family: ui-monospace, monospace;
      font-size: 0.78rem;
    }
    .meta__value {
      font-size: 0.72rem;
      color: #757575;
    }
    .copied {
      position: absolute;
      right: 0.6rem;
      top: 0.5rem;
      font-size: 0.7rem;
      color: #0a7d34;
      opacity: 0;
      transition: opacity 0.15s;
    }
    .copied.show {
      opacity: 1;
    }
    .empty {
      color: #757575;
    }
  `,
})
export class SpacingGridComponent {
  private readonly _document = inject(DOCUMENT);

  readonly kind = input.required<SpacingKind>();

  protected readonly BOXES = [0, 1, 2, 3, 4, 5];
  protected readonly sections = signal<SpacingSection[]>([]);
  protected readonly copied = signal<string | null>(null);

  protected config(): KindConfig {
    return CONFIG[this.kind()];
  }

  constructor() {
    afterNextRender(() => this.load());
  }

  protected copy(className: string): void {
    void navigator.clipboard?.writeText(className);
    this.copied.set(className);

    setTimeout(() => this.copied.update((current) => (current === className ? null : current)), 1200);
  }

  private load(): void {
    const config = this.config();
    const byVariant = new Map<string, SpacingItem[]>();
    const seen = new Set<string>();

    for (const sheet of Array.from(this._document.styleSheets)) {
      let rules: CSSRuleList;

      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }

      for (const rule of Array.from(rules)) {
        if (!(rule instanceof CSSStyleRule)) {
          continue;
        }

        const match = config.test.exec(rule.selectorText);

        if (!match || seen.has(rule.selectorText)) {
          continue;
        }

        seen.add(rule.selectorText);

        const variant = config.variantOf(match);
        const scale = config.scaleOf(match);
        const property = rule.style.item(0);
        const value = property ? rule.style.getPropertyValue(property).trim() : '';
        const items = byVariant.get(variant) ?? [];

        items.push({ className: rule.selectorText.slice(1), scale, label: this.formatLabel(value) });
        byVariant.set(variant, items);
      }
    }

    const sections: SpacingSection[] = [];

    for (const { key, title } of config.sections) {
      const items = byVariant.get(key);

      if (items?.length) {
        items.sort((a, b) => a.scale - b.scale);
        sections.push({ key, title, items });
      }
    }

    this.sections.set(sections);
  }

  private formatLabel(value: string): string {
    if (!value) {
      return '';
    }

    const px = value.endsWith('rem')
      ? parseFloat(value) * 16
      : value.endsWith('px')
        ? parseFloat(value)
        : Number.NaN;

    return Number.isNaN(px) ? value : `${px}px · ${value}`;
  }
}
