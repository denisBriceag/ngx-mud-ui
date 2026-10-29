import { Component, signal } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import { MudAccordion, MudAccordionHeader, MudAccordionTitle } from 'ngx-mud-ui/accordion';

@Component({
  selector: 'app-accordion-controlled',
  imports: [MudAccordion, MudAccordionHeader, MudAccordionTitle, MudButton],
  template: `
    <div class="actions">
      <button type="button" mudButton="outlined" size="small" (click)="item.toggle()">
        Toggle
      </button>
      <button type="button" mudButton="outlined" size="small" (click)="disabled.set(!disabled())">
        {{ disabled() ? 'Enable' : 'Disable' }}
      </button>
    </div>

    <mud-accordion
      #item
      [(expanded)]="expanded"
      [disabled]="disabled()"
      (afterExpand)="log('afterExpand')"
      (afterCollapse)="log('afterCollapse')"
    >
      <mud-accordion-header>
        <mud-accordion-title>Detaliile cererii</mud-accordion-title>
      </mud-accordion-header>
      Cererea a fost depusă pe 15 martie 2026.
    </mud-accordion>

    <p class="status">expanded: {{ expanded }} · last event: {{ lastEvent() }}</p>
  `,
  styles: `
    :host {
      display: block;
      max-width: 720px;
    }
    .actions {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .status {
      margin: 16px 0 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class AccordionControlledExample {
  expanded = false;
  readonly disabled = signal(false);
  readonly lastEvent = signal('none');

  log(event: string): void {
    this.lastEvent.set(event);
  }
}
