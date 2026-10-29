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
  selector: 'app-submit-dialog',
  imports: [MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose, MudButton],
  template: `
    <h2 mudDialogTitle>Trimiteți cererea?</h2>
    <div mudDialogContent>Modificările sunt salvate. Puteți trimite cererea acum.</div>
    <div mudDialogActions>
      <button mudButton="outlined" [mudDialogClose]="false">Mai târziu</button>
      <button mudButton [mudDialogClose]="true">Trimite</button>
    </div>
  `,
})
export class SubmitDialog {}

@Component({
  selector: 'app-toast-over-dialog',
  imports: [MudButton],
  template: `<button type="button" mudButton (click)="saveAndSubmit()">Save and submit</button>`,
})
export class ToastOverDialogExample {
  private readonly _toast = inject(MudToast);
  private readonly _dialog = inject(MudDialog);

  saveAndSubmit(): void {
    // Nothing to configure: the toast stays above the dialog even though it opened first.
    const ref = this._toast.open({
      variant: 'success',
      data: { message: 'Modificările au fost salvate.' },
    });

    ref.opened.subscribe(() => this._dialog.open(SubmitDialog));
  }
}
