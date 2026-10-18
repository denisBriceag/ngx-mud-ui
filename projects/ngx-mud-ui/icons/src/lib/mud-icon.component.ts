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

const SCALES: readonly MudIconScale[] = [12, 16, 20, 24];

@Component({
  selector: 'mud-icon',
  template: `<span style="display: inline-flex" [innerHTML]="svg()"></span>`,
  styles: `
    :host {
      display: inline-flex;
      line-height: 0;
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

  readonly name = input.required<MudIconName>();
  readonly variant = input<MudIconVariant>('outlined');
  readonly scale = input<MudIconScale>(24);
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

    const available = SCALES.filter((s) => byScale[s]);

    if (available.length === 0) return undefined;

    const larger = available.filter((s) => s > want).sort((a, b) => a - b)[0];
    const chosen = larger ?? available.filter((s) => s < want).sort((a, b) => b - a)[0];

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      warnings.push(`[mud-icon] "${this.name()}" has no scale ${want}; using ${chosen}.`);
    }

    return chosen;
  }
}
