import { Component, computed, signal } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import { MudMenu, MudMenuItem, MudMenuTrigger } from 'ngx-mud-ui/menu';

@Component({
  selector: 'app-menu-selection',
  imports: [MudButton, MudMenu, MudMenuItem, MudMenuTrigger],
  template: `
    <button type="button" mudButton="outlined" [mudMenuTriggerFor]="sort">
      Sort by: {{ sortLabel() }}
    </button>
    <mud-menu #sort type="selection" aria-label="Sort by" [(value)]="sortBy">
      @for (option of options; track option.value) {
        <mud-menu-item [value]="option.value">{{ option.label }}</mud-menu-item>
      }
    </mud-menu>
  `,
})
export class MenuSelectionExample {
  readonly options = [
    { value: 'name', label: 'Name' },
    { value: 'date', label: 'Date modified' },
    { value: 'size', label: 'Size' },
  ];
  readonly sortBy = signal<string | undefined>('date');
  readonly sortLabel = computed(
    () => this.options.find((option) => option.value === this.sortBy())?.label,
  );
}
