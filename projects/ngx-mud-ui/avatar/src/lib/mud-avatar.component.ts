import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { injectMudLabels } from 'ngx-mud-ui/i18n';

export type MudAvatarSize = 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';

const SIZE_CLASSES: Record<MudAvatarSize, string> = {
  'extra-small': 'avatar--xs',
  small: 'avatar--sm',
  medium: 'avatar--md',
  large: 'avatar--lg',
  'extra-large': 'avatar--xl',
};

declare const ngDevMode: boolean | undefined;

/** 'Ion Popescu' -> 'IP', 'Maria-Andreea Pop' -> 'MP', 'Ștefan' -> 'Ș'. */
export function deriveInitials(name: string | undefined): string {
  if (!name) return '';

  const parts = name
    .trim()
    .split(/[\s-]+/u)
    .filter(Boolean);

  if (parts.length === 0) return '';

  if (parts.length === 1) return (parts[0][0] ?? '').toUpperCase();

  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase();
}

/**
 * ```html
 * <mud-avatar name="Olga Popescu" />
 * <mud-avatar label="Olga Popescu">OP</mud-avatar>
 * <mud-avatar size="large"><mud-icon name="person" scale="24" /></mud-avatar>
 * <mud-avatar name="Olga Popescu"><img src="…" alt="Olga Popescu" /></mud-avatar>
 * ```
 */
@Component({
  selector: 'mud-avatar',
  template: '<ng-content /><span class="avatar-initials">{{ _resolvedInitials() }}</span>',
  styleUrl: './mud-avatar.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '_hostClasses()',
    role: 'img',
    '[attr.aria-label]': '_accessibleName()',
  },
})
export class MudAvatar {
  /** @description Diameter: 24, 32, 40, 48 or 72px. */
  readonly size = input<MudAvatarSize>('medium');

  /** @description Accessible name; wins over `name`. */
  readonly label = input<string | undefined>(undefined);

  /** @description Full name; derives the initials and the accessible name. */
  readonly name = input<string | undefined>(undefined);

  /** @description Pre-computed initials; overrides derivation from `name`. */
  readonly initials = input<string | undefined>(undefined);

  private readonly _labels = injectMudLabels();

  protected readonly _hostClasses = computed(() => `avatar ${SIZE_CLASSES[this.size()]}`);

  protected readonly _resolvedInitials = computed(() => {
    const explicit = this.initials()?.trim();

    if (explicit) return explicit.slice(0, 2).toUpperCase();

    return deriveInitials(this.name());
  });

  /** @description Accessible-name chain: label -> name -> initials -> fallback. */
  protected readonly _accessibleName = computed(() => {
    const label = this.label();

    if (label) return label;

    const name = this.name();

    if (name) return name;

    const initials = this._resolvedInitials();

    if (initials) return this._labels().avatar.initials(initials);

    return this._labels().avatar.fallback;
  });

  private readonly _el = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterNextRender(() => {
      const host = this._el.nativeElement;

      // `error` does not bubble; capture it so a failed photo collapses to the initials.
      host.addEventListener(
        'error',
        (event) => {
          const target = event.target as HTMLElement | null;

          if (target instanceof HTMLImageElement && target.parentElement === host) {
            target.classList.add('avatar-img-failed');
          }
        },
        true,
      );

      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        const img = host.querySelector(':scope > img');

        if (img && !this.label() && !this.name() && img.getAttribute('alt') === null) {
          console.warn(
            'mud-avatar: the projected <img> has no alt attribute and the avatar has no label or name. ' +
              'Add alt text (or alt="" if purely decorative), or set the label/name input.',
          );
        }
      }
    });
  }
}
