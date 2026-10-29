import { Component, signal } from '@angular/core';
import { MudChip } from 'ngx-mud-ui/chip';

@Component({
  selector: 'app-chip-input',
  imports: [MudChip],
  template: `
    <div class="row" role="list" aria-label="Recipients">
      @for (person of recipients(); track person) {
        <mud-chip
          role="listitem"
          type="input"
          removable
          [label]="person"
          (removed)="remove(person)"
          >{{ person }}</mud-chip
        >
      } @empty {
        <span>No recipients.</span>
      }
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  `,
})
export class ChipInputExample {
  readonly recipients = signal(['Ana Popescu', 'Ion Rusu', 'Maria Ciobanu']);

  remove(person: string): void {
    this.recipients.update((list) => list.filter((p) => p !== person));
  }
}
