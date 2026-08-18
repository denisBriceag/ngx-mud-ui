import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
} from '@angular/core';

export type EgovAvatarSize = 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';

const SIZE_CLASSES: Record<EgovAvatarSize, string> = {
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
 * <egov-avatar label="Olga Popescu">OP</egov-avatar>
 * <egov-avatar size="large"><egov-icon name="user" scale="24" /></egov-avatar>
 * <egov-avatar size="extra-large"><img src="…" alt="Olga Popescu" /></egov-avatar>
 * ```
 */
@Component({
  selector: 'egov-avatar',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '_hostClasses()',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() || null',
  },
})
export class EgovAvatar {
  readonly size = input<EgovAvatarSize>('medium');

  /**
   * Accessible name for the avatar. When set, the host becomes `role="img"`
   * with this label and the projected content (initials, icon or image) turns
   * presentational for assistive tech. Without it the avatar is decorative:
   * initials read as-is and images rely on their own `alt` text.
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
            'egov-avatar: the projected <img> has no alt attribute and the avatar has no label. ' +
              'Add alt text (or alt="" if purely decorative), or set the label input.',
          );
        }
      });
    }
  }
}
