import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import type { EgovTooltipPlacement, EgovTooltipSize } from './tooltip-positions';

/**
 * The tooltip bubble rendered in a CDK overlay. Created by the `EgovTooltip`
 * directive - not meant to be used directly in templates.
 */
@Component({
  selector: 'egov-tooltip-container',
  template: `
    <div class="tooltip-inner" [id]="tooltipId()">{{ message() }}</div>
    @if (closeable()) {
      <button
        type="button"
        class="tooltip-close"
        [attr.aria-label]="closeAriaLabel()"
        (click)="closed.emit()"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
    }
    <div class="tooltip-arrow"></div>
  `,
  styleUrl: './egov-tooltip-container.component.scss',
  host: {
    role: 'tooltip',
    '[class]': 'hostClasses()',
    '[class.show]': 'visible()',
    '[style.--egov-tooltip-max-width]': 'maxWidth()',
    '(mouseenter)': 'hovered.emit(true)',
    '(mouseleave)': 'hovered.emit(false)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EgovTooltipContainer {
  readonly tooltipId = input.required<string>();
  readonly message = input.required<string>();
  readonly placement = input.required<EgovTooltipPlacement>();
  readonly size = input.required<EgovTooltipSize>();
  readonly closeable = input(false);
  readonly closeAriaLabel = input('Close');
  readonly maxWidth = input('240px');

  readonly closed = output<void>();
  readonly hovered = output<boolean>();

  protected readonly hostClasses = computed(() => {
    const classes = ['tooltip', `tooltip--${this.placement()}`, `tooltip--${this.size()}`];

    if (this.closeable()) classes.push('tooltip--with-close');

    return classes.join(' ');
  });

  protected readonly visible = signal(false);

  constructor() {
    afterNextRender(() => this.visible.set(true));
  }
}
