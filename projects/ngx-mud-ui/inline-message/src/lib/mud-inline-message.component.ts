import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';

export type MudInlineMessageVariant = 'info' | 'warning' | 'success' | 'error';
export type MudInlineMessageSize = 'small' | 'medium';

/**
 * ```html
 * <mud-inline-message variant="error" size="small" id="cnp-error">
 *   Introduceți un IDNP valid.
 * </mud-inline-message>
 * ```
 */
@Component({
  selector: 'mud-inline-message',
  template: `
    @if (!hideIcon()) {
      <span class="inline-message__icon" aria-hidden="true">
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
            @case ('success') {
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" focusable="false">
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M10 1.667a8.333 8.333 0 1 0 0 16.666 8.333 8.333 0 0 0 0-16.666m2.984 6.645a.625.625 0 0 0-.968-.791L8.704 11.57l-1.179-1.18a.625.625 0 0 0-.884.884l1.667 1.667a.625.625 0 0 0 .926-.046z"
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
    <span class="inline-message__text"><ng-content /></span>
  `,
  styleUrl: './mud-inline-message.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': '_hostClasses()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudInlineMessage {
  /** @description Semantic variant; `info` colours only the icon, the others colour icon and text. */
  readonly variant = input<MudInlineMessageVariant>('info');

  /** @description Size rung: `small` (12/16, 16px icon) or `medium` (14/20, 20px icon). */
  readonly size = input<MudInlineMessageSize>('medium');

  /** @description Suppresses the leading icon (the icon-none variation). */
  readonly hideIcon = input(false, { transform: booleanAttribute });

  protected readonly _hostClasses = computed(() => {
    const classes = ['inline-message', `inline-message--${this.variant()}`];

    if (this.size() === 'small') classes.push('inline-message--small');

    return classes.join(' ');
  });
}
