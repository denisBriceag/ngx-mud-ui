import { Component, inject } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import type { MudToastHorizontalPosition, MudToastVerticalPosition } from 'ngx-mud-ui/toast';
import { MudToast } from 'ngx-mud-ui/toast';

@Component({
  selector: 'app-toast-position',
  imports: [MudButton],
  template: `
    @for (position of positions; track $index) {
      <button type="button" mudButton="outlined" size="sm" (click)="show(position.v, position.h)">
        {{ position.v }} · {{ position.h }}
      </button>
    }
    <button type="button" mudButton="text" size="sm" (click)="dismissAll()">Dismiss all</button>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  `,
})
export class ToastPositionExample {
  private readonly _toast = inject(MudToast);

  readonly positions: { v: MudToastVerticalPosition; h: MudToastHorizontalPosition }[] = [
    { v: 'top', h: 'start' },
    { v: 'top', h: 'center' },
    { v: 'top', h: 'end' },
    { v: 'bottom', h: 'start' },
    { v: 'bottom', h: 'center' },
    { v: 'bottom', h: 'end' },
  ];

  show(
    verticalPosition: MudToastVerticalPosition,
    horizontalPosition: MudToastHorizontalPosition,
  ): void {
    this._toast.open({
      verticalPosition,
      horizontalPosition,
      data: { message: `${verticalPosition} ${horizontalPosition}` },
    });
  }

  dismissAll(): void {
    this._toast.dismissAll();
  }
}
