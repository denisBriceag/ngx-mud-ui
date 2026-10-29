import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { MudBanner } from 'ngx-mud-ui/banner';
import { MudButton } from 'ngx-mud-ui/button';

@Component({
  selector: 'app-banner-live',
  imports: [MudBanner, MudButton],
  template: `
    <!-- On the page from the start; only its text changes, so screen readers announce each change. -->
    <mud-banner [variant]="minutes() > 2 ? 'info' : 'warning'" live>{{ message() }}</mud-banner>
    <button type="button" mudButton="outlined" size="small" (click)="minutes.set(5)">
      Extend session
    </button>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
    mud-banner {
      align-self: stretch;
    }
  `,
})
export class BannerLiveExample {
  readonly minutes = signal(5);
  readonly message = computed(() =>
    this.minutes() > 0
      ? `Your session expires in ${this.minutes()} minutes.`
      : 'Your session has expired.',
  );

  constructor() {
    const timer = setInterval(() => this.minutes.update((m) => Math.max(0, m - 1)), 5000);

    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }
}
