import { Component, signal } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';

@Component({
  selector: 'app-button-loading',
  imports: [MudButton],
  template: `
    <button type="button" mudButton [loading]="sending()" (click)="send()">Send application</button>
  `,
})
export class ButtonLoadingExample {
  readonly sending = signal(false);

  send(): void {
    this.sending.set(true);
    setTimeout(() => this.sending.set(false), 2000);
  }
}
