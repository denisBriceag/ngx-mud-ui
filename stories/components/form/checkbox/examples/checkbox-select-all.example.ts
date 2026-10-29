import { Component, computed, signal } from '@angular/core';
import { MudCheckbox } from 'ngx-mud-ui/checkbox';
import { MudLabel } from 'ngx-mud-ui/label';

@Component({
  selector: 'app-checkbox-select-all',
  imports: [MudCheckbox, MudLabel],
  template: `
    <mud-checkbox
      [checked]="allChecked()"
      [indeterminate]="someChecked()"
      (checkedChange)="setAll($event)"
    >
      <mud-label>Toate serviciile</mud-label>
    </mud-checkbox>
    <div class="children">
      @for (service of services(); track service.name; let i = $index) {
        <mud-checkbox size="sm" [checked]="service.on" (checkedChange)="toggle(i, $event)">
          <mud-label>{{ service.name }}</mud-label>
        </mud-checkbox>
      }
    </div>
  `,
  styles: `
    .children {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 12px 0 0 36px;
    }
  `,
})
export class CheckboxSelectAllExample {
  readonly services = signal([
    { name: 'MPay', on: true },
    { name: 'MSign', on: false },
    { name: 'MNotify', on: false },
  ]);
  // indeterminate is yours: a click never clears it, so derive it from the children.
  readonly allChecked = computed(() => this.services().every((s) => s.on));
  readonly someChecked = computed(() => !this.allChecked() && this.services().some((s) => s.on));

  toggle(index: number, on: boolean): void {
    this.services.update((list) => list.map((s, i) => (i === index ? { ...s, on } : s)));
  }

  setAll(on: boolean): void {
    this.services.update((list) => list.map((s) => ({ ...s, on })));
  }
}
