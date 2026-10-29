import { Component } from '@angular/core';
import { MudTab, MudTabGroup } from 'ngx-mud-ui/tabs';

@Component({
  selector: 'app-tabs-sizes',
  imports: [MudTabGroup, MudTab],
  template: `
    <mud-tab-group stretchTabs aria-label="Stretched tabs">
      <mud-tab label="Persoane fizice"><p>Servicii pentru cetățeni.</p></mud-tab>
      <mud-tab label="Persoane juridice"><p>Servicii pentru companii.</p></mud-tab>
    </mud-tab-group>

    <mud-tab-group size="sm" aria-label="Small tabs">
      <mud-tab label="Toate"><p>Toate cererile.</p></mud-tab>
      <mud-tab label="Active"><p>Cereri active.</p></mud-tab>
      <mud-tab label="Arhivate"><p>Cereri arhivate.</p></mud-tab>
    </mud-tab-group>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    p {
      margin: 16px 0 0;
    }
  `,
})
export class TabsSizesExample {}
