import { Component, inject } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import {
  MudDialog,
  MudDialogActions,
  MudDialogClose,
  MudDialogContent,
  MudDialogTitle,
} from 'ngx-mud-ui/dialog';
import { MudToast } from 'ngx-mud-ui/toast';

@Component({
  selector: 'app-submit-request-dialog',
  imports: [MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose, MudButton],
  template: `
    <h2 mudDialogTitle>Trimiteți cererea?</h2>
    <div mudDialogContent>După trimitere, cererea nu mai poate fi modificată.</div>
    <div mudDialogActions>
      <button mudButton="outlined" [mudDialogClose]="false">Anulează</button>
      <button mudButton [mudDialogClose]="true">Trimite</button>
    </div>
  `,
})
export class SubmitRequestDialog {}

@Component({
  selector: 'app-toast-dialog',
  imports: [MudButton],
  template: `<button type="button" mudButton (click)="submit()">Trimite cererea</button>`,
})
export class ToastDialogExample {
  private readonly _toast = inject(MudToast);
  private readonly _dialog = inject(MudDialog);

  submit(): void {
    this._dialog.open<boolean>(SubmitRequestDialog).closed.subscribe(({ result }) => {
      if (!result) return;

      this._toast.open({
        variant: 'success',
        data: { message: 'Cererea a fost trimisă.' },
      });
    });
  }
}
