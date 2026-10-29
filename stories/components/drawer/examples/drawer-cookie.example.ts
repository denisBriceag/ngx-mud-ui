import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import { MudDrawer, MudDrawerClose } from 'ngx-mud-ui/drawer';

type Consent = 'all' | 'necessary';

@Component({
  selector: 'app-cookie-drawer',
  imports: [MudButton, MudDrawerClose],
  template: `
    <p>Folosim cookie-uri pentru a îmbunătăți experiența pe platformă.</p>
    <div class="actions">
      <button mudButton="outlined" [mudDrawerClose]="'necessary'">Doar necesare</button>
      <button mudButton [mudDrawerClose]="'all'">Accept toate</button>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px 24px;
      padding: 24px;
    }
    p {
      flex: 1 1 320px;
      margin: 0;
    }
    .actions {
      display: flex;
      gap: 8px;
    }
  `,
})
export class CookieDrawer {}

@Component({
  selector: 'app-drawer-cookie',
  imports: [MudButton],
  template: `
    <button type="button" mudButton="outlined" (click)="ask()">Show the cookie banner</button>
    <p>Consent: {{ consent() ?? 'not given' }}</p>
  `,
  // The drawer renders outside this component, so the panelClass rule must be global.
  styles: `
    .cookie-drawer .drawer {
      --mud-drawer-radius: 16px;
    }
    app-drawer-cookie p {
      margin: 16px 0 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
  encapsulation: ViewEncapsulation.None,
})
export class DrawerCookieExample {
  private readonly _drawer = inject(MudDrawer);

  readonly consent = signal<Consent | null>(null);

  ask(): void {
    const ref = this._drawer.open<Consent>(CookieDrawer, {
      position: 'bottom',
      // The user must choose: only the two buttons close it.
      closeOnBackdrop: false,
      closeOnEscape: false,
      ariaLabel: 'Consimțământ cookie-uri',
      panelClass: 'cookie-drawer',
    });

    ref.closed.subscribe(({ result }) => this.consent.set(result ?? null));
  }
}
