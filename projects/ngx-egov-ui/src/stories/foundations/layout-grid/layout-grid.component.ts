import { afterNextRender, Component, DOCUMENT, inject, signal } from '@angular/core';

interface Tier {
  name: string;
  min: string;
  columns: number;
  gutter: string;
  container: string;
}

interface GridExample {
  title: string;
  spans: number[];
}

const TIERS: Tier[] = [
  { name: 'XS', min: '≥ 320px', columns: 4, gutter: '16px', container: '100% − margins' },
  { name: 'SM', min: '≥ 576px', columns: 4, gutter: '16px', container: '544px' },
  { name: 'MD', min: '≥ 768px', columns: 8, gutter: '24px', container: '720px' },
  { name: 'LG', min: '≥ 992px', columns: 12, gutter: '24px', container: '944px' },
  { name: 'XL', min: '≥ 1248px', columns: 12, gutter: '24px', container: '1200px' },
  { name: 'XXL', min: '≥ 1440px', columns: 12, gutter: '24px', container: '1440px' },
];

const EXAMPLES: GridExample[] = [
  { title: '12 × col-1', spans: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
  { title: 'Halves — col-6', spans: [6, 6] },
  { title: 'Thirds — col-4', spans: [4, 4, 4] },
  { title: 'Quarters — col-3', spans: [3, 3, 3, 3] },
  { title: 'Sidebar + content — col-4 / col-8', spans: [4, 8] },
];

@Component({
  selector: 'egov-layout-grid',
  template: `
    <p class="note">
      A 12-column responsive grid: <code>{{ prefix() }}container</code> centres content,
      <code>{{ prefix() }}row</code> is the flex row, and <code>{{ prefix() }}col-{{ '{' }}1–12{{ '}' }}</code>
      spans columns. Responsive spans use <code>{{ prefix() }}col-{{ '{' }}bp{{ '}' }}-{{ '{' }}n{{ '}' }}</code>
      (e.g. <code>{{ prefix() }}col-md-6</code>). Click a column to copy its class.
    </p>

    <section class="group">
      <h3 class="group__title">Breakpoints</h3>
      <div class="table-wrap">
        <table class="spec">
          <thead>
            <tr>
              <th>Tier</th>
              <th>Min width</th>
              <th>Columns</th>
              <th>Gutter</th>
              <th>Container max</th>
            </tr>
          </thead>
          <tbody>
            @for (tier of tiers; track tier.name) {
              <tr>
                <td><code>{{ tier.name }}</code></td>
                <td>{{ tier.min }}</td>
                <td>{{ tier.columns }}</td>
                <td>{{ tier.gutter }}</td>
                <td>{{ tier.container }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    <section class="group">
      <h3 class="group__title">Column divisions</h3>
      @for (example of examples; track example.title) {
        <div class="example">
          <span class="example__label">{{ example.title }}</span>
          <div class="demo">
            <div [class]="rowClass()">
              @for (span of example.spans; track $index) {
                <div [class]="colClass(span)">
                  <button type="button" class="cell" [title]="'Copy ' + colClass(span)" (click)="copy(colClass(span))">
                    col-{{ span }}
                    <span class="copied" [class.show]="copied() === colClass(span)">✓</span>
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </section>

    <section class="group">
      <h3 class="group__title">Responsive spans</h3>
      <div class="example">
        <span class="example__label">
          <code>{{ responsiveClass() }}</code> — resize the canvas: 1-up on mobile, 2-up ≥ md, 4-up ≥ lg
        </span>
        <div class="demo">
          <div [class]="rowClass()">
            @for (i of [1, 2, 3, 4]; track i) {
              <div [class]="responsiveClass()">
                <button type="button" class="cell" [title]="'Copy ' + responsiveClass()" (click)="copy(responsiveClass())">
                  {{ i }}
                  <span class="copied" [class.show]="copied() === responsiveClass()">✓</span>
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </section>
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
    .table-wrap {
      overflow-x: auto;
    }
    .spec {
      border-collapse: collapse;
      font-size: 0.8rem;
      min-width: 480px;
    }
    .spec th,
    .spec td {
      text-align: left;
      padding: 0.5rem 0.9rem;
      border-bottom: 1px solid #ececec;
      white-space: nowrap;
    }
    .spec th {
      font-weight: 600;
      color: #383838;
    }
    .example {
      margin-bottom: 1.25rem;
    }
    .example__label {
      display: block;
      margin-bottom: 0.4rem;
      font-size: 0.75rem;
      color: #757575;
    }
    .demo {
      overflow: hidden;
      background: #f7f7f7;
      border-radius: 8px;
      padding: 0.5rem;
    }
    .cell {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 40px;
      border: none;
      border-radius: 6px;
      background: #d7e6ff;
      color: #0058d2;
      font: inherit;
      font-size: 0.75rem;
      cursor: pointer;
    }
    .cell:hover {
      background: #c2d8ff;
    }
    .copied {
      margin-left: 0.35rem;
      color: #0a7d34;
      opacity: 0;
      transition: opacity 0.15s;
    }
    .copied.show {
      opacity: 1;
    }
  `,
})
export class LayoutGridComponent {
  private readonly _document = inject(DOCUMENT);

  protected readonly tiers = TIERS;
  protected readonly examples = EXAMPLES;
  protected readonly prefix = signal('mud-');
  protected readonly copied = signal<string | null>(null);

  constructor() {
    afterNextRender(() => this.prefix.set(this._detectPrefix()));
  }

  protected rowClass(): string {
    return this.prefix() + 'row';
  }

  protected colClass(span: number): string {
    return `${this.prefix()}col-${span}`;
  }

  protected responsiveClass(): string {
    const p = this.prefix();

    return `${p}col-12 ${p}col-md-6 ${p}col-lg-3`;
  }

  protected copy(className: string): void {
    void navigator.clipboard?.writeText(className);
    this.copied.set(className);

    setTimeout(() => this.copied.update((current) => (current === className ? null : current)), 1200);
  }

  private _detectPrefix(): string {
    for (const sheet of Array.from(this._document.styleSheets)) {
      let rules: CSSRuleList;

      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }

      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSStyleRule && rule.selectorText === '.mud-row') {
          return 'mud-';
        }
      }
    }

    return '';
  }
}
