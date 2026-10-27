import { booleanAttribute, ChangeDetectionStrategy, Component, computed, inject, input, numberAttribute } from '@angular/core';
import { MudStyleLoader } from 'ngx-mud-ui/core';
import { injectMudFormatLocale, injectMudLabels } from 'ngx-mud-ui/i18n';
import { _MudBadgeStyles } from './mud-badge-styles.component';
import type { MudBadgeSize, MudBadgeType, MudBadgeVariant } from './mud-badge.types';

/**
 * ```html
 * <a mud-tree-item routerLink="/inbox">Inbox <mud-badge trailing [count]="3" variant="neutral" size="xl" /></a>
 * ```
 */
@Component({
  selector: 'mud-badge',
  // Live: the count is the live region's content (aria-label changes are not announced). Otherwise the
  // host is a named image and the text is hidden so it is not read twice.
  template: `@if (_text()) {<span class="badge-count" [attr.aria-hidden]="live() ? null : 'true'">{{ _text() }}</span>}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': '_role()',
    '[attr.aria-live]': 'live() ? "polite" : null',
    '[class]': '_classes()',
    '[attr.aria-label]': 'live() ? null : _label() || null',
  },
})
export class MudBadge {
  /** @description `numbered` shows the count, `dot` is a presence indicator. */
  readonly type = input<MudBadgeType>('numbered');
  /** @description Color variant. */
  readonly variant = input<MudBadgeVariant>('danger');
  /** @description Size rung; `xs` is dot-only, so a numbered `xs` renders a dot. */
  readonly size = input<MudBadgeSize>('md');
  /** @description Disabled design (visual only — the owning container announces the state). */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** @description Count shown by a numbered badge; values above `max` render as `{max}+`. */
  readonly count = input<number | undefined, unknown>(undefined, {
    transform: (value: unknown) => (value == null || value === '' ? undefined : numberAttribute(value)),
  });
  /** @description Upper bound for the visible count. */
  readonly max = input(99, { transform: numberAttribute });
  /** @description Accessible name when there is no count and no `aria-label`. */
  readonly notificationLabel = input<string | undefined>(undefined);
  /** @description Accessible name; wins over the count and the notification label (`""` = decorative, no role). */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  /** @description Announces count changes (`role="status"`); off by default so a list of badges stays quiet. */
  readonly live = input(false, { transform: booleanAttribute });

  private readonly _labels = injectMudLabels();
  private readonly _formatLocale = injectMudFormatLocale();
  // Cached per locale.
  private readonly _numberFormat = computed(() => new Intl.NumberFormat(this._formatLocale(), { useGrouping: false }));

  protected readonly _isDot = computed(() => this.type() === 'dot' || this.size() === 'xs');

  protected readonly _text = computed(() => {
    const count = this.count();

    if (this._isDot() || count === undefined || Number.isNaN(count)) return '';

    const format = this._numberFormat();

    return count > this.max() ? `${format.format(this.max())}+` : format.format(count);
  });

  protected readonly _classes = computed(() =>
    [
      'badge',
      `badge--${this.size()}`,
      `badge--solid-${this.variant()}`,
      this._isDot() ? 'badge--dot' : '',
      this.disabled() ? 'badge--disabled' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  // An explicit aria-label (even '') wins, so `aria-label=""` marks a decorative badge; otherwise the count, then the dot label.
  protected readonly _label = computed(() => {
    const explicit = this.ariaLabel();

    if (explicit != null) return explicit;

    const dotLabel = this.notificationLabel() ?? this._labels().badge.notification;

    return this._text() || dotLabel;
  });

  /** A live badge is a status; a named one an image; one with no name (decorative dot) has no role. */
  protected readonly _role = computed(() => (this.live() ? 'status' : this._label() ? 'img' : null));

  constructor() {
    inject(MudStyleLoader).load(_MudBadgeStyles);
  }
}
