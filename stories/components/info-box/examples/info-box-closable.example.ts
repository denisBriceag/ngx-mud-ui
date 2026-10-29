import type { ElementRef } from '@angular/core';
import { afterNextRender, Component, inject, Injector, signal, viewChild } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import { MudInfoBox } from 'ngx-mud-ui/info-box';

@Component({
  selector: 'app-info-box-closable',
  imports: [MudInfoBox, MudButton],
  template: `
    @if (visible()) {
      <mud-info-box variant="moderate" closable (closed)="close()">
        <p heading>New: sign with your phone</p>
        You can now sign documents with MSign from your phone.
      </mud-info-box>
    } @else {
      <button #showAgain type="button" mudButton="outlined" size="sm" (click)="visible.set(true)">
        Show the tip again
      </button>
    }
  `,
})
export class InfoBoxClosableExample {
  private readonly _injector = inject(Injector);
  private readonly _showAgain = viewChild<ElementRef<HTMLButtonElement>>('showAgain');

  readonly visible = signal(true);

  close(): void {
    this.visible.set(false);
    // The close button disappears with the box, so move focus somewhere sensible.
    afterNextRender(() => this._showAgain()?.nativeElement.focus(), { injector: this._injector });
  }
}
