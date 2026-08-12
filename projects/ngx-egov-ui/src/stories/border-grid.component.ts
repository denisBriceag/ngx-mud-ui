import { afterNextRender, Component, DOCUMENT, inject, signal } from '@angular/core';

type BorderKind = 'radius' | 'width' | 'style';

interface BorderToken {
  name: string;
  value: string;
  className?: string;
}

interface BorderSection {
  title: string;
  kind: BorderKind;
  tokens: BorderToken[];
}

const SECTIONS: { title: string; kind: BorderKind; tokenPrefix: string; classStem: string }[] = [
  { title: 'Radius', kind: 'radius', tokenPrefix: '--border-radius-', classStem: 'radius-' },
  { title: 'Width', kind: 'width', tokenPrefix: '--border-width-', classStem: 'border-' },
  { title: 'Style', kind: 'style', tokenPrefix: '--border-style-', classStem: 'border-style-' },
];

@Component({
  selector: 'egov-border-grid',
  template: `
    @for (section of sections(); track section.title) {
      <section class="group">
        <h3 class="group__title">{{ section.title }}</h3>
        <div class="grid">
          @for (token of section.tokens; track token.name) {
            <div class="cell">
              @switch (section.kind) {
                @case ('radius') {
                  <span class="box box--fill" [style.borderRadius]="'var(' + token.name + ')'"></span>
                }
                @case ('width') {
                  <span class="box box--outline" [style.borderWidth]="'var(' + token.name + ')'"></span>
                }
                @case ('style') {
                  <span class="box box--outline box--thick" [style.borderStyle]="'var(' + token.name + ')'"></span>
                }
              }
              <span class="value">{{ token.value }}</span>

              <button
                type="button"
                class="chip"
                [title]="'Copy var(' + token.name + ')'"
                (click)="copyText('var(' + token.name + ')', token.name)"
              >
                <code>{{ token.name }}</code>
                <span class="chip__ok" [class.show]="copied() === token.name">✓</span>
              </button>

              @if (token.className) {
                <button
                  type="button"
                  class="chip chip--class"
                  [title]="'Copy class ' + token.className"
                  (click)="copyText(token.className!, token.className!)"
                >
                  <code>.{{ token.className }}</code>
                  <span class="chip__ok" [class.show]="copied() === token.className">✓</span>
                </button>
              }
            </div>
          }
        </div>
      </section>
    }

    @if (sections().length === 0) {
      <p class="empty">No border tokens found in the loaded stylesheet.</p>
    }
  `,
  styles: `
    :host {
      display: block;
      padding: 1.5rem 2rem;
      font-family: system-ui, sans-serif;
      color: #121212;
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
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 0.75rem;
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
    .box {
      width: 100%;
      height: 44px;
      box-sizing: border-box;
    }
    .box--fill {
      background: #d7e6ff;
    }
    .box--outline {
      border-style: solid;
      border-color: #121212;
    }
    .box--thick {
      border-width: 3px;
    }
    .value {
      font-size: 0.72rem;
      color: #757575;
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
export class BorderGridComponent {
  private readonly _document = inject(DOCUMENT);

  protected readonly sections = signal<BorderSection[]>([]);
  protected readonly copied = signal<string | null>(null);

  constructor() {
    afterNextRender(() => this.load());
  }

  protected copyText(text: string, key: string): void {
    void navigator.clipboard?.writeText(text);
    this.copied.set(key);

    setTimeout(() => this.copied.update((current) => (current === key ? null : current)), 1200);
  }

  private load(): void {
    const styles = getComputedStyle(this._document.documentElement);
    const { tokenNames, classNames } = this.scan();
    const prefix = this.detectPrefix(classNames);

    const sections = SECTIONS.map(({ title, kind, tokenPrefix, classStem }) => {
      const tokens = tokenNames
        .filter((name) => name.startsWith(tokenPrefix))
        .map((name) => {
          const key = name.slice(tokenPrefix.length);
          const className = `${prefix}${classStem}${key}`;

          return {
            name,
            value: styles.getPropertyValue(name).trim(),
            className: classNames.has(className) ? className : undefined,
          };
        });

      if (kind !== 'style') {
        tokens.sort((a, b) => parseFloat(a.value) - parseFloat(b.value));
      }

      return { title, kind, tokens };
    }).filter((section) => section.tokens.length > 0);

    this.sections.set(sections);
  }

  private scan(): { tokenNames: string[]; classNames: Set<string> } {
    const tokenNames = new Set<string>();
    const classNames = new Set<string>();
    const wantedToken = /^--border-(radius|width|style)-.+/;
    const singleClass = /^\.[a-z0-9-]+$/;

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

        if (rule.selectorText === ':root') {
          for (const name of Array.from(rule.style)) {
            if (wantedToken.test(name)) {
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

  private detectPrefix(classNames: Set<string>): string {
    for (const className of classNames) {
      const match = className.match(/^(.*?)radius-\d/);

      if (match) {
        return match[1];
      }
    }

    return 'mud-';
  }
}
