import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type EgovTagColor = 'muted' | 'neutral' | 'accent' | 'success' | 'brand' | 'danger' | 'info';
export type EgovTagType = 'subtle' | 'strong' | 'outlined';
export type EgovTagSize = 'medium' | 'small';

declare const ngDevMode: boolean | undefined;

const isDevMode = (): boolean => typeof ngDevMode === 'undefined' || !!ngDevMode;

/**
 * ```html
 * <egov-tag color="success">Approved</egov-tag>
 * <egov-tag color="danger" type="strong" size="small">
 *   <egov-icon name="alert-small" scale="16" /> Rejected
 * </egov-tag>
 * ```
 */
@Component({
  selector: 'egov-tag',
  exportAs: 'egovTag',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '_hostClasses()',
  },
})
export class EgovTag {
  readonly color = input<EgovTagColor>('neutral');
  readonly type = input<EgovTagType>('subtle');
  readonly size = input<EgovTagSize>('medium');

  private readonly _effectiveType = computed<EgovTagType>(() => {
    if (this.color() === 'info' && this.type() === 'outlined') {
      if (isDevMode()) {
        console.warn(
          'egov-tag: color "info" does not support the "outlined" type; falling back to "subtle". ' +
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
