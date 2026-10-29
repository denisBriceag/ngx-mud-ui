import { Component, inject } from '@angular/core';
import { MudButton, MudIconButton } from 'ngx-mud-ui/button';
import { MudDrawer, MudDrawerClose, MudDrawerTitle } from 'ngx-mud-ui/drawer';
import { MudIconComponent } from 'ngx-mud-ui/icons';

// The icon is registered once in app.config.ts: provideMudIcons([crossLarge])
@Component({
  selector: 'app-terms-drawer',
  imports: [MudDrawerTitle, MudDrawerClose, MudButton, MudIconButton, MudIconComponent],
  template: `
    <header>
      <h2 mudDrawerTitle>Termeni și condiții</h2>
      <button mudIconButton mudDrawerClose aria-label="Închide">
        <mud-icon name="cross-large" [scale]="20" />
      </button>
    </header>
    <!-- Focusable and named, so keyboard users can scroll text that has no controls in it. -->
    <div class="body" tabindex="0" role="region" aria-label="Textul termenilor">
      @for (article of articles; track article) {
        <p>
          {{ article }}. Datele cu caracter personal sunt prelucrate exclusiv pentru prestarea
          serviciului solicitat și nu sunt transmise terților în scopuri comerciale.
        </p>
      }
    </div>
    <footer>
      <button mudButton="outlined" [mudDrawerClose]="false">Refuz</button>
      <button mudButton [mudDrawerClose]="true">Accept</button>
    </footer>
  `,
  styles: `
    /* The drawer lays out its children in a column: header and footer keep their height, the body scrolls. */
    :host {
      display: contents;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 24px 16px;
    }
    h2 {
      margin: 0;
      font-size: 20px;
    }
    .body {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      padding: 0 24px;
    }
    .body:focus-visible {
      outline: 3px solid var(--mud-focus-ring-outer-color);
      outline-offset: -3px;
    }
    footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 16px 24px 24px;
    }
  `,
})
export class TermsDrawer {
  readonly articles = Array.from({ length: 20 }, (_, i) => `Articolul ${i + 1}`);
}

@Component({
  selector: 'app-drawer-scrolling',
  imports: [MudButton],
  template: `<button type="button" mudButton="outlined" (click)="open()">Read the terms</button>`,
})
export class DrawerScrollingExample {
  private readonly _drawer = inject(MudDrawer);

  open(): void {
    this._drawer.open(TermsDrawer);
  }
}
