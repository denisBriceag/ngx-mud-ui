import { Component, inject } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import {
  MudDialog,
  MudDialogActions,
  MudDialogClose,
  MudDialogContent,
  MudDialogTitle,
} from 'ngx-mud-ui/dialog';

@Component({
  selector: 'app-terms-dialog',
  imports: [MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose, MudButton],
  template: `
    <h2 mudDialogTitle>
      Termeni și condiții de utilizare a serviciilor electronice guvernamentale
    </h2>
    <div mudDialogContent>
      @for (section of sections; track section) {
        <p>
          {{ section }}. Utilizatorul se obligă să furnizeze date corecte și complete. Prestatorul
          prelucrează datele cu caracter personal în conformitate cu legislația în vigoare și le
          folosește exclusiv pentru prestarea serviciului solicitat.
        </p>
      }
    </div>
    <div mudDialogActions>
      <button mudButton="outlined" [mudDialogClose]="false">Refuz</button>
      <button mudButton [mudDialogClose]="true">Accept</button>
    </div>
  `,
})
export class TermsDialog {
  readonly sections = Array.from({ length: 12 }, (_, i) => `Articolul ${i + 1}`);
}

@Component({
  selector: 'app-dialog-long-content',
  imports: [MudButton],
  template: `<button type="button" mudButton="outlined" (click)="open()">Read the terms</button>`,
})
export class DialogLongContentExample {
  private readonly _dialog = inject(MudDialog);

  open(): void {
    this._dialog.open(TermsDialog, { autoFocus: 'first-heading' });
  }
}
