import { afterNextRender, Component, DOCUMENT, inject, signal } from '@angular/core';

interface Elevation {
  name: string;
  value: string;
  classes: string[];
}

const ALIASES: Record<string, string> = {
  '100': 'xs',
  '200': 'sm',
  '300': 'md',
  '400': 'lg',
  '500': 'xl',
};

@Component({
  selector: 'egov-shadow-grid',
  template: `
    <div class="grid">
      @for (elevation of elevations(); track elevation.name) {
        <div class="cell">
          <div class="preview">
            <span class="card" [style.boxShadow]="'var(' + elevation.name + ')'"></span>
          </div>

          <button
            type="button"
            class="chip"
            [title]="'Copy var(' + elevation.name + ')'"
            (click)="copyText('var(' + elevation.name + ')', elevation.name)"
          >
            <code>{{ elevation.name }}</code>
            <span class="chip__ok" [class.show]="copied() === elevation.name">✓</span>
          </button>

          @for (className of elevation.classes; track className) {
            <button
              type="button"
              class="chip chip--class"
              [title]="'Copy class ' + className"
              (click)="copyText(className, className)"
            >
              <code>.{{ className }}</code>
              <span class="chip__ok" [class.show]="copied() === className">✓</span>
            </button>
          }
        </div>
      }
    </div>

    @if (elevations().length === 0) {
      <p class="empty">No elevation tokens found in the loaded stylesheet.</p>
    }
  `,
  styles: `
    :host {
      display: block;
      padding: 1.5rem 2rem;
      font-family: system-ui, sans-serif;
      color: #121212;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
    .cell {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      border: 1px solid #ececec;
      border-radius: 10px;
      background: #fff;
      padding: 0.75rem;
    }
    .preview {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 0.35rem;
    }
    .card {
      width: 72px;
      height: 48px;
      background: #fff;
      border-radius: 8px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      text-align: left;
      border: 1px solid #ececec;
      border-radius: 6px;
      background: #fafafa;
      padding: 0.3rem 0.5rem;
      font: inherit;
      cursor: pointer;
    }
    .chip:hover {
      border-color: #cfcfcf;
    }
    .chip code {
      font-family: ui-monospace, monospace;
      font-size: 0.74rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .chip--class {
      background: #f2f6ff;
    }
    .chip__ok {
      color: #0a7d34;
      font-size: 0.72rem;
      opacity: 0;
      transition: opacity 0.15s;
    }
    .chip__ok.show {
      opacity: 1;
    }
    .empty {
      color: #757575;
    }
  `,
})
export class ShadowGridComponent {
  private readonly _document = inject(DOCUMENT);

  protected readonly elevations = signal<Elevation[]>([]);
  protected readonly copied = signal<string | null>(null);

  constructor() {
    afterNextRender(() => this._load());
  }

  protected copyText(text: string, key: string): void {
    void navigator.clipboard?.writeText(text);
    this.copied.set(key);

    setTimeout(() => this.copied.update((current) => (current === key ? null : current)), 1200);
  }

  private _load(): void {
    const styles = getComputedStyle(this._document.documentElement);
    const { tokenNames, classNames } = this._scan();
    const prefix = this._detectPrefix(classNames);

    const elevations = tokenNames
      .map((name) => {
        const key = name.slice('--drop-shadow-'.length);
        const candidates = [`${prefix}shadow-${key}`, ALIASES[key] ? `${prefix}shadow-${ALIASES[key]}` : ''];

        return {
          name,
          value: styles.getPropertyValue(name).trim(),
          classes: candidates.filter((className) => className && classNames.has(className)),
        };
      })
      .sort((a, b) => parseInt(a.name.slice('--drop-shadow-'.length), 10) - parseInt(b.name.slice('--drop-shadow-'.length), 10));

    this.elevations.set(elevations);
  }

  private _scan(): { tokenNames: string[]; classNames: Set<string> } {
    const tokenNames = new Set<string>();
    const classNames = new Set<string>();
    const singleClass = /^\.[a-z0-9-]+$/;

    for (const sheet of Array.from(this._document.styleSheets)) {
      let rules: CSSRuleList;

      try {
        rules = sheet.cssRules;
      } catch {
        continue; // cross-origin sheet — skip
      }

      for (const rule of Array.from(rules)) {
        if (!(rule instanceof CSSStyleRule)) {
          continue;
        }

        if (rule.selectorText === ':root') {
          for (const name of Array.from(rule.style)) {
            if (name.startsWith('--drop-shadow-')) {
              tokenNames.add(name);
            }
          }
        } else if (singleClass.test(rule.selectorText)) {
          classNames.add(rule.selectorText.slice(1));
        }
      }
    }

    return { tokenNames: [...tokenNames], classNames };
  }

  private _detectPrefix(classNames: Set<string>): string {
    for (const className of classNames) {
      const match = className.match(/^(.*?)shadow-\d/);

      if (match) {
        return match[1];
      }
    }

    return 'mud-';
  }
}
