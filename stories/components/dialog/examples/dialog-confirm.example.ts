import { Component, inject, signal } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import {
  MudDialog,
  MudDialogActions,
  MudDialogClose,
  MudDialogContent,
  MudDialogTitle,
} from 'ngx-mud-ui/dialog';

@Component({
  selector: 'app-delete-dialog',
  imports: [MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose, MudButton],
  template: `
    <h2 mudDialogTitle>Ștergeți documentul?</h2>
    <div mudDialogContent>
      Documentul „cerere.pdf” va fi șters definitiv. Acțiunea nu poate fi anulată.
    </div>
    <div mudDialogActions>
      <button mudButton="outlined" [mudDialogClose]="false">Anulează</button>
      <button mudButton color="destructive" [mudDialogClose]="true">Șterge</button>
    </div>
  `,
})
export class DeleteDialog {}

@Component({
  selector: 'app-dialog-confirm',
  imports: [MudButton],
  template: `
    <button type="button" mudButton color="destructive" (click)="confirmDelete()">
      Delete document
    </button>
    <p>Last result: {{ outcome() }}</p>
  `,
  styles: `
    p {
      margin: 16px 0 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class DialogConfirmExample {
  private readonly _dialog = inject(MudDialog);

  readonly outcome = signal('—');

  confirmDelete(): void {
    const ref = this._dialog.open<boolean>(DeleteDialog, { size: 'sm' });

    ref.closed.subscribe(({ result, reason }) => {
      this.outcome.set(result ? 'deleted' : `kept (closed by ${reason})`);
    });
  }
}
