import { Component, inject } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import type { MudDialogSize } from 'ngx-mud-ui/dialog';
import {
  MUD_DIALOG_DATA,
  MudDialog,
  MudDialogActions,
  MudDialogClose,
  MudDialogContent,
  MudDialogTitle,
} from 'ngx-mud-ui/dialog';

@Component({
  selector: 'app-size-dialog',
  imports: [MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose, MudButton],
  template: `
    <h2 mudDialogTitle>Size “{{ size }}”</h2>
    <div mudDialogContent>On phones every dialog is at most 350px wide.</div>
    <div mudDialogActions>
      <button mudButton [mudDialogClose]="undefined">OK</button>
    </div>
  `,
})
export class SizeDialog {
  readonly size = inject<MudDialogSize>(MUD_DIALOG_DATA);
}

@Component({
  selector: 'app-dialog-sizes',
  imports: [MudButton],
  template: `
    @for (size of sizes; track size) {
      <button type="button" mudButton="outlined" (click)="open(size)">{{ size }}</button>
    }
  `,
  styles: `
    :host {
      display: flex;
      gap: 12px;
    }
  `,
})
export class DialogSizesExample {
  private readonly _dialog = inject(MudDialog);

  readonly sizes: MudDialogSize[] = ['sm', 'md', 'lg'];

  open(size: MudDialogSize): void {
    this._dialog.open(SizeDialog, { size, data: size });
  }
}
