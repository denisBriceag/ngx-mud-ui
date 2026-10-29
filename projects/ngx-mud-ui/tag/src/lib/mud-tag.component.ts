import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';

export type MudTagColor = 'muted' | 'neutral' | 'accent' | 'success' | 'brand' | 'danger' | 'info';
export type MudTagType = 'subtle' | 'strong' | 'outlined';
export type MudTagSize = 'medium' | 'small';

declare const ngDevMode: boolean | undefined;

/**
 * ```html
 * <mud-tag color="success">Approved</mud-tag>
 * <mud-tag color="danger" type="strong" size="small">
 *   <mud-icon icon-start name="alert-small" [scale]="16" /> Rejected
 * </mud-tag>
 * <mud-tag color="brand">Details <mud-icon icon-end name="chevron-right-small" [scale]="16" /></mud-tag>
 * ```
 */
@Component({
  selector: 'mud-tag',
  template: '<ng-content select="[icon-start]" /><ng-content /><ng-content select="[icon-end]" />',
  styleUrl: './mud-tag.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '_hostClasses()',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.role]': 'ariaLabel() ? "status" : null',
    '[attr.aria-live]': 'ariaLabel() ? "polite" : null',
  },
})
export class MudTag {
  /** @description Color; `info` doesn't support the `outlined` type. */
  readonly color = input<MudTagColor>('neutral');
  /** @description `subtle` (tinted), `strong` (filled) or `outlined`. */
  readonly type = input<MudTagType>('subtle');
  /** @description Height and text size. */
  readonly size = input<MudTagSize>('medium');
  /** @description Greys the tag out (visual only); the owning row or control announces the state. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** @description Accessible name; when set the tag becomes a polite live region (`role="status"`). */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  private readonly _effectiveType = computed<MudTagType>(() => {
    if (this.color() === 'info' && this.type() === 'outlined') {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        console.warn(
          'mud-tag: color "info" does not support the "outlined" type; falling back to "subtle". ' +
            'Supported types for info: subtle, strong.',
        );
      }

      return 'subtle';
    }

    return this.type();
  });

  protected readonly _hostClasses = computed(() => {
    const classes = ['status-tag', `status-tag--${this.color()}`, `is-${this._effectiveType()}`];

    if (this.size() === 'small') classes.push('status-tag--small');

    if (this.disabled()) classes.push('is-disabled');

    return classes.join(' ');
  });
}
