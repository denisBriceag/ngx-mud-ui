import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MudButton } from 'ngx-mud-ui/button';
import {
  MUD_DIALOG_DATA,
  MudDialog,
  MudDialogActions,
  MudDialogClose,
  MudDialogContent,
  MudDialogRef,
  MudDialogTitle,
} from 'ngx-mud-ui/dialog';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudTextInput } from 'ngx-mud-ui/text-input';

interface RenameData {
  name: string;
}

@Component({
  selector: 'app-rename-dialog',
  imports: [
    FormsModule,
    MudDialogTitle,
    MudDialogContent,
    MudDialogActions,
    MudDialogClose,
    MudButton,
    MudTextInput,
    MudLabel,
  ],
  template: `
    <form (ngSubmit)="save()">
      <h2 mudDialogTitle>Redenumiți documentul</h2>
      <div mudDialogContent>
        <mud-text-input [(value)]="name" required>
          <mud-label>Denumire</mud-label>
        </mud-text-input>
      </div>
      <div mudDialogActions>
        <button mudButton="outlined" [mudDialogClose]="undefined">Anulează</button>
        <button mudButton type="submit">Salvează</button>
      </div>
    </form>
  `,
})
export class RenameDialog {
  private readonly _ref = inject<MudDialogRef<string>>(MudDialogRef);

  name = inject<RenameData>(MUD_DIALOG_DATA).name;

  save(): void {
    if (this.name.trim()) this._ref.close(this.name.trim());
  }
}

@Component({
  selector: 'app-dialog-data',
  imports: [MudButton],
  template: `
    <p>
      Document: <strong>{{ name() }}</strong>
    </p>
    <button type="button" mudButton="outlined" (click)="rename()">Rename</button>
  `,
  styles: `
    p {
      margin: 0 0 16px;
    }
  `,
})
export class DialogDataExample {
  private readonly _dialog = inject(MudDialog);

  readonly name = signal('cerere.pdf');

  rename(): void {
    const ref = this._dialog.open<string, RenameData>(RenameDialog, {
      data: { name: this.name() },
      // A stray click outside shouldn't discard what was typed.
      closeOnBackdrop: false,
    });

    ref.closed.subscribe(({ result }) => {
      if (result !== undefined) this.name.set(result);
    });
  }
}
