import { Component } from '@angular/core';
import { MudFileInput } from 'ngx-mud-ui/file-input';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';

@Component({
  selector: 'app-file-input-variants',
  imports: [MudFileInput, MudLabel, MudInlineMessage],
  template: `
    <mud-file-input variant="button" accept=".pdf">
      <mud-label>Buton (button)</mud-label>
    </mud-file-input>
    <mud-file-input size="lg" accept="image/*">
      <mud-label>Zonă mare (lg)</mud-label>
    </mud-file-input>
    <mud-file-input required invalid>
      <mud-label>Obligatoriu, cu eroare</mud-label>
      <mud-inline-message variant="error">Încărcați cel puțin un document.</mud-inline-message>
    </mud-file-input>
    <mud-file-input disabled>
      <mud-label>Dezactivat</mud-label>
    </mud-file-input>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 520px;
    }
  `,
})
export class FileInputVariantsExample {}
