import type { TemplateRef } from '@angular/core';
import { Component, inject, viewChild } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import {
  MudDialog,
  MudDialogActions,
  MudDialogClose,
  MudDialogContent,
  MudDialogTitle,
} from 'ngx-mud-ui/dialog';

@Component({
  selector: 'app-dialog-template',
  imports: [MudButton, MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose],
  template: `
    <button type="button" mudButton="outlined" (click)="share()">Share report</button>

    <ng-template #shareDialog let-data>
      <h2 mudDialogTitle>Distribuiți raportul</h2>
      <div mudDialogContent>Linkul către „{{ data.report }}” a fost copiat.</div>
      <div mudDialogActions>
        <button mudButton [mudDialogClose]="undefined">Închide</button>
      </div>
    </ng-template>
  `,
})
export class DialogTemplateExample {
  private readonly _dialog = inject(MudDialog);
  private readonly _template = viewChild.required<TemplateRef<unknown>>('shareDialog');

  share(): void {
    this._dialog.open(this._template(), { data: { report: 'Raport T3 2026' } });
  }
}
