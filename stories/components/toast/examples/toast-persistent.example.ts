import { Component, inject } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import { MudToast } from 'ngx-mud-ui/toast';

@Component({
  selector: 'app-toast-persistent',
  imports: [MudButton],
  template: `<button type="button" mudButton="outlined" (click)="upload()">
    Upload document
  </button>`,
})
export class ToastPersistentExample {
  private readonly _toast = inject(MudToast);

  upload(): void {
    // duration: 0 keeps the toast until you dismiss it.
    const progress = this._toast.open({
      duration: 0,
      showCloseButton: false,
      data: { message: 'Se încarcă documentul…' },
    });

    setTimeout(() => {
      progress.dismiss();
      this._toast.open({ variant: 'success', data: { message: 'Documentul a fost încărcat.' } });
    }, 2500);
  }
}
