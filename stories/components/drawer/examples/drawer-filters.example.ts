import { Component, inject, signal } from '@angular/core';
import { MudButton, MudIconButton } from 'ngx-mud-ui/button';
import { MudCheckbox } from 'ngx-mud-ui/checkbox';
import {
  MUD_DRAWER_DATA,
  MudDrawer,
  MudDrawerClose,
  MudDrawerRef,
  MudDrawerTitle,
} from 'ngx-mud-ui/drawer';
import { MudIconComponent } from 'ngx-mud-ui/icons';

interface Filters {
  online: boolean;
  free: boolean;
}

// The icon is registered once in app.config.ts: provideMudIcons([crossLarge])
@Component({
  selector: 'app-filters-drawer',
  imports: [
    MudDrawerTitle,
    MudDrawerClose,
    MudButton,
    MudIconButton,
    MudIconComponent,
    MudCheckbox,
  ],
  template: `
    <header>
      <h2 mudDrawerTitle>Filtre</h2>
      <button mudIconButton mudDrawerClose aria-label="Închide">
        <mud-icon name="cross-large" [scale]="20" />
      </button>
    </header>
    <div class="body">
      <mud-checkbox [(checked)]="filters.online">Disponibil online</mud-checkbox>
      <mud-checkbox [(checked)]="filters.free">Gratuit</mud-checkbox>
    </div>
    <footer>
      <button mudButton (click)="apply()">Aplică</button>
    </footer>
  `,
  styles: `
    :host {
      display: contents;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 24px 0;
    }
    h2 {
      margin: 0;
      font-size: 20px;
    }
    .body {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 24px;
    }
    footer {
      padding: 0 24px 24px;
    }
  `,
})
export class FiltersDrawer {
  private readonly _ref = inject<MudDrawerRef<Filters>>(MudDrawerRef);

  readonly filters: Filters = { ...inject<Filters>(MUD_DRAWER_DATA) };

  apply(): void {
    this._ref.close(this.filters);
  }
}

@Component({
  selector: 'app-drawer-filters',
  imports: [MudButton],
  template: `
    <button type="button" mudButton="outlined" (click)="openFilters()">Filtre</button>
    <p>Online: {{ filters().online ? 'yes' : 'no' }} · Free: {{ filters().free ? 'yes' : 'no' }}</p>
  `,
  styles: `
    p {
      margin: 16px 0 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class DrawerFiltersExample {
  private readonly _drawer = inject(MudDrawer);

  readonly filters = signal<Filters>({ online: true, free: false });

  openFilters(): void {
    const ref = this._drawer.open<Filters, Filters>(FiltersDrawer, { data: this.filters() });

    ref.closed.subscribe(({ result }) => {
      if (result) this.filters.set(result);
    });
  }
}
