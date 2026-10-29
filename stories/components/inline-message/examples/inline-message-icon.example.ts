import { Component } from '@angular/core';
import { MudIconComponent } from 'ngx-mud-ui/icons';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';

// The icon is registered once in app.config.ts: provideMudIcons([sparkles])
@Component({
  selector: 'app-inline-message-icon',
  imports: [MudInlineMessage, MudIconComponent],
  template: `
    <mud-inline-message>
      <mud-icon name="sparkles" [scale]="20" />
      Completat automat din registrul de stat.
    </mud-inline-message>
    <mud-inline-message hideIcon>Fără pictogramă.</mud-inline-message>
    <mud-inline-message variant="warning" class="narrow">
      Cererea va fi procesată doar după achitarea taxei de stat. Plata se confirmă în cel mult 24 de
      ore.
    </mud-inline-message>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .narrow {
      max-width: 320px;
    }
  `,
})
export class InlineMessageIconExample {}
