import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';

export type MudTagColor = 'muted' | 'neutral' | 'accent' | 'success' | 'brand' | 'danger' | 'info';
export type MudTagType = 'subtle' | 'strong' | 'outlined';
export type MudTagSize = 'medium' | 'small';

declare const ngDevMode: boolean | undefined;

/**
 * ```html
 * <mud-tag color="success">Approved</mud-tag>
 * <mud-tag color="danger" type="strong" size="small">
 *   <mud-icon name="alert-small" scale="16" /> Rejected
 * </mud-tag>
 * ```
 */
@Component({
  selector: 'mud-tag',
  template: '<ng-content />',
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
  readonly color = input<MudTagColor>('neutral');
  readonly type = input<MudTagType>('subtle');
  readonly size = input<MudTagSize>('medium');
  /**
   * Accessible name for tags whose state change should be announced. Only when
   * set does the tag become a polite live region (role="status"); unlabelled
   * tags stay a11y-silent, matching the official design system.
   */
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

    return classes.join(' ');
  });
}
