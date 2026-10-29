import { Component, signal } from '@angular/core';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudTextarea } from 'ngx-mud-ui/textarea';

@Component({
  selector: 'app-textarea-basic',
  imports: [MudTextarea, MudLabel, MudInlineMessage],
  template: `
    <mud-textarea
      [(value)]="message"
      [maxLength]="300"
      [rows]="5"
      [counterLabel]="message().length + ' din 300 de caractere'"
    >
      <mud-label>Mesaj</mud-label>
      <mud-inline-message hideIcon>Descrieți pe scurt problema.</mud-inline-message>
    </mud-textarea>
  `,
  styles: `
    :host {
      display: block;
      max-width: 480px;
    }
  `,
})
export class TextareaBasicExample {
  readonly message = signal('');
}
