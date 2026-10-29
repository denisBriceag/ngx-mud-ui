import { Component, signal } from '@angular/core';
import { MudChip } from 'ngx-mud-ui/chip';

@Component({
  selector: 'app-chip-filter',
  imports: [MudChip],
  template: `
    <h4>One at a time (mono)</h4>
    <div class="row" role="group" aria-label="Status">
      @for (status of statuses; track status) {
        <mud-chip
          [selected]="status === activeStatus()"
          (selectedChange)="activeStatus.set($event ? status : null)"
        >
          {{ status }}
        </mud-chip>
      }
    </div>

    <h4>Several at once (multi)</h4>
    <div class="row" role="group" aria-label="Document type">
      @for (type of types; track type.name) {
        <mud-chip selectionMode="multi" [(selected)]="type.selected" [count]="type.count">{{
          type.name
        }}</mud-chip>
      }
    </div>
    <p>Active: {{ activeStatus() ?? 'none' }} · {{ selectedTypes() }}</p>
  `,
  styles: `
    h4 {
      margin: 0 0 8px;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 24px;
    }
    p {
      margin: 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class ChipFilterExample {
  readonly statuses = ['Toate', 'În lucru', 'Aprobate', 'Respinse'];
  readonly activeStatus = signal<string | null>('Toate');

  readonly types = [
    { name: 'Acte', count: 12, selected: true },
    { name: 'Cereri', count: 4, selected: false },
    { name: 'Plăți', count: 7, selected: false },
  ];

  selectedTypes(): string {
    return (
      this.types
        .filter((type) => type.selected)
        .map((type) => type.name)
        .join(', ') || 'no types'
    );
  }
}
