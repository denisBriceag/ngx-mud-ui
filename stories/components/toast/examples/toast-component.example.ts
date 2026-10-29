import type { TemplateRef } from '@angular/core';
import { Component, inject, viewChild } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import { MudIconComponent } from 'ngx-mud-ui/icons';
import { MUD_TOAST_DATA, MudToast } from 'ngx-mud-ui/toast';

@Component({
  selector: 'app-signature-toast',
  template: `
    <strong>Semnătură aplicată</strong>
    <p>{{ data.document }} a fost semnat la {{ data.time }}.</p>
  `,
  styles: `
    p {
      margin: 4px 0 0;
    }
  `,
})
export class SignatureToast {
  readonly data = inject<{ document: string; time: string }>(MUD_TOAST_DATA);
}

// The icon is registered once in app.config.ts: provideMudIcons([signature])
@Component({
  selector: 'app-toast-component',
  imports: [MudButton, MudIconComponent],
  template: `
    <button type="button" mudButton="outlined" (click)="fromComponent()">
      Toast from a component
    </button>
    <button type="button" mudButton="outlined" (click)="withIcon()">Custom icon</button>

    <ng-template #signatureIcon><mud-icon name="signature" /></ng-template>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  `,
})
export class ToastComponentExample {
  private readonly _toast = inject(MudToast);
  private readonly _signatureIcon = viewChild.required<TemplateRef<unknown>>('signatureIcon');

  fromComponent(): void {
    this._toast.openFromComponent(SignatureToast, {
      variant: 'success',
      data: { document: 'cerere.pdf', time: '14:32' },
    });
  }

  withIcon(): void {
    this._toast.open({
      data: {
        message: 'Documentul așteaptă semnătura dumneavoastră.',
        icon: this._signatureIcon(),
      },
    });
  }
}
