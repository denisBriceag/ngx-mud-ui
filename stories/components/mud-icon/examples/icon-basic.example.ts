import { Component } from '@angular/core';
import type { MudIconScale } from 'ngx-mud-ui/icons';
import { MudIconComponent } from 'ngx-mud-ui/icons';

// The icons are registered once in app.config.ts: provideMudIcons([alarm, homeLine])
@Component({
  selector: 'app-icon-basic',
  imports: [MudIconComponent],
  template: `
    <div class="row">
      @for (scale of scales; track scale) {
        <figure>
          <mud-icon name="alarm" [scale]="scale" />
          <figcaption>{{ scale }}</figcaption>
        </figure>
      }
    </div>
    <div class="row">
      <figure>
        <mud-icon name="home-line" />
        <figcaption>outlined</figcaption>
      </figure>
      <figure>
        <mud-icon name="home-line" variant="filled" />
        <figcaption>filled</figcaption>
      </figure>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .row {
      display: flex;
      align-items: flex-end;
      gap: 32px;
    }
    figure {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      margin: 0;
    }
    figcaption {
      font-size: 12px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class IconBasicExample {
  readonly scales: MudIconScale[] = [12, 16, 20, 24, 32];
}
