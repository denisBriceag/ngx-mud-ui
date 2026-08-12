import { afterNextRender, Component, DOCUMENT, inject, signal } from '@angular/core';

interface DisplayUtil {
  className: string;
  value: string;
}

const ORDER = [
  'block',
  'inline',
  'inline-block',
  'flex',
  'inline-flex',
  'grid',
  'inline-grid',
  'table',
  'table-row',
  'table-cell',
  'none',
];

@Component({
  selector: 'egov-display-grid',
  template: `
    <p class="note">
      Display utilities set <code>display</code>. Each also has responsive variants —
      <code>mud-{{ '{' }}breakpoint{{ '}' }}-{{ '{' }}name{{ '}' }}</code> (e.g. <code>mud-md-flex</code>).
      Click a card to copy the class name.
    </p>

    <div class="grid">
      @for (util of utils(); track util.className) {
        <button type="button" class="card" [title]="'Copy ' + util.className" (click)="copy(util.className)">
          <div class="demo" [style.display]="util.value === 'none' ? 'flex' : util.value">
            @if (util.value === 'none') {
              <span class="demo__hidden">(hidden — nothing renders)</span>
            } @else {
              <span class="demo__box">1</span>
              <span class="demo__box">2</span>
              <span class="demo__box">3</span>
            }
          </div>
          <div class="meta">
            <code class="meta__name">{{ util.className }}</code>
            <span class="meta__value">display: {{ util.value }}</span>
          </div>
          <span class="copied" [class.show]="copied() === util.className">copied ✓</span>
        </button>
      }
    </div>

    @if (utils().length === 0) {
      <p class="empty">No display utilities found in the loaded stylesheet.</p>
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
    .note code {
      font-family: ui-monospace, monospace;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.75rem;
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
      gap: 4px;
      align-content: flex-start;
      min-height: 72px;
      background: #f5f5f5;
      border-radius: 8px;
      padding: 0.5rem;
      overflow: hidden;
    }
    .demo__box {
      display: block;
      width: 28px;
      height: 20px;
      border-radius: 4px;
      background: #7aa7ff;
      color: #fff;
      font-size: 0.6rem;
      text-align: center;
      line-height: 20px;
    }
    .demo__hidden {
      font-size: 0.7rem;
      color: #9e9e9e;
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
export class DisplayGridComponent {
  private readonly _document = inject(DOCUMENT);

  protected readonly utils = signal<DisplayUtil[]>([]);
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
    const seen = new Set<string>();
    const utils: DisplayUtil[] = [];
    const singleClass = /^\.[a-z0-9-]+$/;

    for (const sheet of Array.from(this._document.styleSheets)) {
      let rules: CSSRuleList;

      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }

      for (const rule of Array.from(rules)) {
        if (!(rule instanceof CSSStyleRule) || !singleClass.test(rule.selectorText)) {
          continue;
        }

        const value = rule.style.getPropertyValue('display').trim();

        if (!value || rule.style.length !== 1) {
          continue;
        }

        const className = rule.selectorText.slice(1);

        if (!seen.has(className)) {
          seen.add(className);
          utils.push({ className, value });
        }
      }
    }

    utils.sort((a, b) => this._rank(a.value) - this._rank(b.value) || a.className.localeCompare(b.className));

    this.utils.set(utils);
  }

  private _rank(value: string): number {
    const index = ORDER.indexOf(value);

    return index === -1 ? ORDER.length : index;
  }
}
