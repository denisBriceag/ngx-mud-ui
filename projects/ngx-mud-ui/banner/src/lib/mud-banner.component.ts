import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, output, ViewEncapsulation } from '@angular/core';
import { injectMudLabels, _mudText } from 'ngx-mud-ui/i18n';

export type MudBannerVariant = 'info' | 'warning' | 'error';
export type MudBannerType = 'subtle' | 'strong';

/**
 * Full-width, top-of-page system message bar - maintenance, outages,
 * announcements. Persistent and non-contextual; it draws attention without
 * blocking interaction and stays until dismissed or resolved.
 * ```html
 * <mud-banner variant="warning" closable (closed)="hide()">
 *   Scheduled maintenance tonight 22:00–00:00.
 *   <a mudLink routerLink="/status">Details</a>
 * </mud-banner>
 * ```
 */
@Component({
  selector: 'mud-banner',
  template: `
    <span class="banner__icon" aria-hidden="true">
      <ng-content select="mud-icon,svg">
        @switch (variant()) {
          @case ('warning') {
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" focusable="false">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M8.563 3.31a1.667 1.667 0 0 1 2.874 0L18.313 15c.654 1.11-.148 2.512-1.437 2.512H3.124c-1.29 0-2.09-1.401-1.437-2.512zM10 8.345c.46 0 .834.373.834.833v1.667a.833.833 0 1 1-1.667 0V9.178c0-.46.373-.833.833-.833m-1.041 5a1.042 1.042 0 1 1 2.083 0 1.042 1.042 0 0 1-2.083 0"
              />
            </svg>
          }
          @case ('error') {
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" focusable="false">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M10 1.667a8.333 8.333 0 1 0 0 16.666 8.333 8.333 0 0 0 0-16.666m-.833 7.5c0-.459.416-.834.833-.834s.833.373.833.834v4.166a.833.833 0 0 1-1.666 0zM10 5.833A.833.833 0 1 0 10 7.5a.833.833 0 0 0 0-1.667"
              />
            </svg>
          }
          @default {
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" focusable="false">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M10 1.667a8.333 8.333 0 1 0 0 16.666 8.333 8.333 0 0 0 0-16.666m-1.667 7.5c0-.46.373-.834.834-.834H10c.46 0 .833.373.833.834v4.166a.833.833 0 0 1-1.666 0V10a.833.833 0 0 1-.834-.833M10 5.833A.833.833 0 1 0 10 7.5a.833.833 0 0 0 0-1.667"
              />
            </svg>
          }
        }
      </ng-content>
    </span>

    <!-- Message and actions as one block: on phones the actions wrap under the message, not under the icon. -->
    <span class="banner__content">
      <span class="banner__message"><ng-content /></span>
      <span class="banner__actions"><ng-content select="[actions]" /></span>
    </span>

    @if (closable()) {
      <button type="button" class="banner__close" [attr.aria-label]="_closeLabel()" (click)="_dismiss()">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" focusable="false" aria-hidden="true">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M5.244 5.244a.833.833 0 0 1 1.179 0L10 8.821l3.577-3.577a.833.833 0 1 1 1.179 1.179L11.179 10l3.577 3.577a.833.833 0 0 1-1.179 1.179L10 11.179l-3.577 3.577a.833.833 0 0 1-1.179-1.179L8.821 10 5.244 6.423a.833.833 0 0 1 0-1.179"
          />
        </svg>
      </button>
    }
  `,
  styleUrl: './mud-banner.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': '_hostClasses()',
    '[attr.role]': '_role()',
    '[attr.aria-live]': '_ariaLive()',
    '[attr.aria-label]': '_label()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudBanner {
  /** @description Semantic colour family. Upstream exposes no `success` for banners. */
  readonly variant = input<MudBannerVariant>('info');

  /** @description Surface treatment: `subtle` (tinted) or `strong` (filled, on-colour text). */
  readonly type = input<MudBannerType>('subtle');

  /** @description Renders a trailing close button. Activating it emits `closed`. */
  readonly closable = input(false, { transform: booleanAttribute });

  /**
   * @description Announce the message when it CHANGES while this banner is
   * already on screen — a session countdown, a connection banner that updates,
   * a persistent status bar flipping to degraded.
   *
   * Off by default, because a banner already present at page load would
   * interrupt the screen reader mid-read, and an assertive one would cut off
   * whatever was being announced.
   *
   * This will NOT announce a banner that appears. A live region must be in the
   * accessibility tree before its content changes, so mounting an
   * already-populated `live` banner is not a content change and announces
   * nothing. If you need an ARRIVING message announced, keep your own live
   * region in the layout from first render and write into it, and leave this
   * off.
   */
  readonly live = input(false, { transform: booleanAttribute });

  /** @description Accessible name for the close button. */
  readonly closeLabel = input<string | undefined>(undefined);

  /** @description Accessible name for the banner itself. Gives the host a `region` role. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** Emitted when the close button is activated. The CONSUMER removes the banner. */
  readonly closed = output<void>();

  private readonly _labels = injectMudLabels();

  protected readonly _closeLabel = computed(() => _mudText(this.closeLabel(), this._labels().banner.close));

  protected readonly _hostClasses = computed(() =>
    ['banner', `banner--${this.variant()}`, `banner--${this.type()}`].join(' '),
  );

  protected readonly _label = computed(() => this.ariaLabel()?.trim() || null);

  protected readonly _role = computed<string | null>(() => {
    if (this.live()) return this.variant() === 'info' ? 'status' : 'alert';

    return this._label() ? 'region' : null;
  });

  protected readonly _ariaLive = computed<string | null>(() => {
    if (!this.live()) return null;

    return this.variant() === 'info' ? 'polite' : 'assertive';
  });

  protected _dismiss(): void {
    this.closed.emit();
  }
}
