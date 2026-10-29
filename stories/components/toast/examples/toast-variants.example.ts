import { Component, inject } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import type { MudToastVariant } from 'ngx-mud-ui/toast';
import { MudToast } from 'ngx-mud-ui/toast';

@Component({
  selector: 'app-toast-variants',
  imports: [MudButton],
  template: `
    @for (variant of variants; track variant.name) {
      <button type="button" mudButton="outlined" (click)="show(variant.name, variant.title)">
        {{ variant.name }}
      </button>
    }
    <button type="button" mudButton="text" (click)="showShort()">Without a title</button>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  `,
})
export class ToastVariantsExample {
  private readonly _toast = inject(MudToast);

  readonly variants: { name: MudToastVariant; title: string }[] = [
    { name: 'info', title: 'Cerere în lucru' },
    { name: 'success', title: 'Cerere trimisă' },
    { name: 'warning', title: 'Sesiunea expiră curând' },
    { name: 'error', title: 'Plata a eșuat' },
  ];

  show(variant: MudToastVariant, title: string): void {
    this._toast.open({ variant, data: { title, message: 'Veți primi un e-mail cu detalii.' } });
  }

  showShort(): void {
    this._toast.open({ variant: 'success', data: { message: 'Modificările au fost salvate.' } });
  }
}
