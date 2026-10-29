import { Component, inject } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import {
  MudDialog,
  MudDialogActions,
  MudDialogClose,
  MudDialogContent,
  MudDialogImage,
  MudDialogTitle,
} from 'ngx-mud-ui/dialog';

@Component({
  selector: 'app-welcome-dialog',
  imports: [
    MudDialogImage,
    MudDialogTitle,
    MudDialogContent,
    MudDialogActions,
    MudDialogClose,
    MudButton,
  ],
  template: `
    <img mudDialogImage src="images/hero.svg" alt="" />
    <h2 mudDialogTitle>Bine ați venit în noul portal</h2>
    <div mudDialogContent>Toate serviciile publice sunt acum într-un singur loc.</div>
    <div mudDialogActions layout="stacked">
      <button mudButton="outlined" [mudDialogClose]="false">Mai târziu</button>
      <button mudButton [mudDialogClose]="true">Începe turul</button>
    </div>
  `,
  styles: `
    /* Height is yours to set: 280px on desktop, 180px on phones. */
    img {
      height: 280px;
    }
    @media (max-width: 767.98px) {
      img {
        height: 180px;
      }
    }
  `,
})
export class WelcomeDialog {}

@Component({
  selector: 'app-dialog-image',
  imports: [MudButton],
  template: `<button type="button" mudButton (click)="open()">Open welcome dialog</button>`,
})
export class DialogImageExample {
  private readonly _dialog = inject(MudDialog);

  open(): void {
    this._dialog.open(WelcomeDialog);
  }
}
