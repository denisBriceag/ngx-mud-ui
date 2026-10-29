import { Component } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';

@Component({
  selector: 'app-button-platform',
  imports: [MudButton],
  template: `
    @for (platform of platforms; track platform.code) {
      <div class="row">
        @for (style of styles; track style) {
          <button
            type="button"
            mudButton
            [class]="'btn-badge btn-badge--' + style + ' btn-badge--' + platform.code"
          >
            <span class="btn-badge__logo" aria-hidden="true"
              ><img [src]="'logos/m-platforms/' + platform.logo + '.svg'" alt=""
            /></span>
            <span class="btn-badge__label">{{ platform.label }}</span>
          </button>
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
  `,
})
export class ButtonPlatformExample {
  readonly styles = ['primary', 'neutral'] as const;
  readonly platforms = [
    { code: 'mpay', logo: 'm-pay', label: 'Plătește cu mpay' },
    { code: 'mpass', logo: 'm-pass', label: 'Autentifică-te prin mpass' },
    { code: 'msign', logo: 'm-sign', label: 'Semnează prin msign' },
    { code: 'mpower', logo: 'm-power', label: 'Împuternicește cu mpower' },
    { code: 'mdelivery', logo: 'm-delivery', label: 'Livrează prin mdelivery' },
  ];
}
