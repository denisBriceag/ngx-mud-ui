import { afterNextRender, Component, DOCUMENT, inject, signal } from '@angular/core';
import { MudSegment, MudSegmentedControl } from 'ngx-mud-ui/segmented-control';

type Device = 'desktop' | 'mobile';

interface TypeStyle {
  className: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
}

interface TypeGroup {
  title: string;
  styles: TypeStyle[];
}

const FAMILY_ORDER = ['display', 'heading', 'body', 'caption'];
const SAMPLE = 'The quick brown fox';

/**
 * Storybook-only Foundations page for the typography scale. Enumerates the
 * `.mud-{desktop|mobile}-*` type classes loaded in the preview
 * (`.storybook/design-tokens.scss`), renders a specimen in each, reads its
 * declared size/weight/line-height/letter-spacing, and copies the class name
 * on click. The Desktop/Mobile toggle switches which scale is shown.
 */
@Component({
  selector: 'mud-typography-grid',
  imports: [MudSegment, MudSegmentedControl],
  template: `
    <mud-segmented-control
      class="toolbar"
      [value]="device()"
      (selectionChange)="setDevice($event.value)"
      aria-label="Type scale"
    >
      <button mud-segment value="desktop">Desktop</button>
      <button mud-segment value="mobile">Mobile</button>
    </mud-segmented-control>

    @for (group of groups(); track group.title) {
      <section class="group">
        <h3 class="group__title">{{ group.title }}</h3>
        @for (style of group.styles; track style.className) {
          <button
            type="button"
            class="row"
            [title]="'Copy ' + style.className"
            (click)="copy(style.className)"
          >
            <div class="specimen" [class]="style.className">{{ sample }}</div>
            <div class="meta">
              <code class="meta__name">{{ style.className }}</code>
              <span class="meta__props">
                {{ style.fontSize }} · {{ style.fontWeight }} · lh {{ style.lineHeight }}
                @if (style.letterSpacing) {
                  · ls {{ style.letterSpacing }}
                }
              </span>
            </div>
            <span class="copied" [class.show]="copied() === style.className">copied ✓</span>
          </button>
        }
      </section>
    }

    @if (groups().length === 0) {
      <p class="empty">No typography classes found in the loaded stylesheet.</p>
    }
  `,
  styles: `
    :host {
      display: block;
      padding: 1.5rem 2rem;
      font-family: system-ui, sans-serif;
      color: var(--color-text-base-default);
    }
    .toolbar {
      display: inline-flex;
      margin-bottom: 1.5rem;
    }
    .group {
      margin-bottom: 2.5rem;
    }
    .group__title {
      margin: 0 0 1rem;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-text-base-secondary);
    }
    .row {
      display: block;
      position: relative;
      width: 100%;
      text-align: left;
      border: 0;
      border-top: 1px solid var(--color-border-base-default);
      background: transparent;
      padding: 1rem 0.5rem;
      cursor: pointer;
    }
    .row:hover {
      background: var(--color-background-base-secondary);
    }
    .specimen {
      margin: 0 0 0.35rem;
      overflow-wrap: anywhere;
    }
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 1rem;
      align-items: baseline;
    }
    .meta__name {
      font-family: ui-monospace, monospace;
      font-size: 0.78rem;
    }
    .meta__props {
      font-size: 0.72rem;
      color: var(--color-text-base-secondary);
    }
    .copied {
      position: absolute;
      right: 0.5rem;
      top: 1rem;
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
export class TypographyGridComponent {
  private readonly _document = inject(DOCUMENT);

  protected readonly sample = SAMPLE;
  protected readonly device = signal<Device>('desktop');
  protected readonly groups = signal<TypeGroup[]>([]);
  protected readonly copied = signal<string | null>(null);

  constructor() {
    afterNextRender(() => this._load());
  }

  protected setDevice(device: Device): void {
    this.device.set(device);

    this._load();
  }

  protected copy(className: string): void {
    void navigator.clipboard?.writeText(className);
    this.copied.set(className);

    setTimeout(
      () => this.copied.update((current) => (current === className ? null : current)),
      1200,
    );
  }

  private _load(): void {
    const single = new RegExp(`^\\.mud-${this.device()}-[a-z0-9-]+$`);
    const seen = new Set<string>();
    const styles: TypeStyle[] = [];

    for (const sheet of Array.from(this._document.styleSheets)) {
      let rules: CSSRuleList;

      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }

      for (const rule of Array.from(rules)) {
        if (!(rule instanceof CSSStyleRule) || !single.test(rule.selectorText)) {
          continue;
        }

        const className = rule.selectorText.slice(1);

        if (seen.has(className)) {
          continue;
        }

        seen.add(className);
        styles.push({
          className,
          fontSize: rule.style.getPropertyValue('font-size').trim(),
          fontWeight: rule.style.getPropertyValue('font-weight').trim(),
          lineHeight: rule.style.getPropertyValue('line-height').trim(),
          letterSpacing: rule.style.getPropertyValue('letter-spacing').trim(),
        });
      }
    }

    this.groups.set(this._group(styles));
  }

  private _group(styles: TypeStyle[]): TypeGroup[] {
    const buckets = new Map<string, TypeStyle[]>();

    for (const style of styles) {
      const key = this._familyOf(style.className);
      const bucket = buckets.get(key) ?? [];

      bucket.push(style);
      buckets.set(key, bucket);
    }

    const known = FAMILY_ORDER.filter((key) => buckets.has(key));
    const rest = [...buckets.keys()].filter((key) => !FAMILY_ORDER.includes(key)).sort();

    return [...known, ...rest].map((title) => ({
      title,
      styles: buckets.get(title)!.sort((a, b) => parseFloat(b.fontSize) - parseFloat(a.fontSize)),
    }));
  }

  private _familyOf(className: string): string {
    return className.replace(/^mud-(desktop|mobile)-/, '').split('-')[0];
  }
}
