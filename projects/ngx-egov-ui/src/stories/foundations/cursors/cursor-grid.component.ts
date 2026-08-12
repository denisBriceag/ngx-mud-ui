import { Component, signal } from '@angular/core';

interface CursorGroup {
  title: string;
  cursors: string[];
}

const CURSOR_GROUPS: CursorGroup[] = [
  { title: 'General', cursors: ['auto', 'default', 'pointer', 'context-menu', 'help', 'progress', 'wait', 'none'] },
  {
    title: 'Selection & action',
    cursors: ['text', 'vertical-text', 'cell', 'crosshair', 'copy', 'alias', 'move', 'no-drop', 'not-allowed', 'grab', 'grabbing', 'all-scroll'],
  },
  { title: 'Zoom', cursors: ['zoom-in', 'zoom-out'] },
  {
    title: 'Resize',
    cursors: ['col-resize', 'row-resize', 'n-resize', 'e-resize', 's-resize', 'w-resize', 'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize'],
  },
];

@Component({
  selector: 'egov-cursor-grid',
  template: `
    <p class="note">
      Native CSS cursors — <strong>hover</strong> a cell to preview, <strong>click</strong> to copy
      <code>cursor: …;</code>. The design system has no cursor tokens/classes; this is a reference.
    </p>

    @for (group of groups; track group.title) {
      <section class="group">
        <h3 class="group__title">{{ group.title }}</h3>
        <div class="grid">
          @for (cursor of group.cursors; track cursor) {
            <button
              type="button"
              class="cell"
              [style.cursor]="cursor"
              [title]="'Copy cursor: ' + cursor + ';'"
              (click)="copy(cursor)"
            >
              <span class="cell__label">{{ cursor }}</span>
              <span class="copied" [class.show]="copied() === cursor">copied ✓</span>
            </button>
          }
        </div>
      </section>
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
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 0.75rem;
    }
    .cell {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      position: relative;
      min-height: 60px;
      text-align: left;
      border: 1px solid #ececec;
      border-radius: 10px;
      background: #fafafa;
      padding: 0.75rem;
      font: inherit;
    }
    .cell:hover {
      border-color: #cfcfcf;
      background: #f2f6ff;
    }
    .cell__label {
      font-family: ui-monospace, monospace;
      font-size: 0.78rem;
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
  `,
})
export class CursorGridComponent {
  protected readonly groups = CURSOR_GROUPS;
  protected readonly copied = signal<string | null>(null);

  protected copy(cursor: string): void {
    void navigator.clipboard?.writeText(`cursor: ${cursor};`);
    this.copied.set(cursor);

    setTimeout(() => this.copied.update((current) => (current === cursor ? null : current)), 1200);
  }
}
