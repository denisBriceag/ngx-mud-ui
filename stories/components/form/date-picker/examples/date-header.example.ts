import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MudDateInput } from 'ngx-mud-ui/date-picker';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';

@Component({
  selector: 'app-date-header',
  imports: [MudDateInput, MudLabel, MudInlineMessage],
  template: `
    <mud-date-input headerStyle="dropdown" max="2026-12-31">
      <mud-label>Data nașterii</mud-label>
      <mud-inline-message hideIcon
        >Month and year chips: two clicks to any date.</mud-inline-message
      >
    </mud-date-input>

    <mud-date-input [touchUi]="touch()">
      <mud-label>Data programării</mud-label>
      <mud-inline-message hideIcon
        >Opens as a centered dialog on screens up to 640px.</mud-inline-message
      >
    </mud-date-input>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 420px;
    }
  `,
})
export class DateHeaderExample {
  readonly touch = toSignal(
    inject(BreakpointObserver)
      .observe('(max-width: 640px)')
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );
}
