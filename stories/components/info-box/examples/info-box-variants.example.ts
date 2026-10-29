import { Component } from '@angular/core';
import type { MudInfoBoxVariant } from 'ngx-mud-ui/info-box';
import { MudInfoBox } from 'ngx-mud-ui/info-box';

@Component({
  selector: 'app-info-box-variants',
  imports: [MudInfoBox],
  template: `
    @for (variant of variants; track variant) {
      <div class="pair">
        <mud-info-box [variant]="variant">
          <p heading>{{ variant }}, subtle</p>
          You will need your IDNP and a valid email address.
        </mud-info-box>
        <mud-info-box [variant]="variant" emphasis="strong">
          <p heading>{{ variant }}, strong</p>
          You will need your IDNP and a valid email address.
        </mud-info-box>
      </div>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .pair {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }
  `,
})
export class InfoBoxVariantsExample {
  readonly variants: MudInfoBoxVariant[] = ['neutral', 'moderate', 'warning', 'error'];
}
