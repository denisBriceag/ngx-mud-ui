import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
} from '@angular/core';

export type MudAvatarSize = 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';

const SIZE_CLASSES: Record<MudAvatarSize, string> = {
  'extra-small': 'avatar--xs',
  small: 'avatar--sm',
  medium: 'avatar--md',
  large: 'avatar--lg',
  'extra-large': 'avatar--xl',
};

declare const ngDevMode: boolean | undefined;

const isDevMode = (): boolean => typeof ngDevMode === 'undefined' || !!ngDevMode;

/**
 * ```html
 * <mud-avatar label="Olga Popescu">OP</mud-avatar>
 * <mud-avatar size="large"><mud-icon name="user" scale="24" /></mud-avatar>
 * <mud-avatar size="extra-large"><img src="…" alt="Olga Popescu" /></mud-avatar>
 * ```
 */
@Component({
  selector: 'mud-avatar',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '_hostClasses()',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() || null',
  },
})
export class MudAvatar {
  readonly size = input<MudAvatarSize>('medium');

  /**
   * @description Accessible name for the avatar. When set, the host becomes `role="img"`
   * with this label and the projected content (initials, icon or image) turns
   * presentational for assistive tech.
   */
  readonly label = input<string | undefined>(undefined);

  protected readonly _hostClasses = computed(() => `avatar ${SIZE_CLASSES[this.size()]}`);

  private readonly _el = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    if (isDevMode()) {
      afterNextRender(() => {
        const img = this._el.nativeElement.querySelector(':scope > img');

        if (img && !this.label() && img.getAttribute('alt') === null) {
          console.warn(
            'mud-avatar: the projected <img> has no alt attribute and the avatar has no label. ' +
              'Add alt text (or alt="" if purely decorative), or set the label input.',
          );
        }
      });
    }
  }
}
