import { Component, signal } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import { MudSpinner } from 'ngx-mud-ui/spinner';

@Component({
  selector: 'app-spinner-loading',
  imports: [MudSpinner, MudButton],
  template: `
    <button type="button" mudButton="outlined" (click)="reload()">Reload</button>
    <div class="panel" [attr.aria-busy]="loading()">
      @if (loading()) {
        <mud-spinner aria-label="Loading requests" />
      } @else {
        <p>3 requests in progress.</p>
      }
    </div>
  `,
  styles: `
    .panel {
      display: grid;
      place-items: center;
      height: 120px;
      margin-top: 16px;
      border: 1px solid var(--mud-color-border-base-subtle);
      border-radius: 8px;
    }
  `,
})
export class SpinnerLoadingExample {
  readonly loading = signal(false);

  reload(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 1500);
  }
}
