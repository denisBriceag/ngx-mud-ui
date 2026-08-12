import { Component, computed, effect, inject, input, isDevMode } from '@angular/core';
import type { SafeHtml } from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';
import { EgovIconRegistry } from './egov-icon-registry.service';
import type { EgovIcon, EgovIconGeometry, EgovIconScale, EgovIconVariant } from './types';
import type { EgovIconName } from './icon-name';

const SCALES: readonly EgovIconScale[] = [12, 16, 20, 24];

@Component({
  selector: 'egov-icon',
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
})
export class EgovIconComponent {
  private readonly registry = inject(EgovIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);

  readonly name = input.required<EgovIconName>();
  readonly variant = input<EgovIconVariant>('outlined');
  readonly scale = input<EgovIconScale>(24);
  readonly ariaLabel = input<string | undefined, string | undefined>(undefined, {
    alias: 'aria-label',
    transform: (value) => {
      const trimmed = value?.trim();

      return trimmed ? trimmed : undefined;
    },
  });

  private readonly resolution = computed<{
    geometry: EgovIconGeometry | undefined;
    warnings: readonly string[];
  }>(() => {
    const warnings: string[] = [];
    const icon = this.registry.get(this.name());

    if (!icon) {
      warnings.push(
        `[egov-icon] Icon "${this.name()}" is not registered. Did you call provideEgovIcons([...])?`,
      );

      return { geometry: undefined, warnings };
    }

    const variant = this.pickVariant(icon.variants, warnings);

    if (!variant) return { geometry: undefined, warnings };

    const byScale = icon.variants[variant]!;
    const scale = this.pickScale(byScale, warnings);

    if (scale === undefined) return { geometry: undefined, warnings };

    return { geometry: byScale[scale], warnings };
  });

  protected readonly svg = computed<SafeHtml>(() => {
    const geometry = this.resolution().geometry;

    if (!geometry) return '';

    const px = this.scale();
    const markup =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${geometry.viewBox}" ` +
      `width="${px}" height="${px}" fill="currentColor" focusable="false" aria-hidden="true">` +
      `${geometry.body}</svg>`;

    return this.sanitizer.bypassSecurityTrustHtml(markup);
  });

  constructor() {
    effect(() => {
      if (!isDevMode()) return;

      for (const warning of this.resolution().warnings) console.warn(warning);
    });
  }

  private pickVariant(
    variants: EgovIcon['variants'],
    warnings: string[],
  ): EgovIconVariant | undefined {
    const want = this.variant();

    if (variants[want]) return want;

    if (variants.outlined) {
      warnings.push(`[egov-icon] "${this.name()}" has no "${want}" variant; using "outlined".`);

      return 'outlined';
    }

    return (Object.keys(variants) as EgovIconVariant[])[0];
  }

  private pickScale(
    byScale: Partial<Record<EgovIconScale, EgovIconGeometry>>,
    warnings: string[],
  ): EgovIconScale | undefined {
    const want = this.scale();

    if (byScale[want]) return want;

    const available = SCALES.filter((s) => byScale[s]);

    if (available.length === 0) return undefined;

    const larger = available.filter((s) => s > want).sort((a, b) => a - b)[0];
    const chosen = larger ?? available.filter((s) => s < want).sort((a, b) => b - a)[0];

    warnings.push(`[egov-icon] "${this.name()}" has no scale ${want}; using ${chosen}.`);

    return chosen;
  }
}
