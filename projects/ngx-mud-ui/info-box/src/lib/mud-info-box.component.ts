import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, output, ViewEncapsulation } from '@angular/core';

export type MudInfoBoxVariant = 'neutral' | 'moderate' | 'prominent' | 'warning' | 'error';

const DEFAULT_CLOSE_LABEL = 'Close';

/**
 * ```html
 * <mud-info-box variant="prominent" closable (closed)="hide()">
 *   <p heading>Before you begin</p>
 *   You will need your IDNP and a scanned copy of your passport.
 *   <a actions mudLink href="/help">Read the guide</a>
 * </mud-info-box>
 * ```
 */
@Component({
  selector: 'mud-info-box',
  template: `
    @if (!hideIcon()) {
      <span class="info-box__icon" aria-hidden="true">
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
    }

    <div class="info-box__body">
      <div class="info-box__heading"><ng-content select="[heading]" /></div>
      <div class="info-box__message"><ng-content /></div>
      <div class="info-box__actions"><ng-content select="[actions]" /></div>
    </div>

    @if (closable()) {
      <button type="button" class="info-box__close" [attr.aria-label]="_closeLabel()" (click)="_close()">
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
  styleUrl: './mud-info-box.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': '_hostClasses()',
    '[attr.role]': '_role()',
    '[attr.aria-label]': '_label()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudInfoBox {
  /** @description Semantic treatment. `prominent` is the brand-tinted surface. */
  readonly variant = input<MudInfoBoxVariant>('neutral');

  /** @description Renders a trailing close button. Activating it emits `closed`. */
  readonly closable = input(false, { transform: booleanAttribute });

  /** @description Suppresses the leading icon entirely. */
  readonly hideIcon = input(false, { transform: booleanAttribute });

  /** @description Accessible name for the close button. */
  readonly closeLabel = input(DEFAULT_CLOSE_LABEL);

  /** @description Accessible name for the box itself. Gives the host a `region` role. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** Emitted when the close button is activated. The CONSUMER removes the box. */
  readonly closed = output<void>();

  protected readonly _closeLabel = computed(() => this.closeLabel().trim() || DEFAULT_CLOSE_LABEL);

  protected readonly _hostClasses = computed(
    () => `info-box info-box--${this.variant()}${this.closable() ? ' info-box--closable' : ''}`,
  );

  protected readonly _label = computed(() => this.ariaLabel()?.trim() || null);

  protected readonly _role = computed<string | null>(() => (this._label() ? 'region' : null));

  protected _close(): void {
    this.closed.emit();
  }
}
