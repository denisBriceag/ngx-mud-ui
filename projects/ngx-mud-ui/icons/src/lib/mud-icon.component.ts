import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';

declare const ngDevMode: boolean | undefined;

import type { SafeHtml } from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';
import { MudIconRegistry } from './mud-icon-registry.service';
import type { MudIcon, MudIconGeometry, MudIconScale, MudIconVariant } from './types';
import type { MudIconName } from './icon-name';

const DRAWN_SCALES: readonly MudIconScale[] = [12, 16, 20, 24];
const UPSCALED: MudIconScale = 32;

@Component({
  selector: 'mud-icon',
  template: `<span style="display: inline-flex" [innerHTML]="svg()"></span>`,
  styles: `
    :host {
      display: inline-flex;
      line-height: 0;
      color: var(--mud-icon-color, currentColor);
    }
  `,
  host: {
    '[attr.role]': 'ariaLabel() ? "img" : null',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.aria-hidden]': 'ariaLabel() ? null : "true"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudIconComponent {
  private readonly _registry = inject(MudIconRegistry);
  private readonly _sanitizer = inject(DomSanitizer);

  /** @description Icon name in kebab-case (`arrow-left`); the icon must be registered with `provideMudIcons`. */
  readonly name = input.required<MudIconName>();
  /** @description Drawing style; falls back to `outlined` when the icon has no such variant. */
  readonly variant = input<MudIconVariant>('outlined');
  /** @description Size in px. 12–24 have their own drawings; 32 scales up the 24 drawing. */
  readonly scale = input<MudIconScale>(24);
  /** @description Accessible name; gives the icon `role="img"`. Without it the icon is decorative (`aria-hidden`). */
  readonly ariaLabel = input<string | undefined, string | undefined>(undefined, {
    alias: 'aria-label',
    transform: (value) => {
      const trimmed = value?.trim();

      return trimmed ? trimmed : undefined;
    },
  });

  private readonly _resolution = computed<{
    geometry: MudIconGeometry | undefined;
    warnings: readonly string[];
  }>(() => {
    const warnings: string[] = [];
    const icon = this._registry.get(this.name());

    if (!icon) {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        warnings.push(
          `[mud-icon] Icon "${this.name()}" is not registered. Did you call provideMudIcons([...])?`,
        );
      }

      return { geometry: undefined, warnings };
    }

    const variant = this._pickVariant(icon.variants, warnings);

    if (!variant) return { geometry: undefined, warnings };

    const byScale = icon.variants[variant]!;
    const scale = this._pickScale(byScale, warnings);

    if (scale === undefined) return { geometry: undefined, warnings };

    return { geometry: byScale[scale], warnings };
  });

  protected readonly svg = computed<SafeHtml>(() => {
    const geometry = this._resolution().geometry;

    if (!geometry) return '';

    const px = this.scale();
    const markup =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${geometry.viewBox}" ` +
      `width="${px}" height="${px}" fill="currentColor" focusable="false" aria-hidden="true">` +
      `${geometry.body}</svg>`;

    return this._sanitizer.bypassSecurityTrustHtml(markup);
  });

  constructor() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      effect(() => {
        for (const warning of this._resolution().warnings) console.warn(warning);
      });
    }
  }

  private _pickVariant(
    variants: MudIcon['variants'],
    warnings: string[],
  ): MudIconVariant | undefined {
    const want = this.variant();

    if (variants[want]) return want;

    if (variants.outlined) {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        warnings.push(`[mud-icon] "${this.name()}" has no "${want}" variant; using "outlined".`);
      }

      return 'outlined';
    }

    return (Object.keys(variants) as MudIconVariant[])[0];
  }

  private _pickScale(
    byScale: Partial<Record<MudIconScale, MudIconGeometry>>,
    warnings: string[],
  ): MudIconScale | undefined {
    const want = this.scale();

    if (byScale[want]) return want;

    const available = DRAWN_SCALES.filter((s) => byScale[s]);

    if (available.length === 0) return undefined;

    // 32 is drawn from the 24 artwork by design; only a smaller source warns.
    if (want === UPSCALED) {
      const largest = available.at(-1)!;

      if (largest < 24 && (typeof ngDevMode === 'undefined' || ngDevMode)) {
        warnings.push(`[mud-icon] "${this.name()}" has no 24 artwork to scale to 32; using ${largest}.`);
      }

      return largest;
    }

    const larger = available.filter((s) => s > want).sort((a, b) => a - b)[0];
    const chosen = larger ?? available.filter((s) => s < want).sort((a, b) => b - a)[0];

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      warnings.push(`[mud-icon] "${this.name()}" has no scale ${want}; using ${chosen}.`);
    }

    return chosen;
  }
}
