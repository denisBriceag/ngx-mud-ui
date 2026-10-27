import { Component, computed, input, signal } from '@angular/core';
import { MudIconComponent } from 'ngx-mud-ui/icons';
import type { MudIcon, MudIconName, MudIconScale, MudIconVariant } from 'ngx-mud-ui/icons';

interface GalleryTile {
  name: MudIconName;
  scale: MudIconScale;
}

interface GallerySection {
  variant: MudIconVariant;
  title: string;
  tiles: GalleryTile[];
}

const SCALES: readonly MudIconScale[] = [12, 16, 20, 24];

const SECTIONS: readonly { variant: MudIconVariant; title: string }[] = [
  { variant: 'outlined', title: 'Outlined' },
  { variant: 'filled', title: 'Filled' },
];

// Mirrors mud-icon's own fallback (next larger drawn rung, else next smaller;
// 32 upscales the 24 artwork), resolved here so the gallery never trips the
// component's dev-mode warning.
const drawnScale = (icon: MudIcon, variant: MudIconVariant, want: MudIconScale) => {
  const byScale = icon.variants[variant];

  if (!byScale) return undefined;

  if (byScale[want]) return want;

  const available = SCALES.filter((s) => byScale[s]);

  if (want === 32) return available.at(-1) === 24 ? want : available.at(-1);

  return available.find((s) => s > want) ?? available.filter((s) => s < want).at(-1);
};

@Component({
  selector: 'mud-icon-gallery',
  imports: [MudIconComponent],
  template: `
    <label class="search">
      <span class="search__label">Filter icons</span>
      <input
        class="search__input"
        type="search"
        placeholder="e.g. arrow"
        [value]="query()"
        (input)="query.set($any($event.target).value)"
      />
    </label>

    @for (section of sections(); track section.variant) {
      <section class="group">
        <h3 class="group__title">{{ section.title }} · {{ section.tiles.length }}</h3>
        <div class="grid">
          @for (tile of section.tiles; track tile.name) {
            <button
              type="button"
              class="tile"
              [title]="'Copy ' + snippet(tile.name, section.variant)"
              (click)="copy(tile.name, section.variant)"
            >
              <mud-icon [name]="tile.name" [variant]="section.variant" [scale]="tile.scale" />
              <code class="tile__name">{{ tile.name }}</code>
              @if (tile.scale !== scale()) {
                <span class="tile__note">drawn at {{ tile.scale }}</span>
              }
              <span class="tile__copied" [class.show]="copied() === section.variant + tile.name">
                copied ✓
              </span>
            </button>
          } @empty {
            <p class="empty">No {{ section.title.toLowerCase() }} icons match.</p>
          }
        </div>
      </section>
    }
  `,
  styles: `
    :host {
      display: block;
      padding: 1.5rem 2rem;
      font-family: system-ui, sans-serif;
      color: var(--mud-color-text-base-default);
    }
    .search {
      display: inline-flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-bottom: 1.5rem;
    }
    .search__label {
      font-size: 0.8rem;
      color: var(--mud-color-text-base-secondary);
    }
    .search__input {
      width: 260px;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--mud-color-border-base-default);
      border-radius: 8px;
      background: var(--mud-color-background-base-default);
      color: inherit;
      font: inherit;
    }
    .group {
      margin-bottom: 2rem;
    }
    .group__title {
      margin: 0 0 0.75rem;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--mud-color-text-base-secondary);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
      gap: 0.75rem;
    }
    .tile {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      min-height: 96px;
      padding: 0.75rem 0.5rem;
      border: 1px solid var(--mud-color-border-base-default);
      border-radius: 10px;
      background: var(--mud-color-background-base-default);
      color: var(--mud-color-icon-base-default, inherit);
      font: inherit;
      cursor: pointer;
    }
    .tile:hover {
      border-color: var(--mud-color-border-base-secondary);
    }
    .tile__name {
      max-width: 100%;
      overflow-wrap: anywhere;
      text-align: center;
      font-size: 0.75rem;
      color: var(--mud-color-text-base-default);
    }
    .tile__note {
      font-size: 0.65rem;
      color: var(--mud-color-text-base-secondary);
    }
    .tile__copied {
      position: absolute;
      top: 0.35rem;
      right: 0.5rem;
      font-size: 0.65rem;
      color: var(--mud-color-text-brand-default);
      opacity: 0;
      transition: opacity 120ms;
    }
    .tile__copied.show {
      opacity: 1;
    }
    .empty {
      grid-column: 1 / -1;
      margin: 0;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class IconGalleryComponent {
  readonly icons = input.required<MudIcon[]>();
  readonly scale = input<MudIconScale>(24);

  protected readonly query = signal('');
  protected readonly copied = signal<string | null>(null);

  protected readonly sections = computed<GallerySection[]>(() => {
    const needle = this.query().trim().toLowerCase();
    const icons = this.icons()
      .filter((icon) => icon.name.includes(needle))
      .sort((a, b) => a.name.localeCompare(b.name));

    return SECTIONS.map(({ variant, title }) => ({
      variant,
      title,
      tiles: icons.flatMap((icon) => {
        const scale = drawnScale(icon, variant, this.scale());

        return scale ? [{ name: icon.name as MudIconName, scale }] : [];
      }),
    }));
  });

  protected snippet(name: string, variant: MudIconVariant): string {
    return `<mud-icon name="${name}" variant="${variant}" />`;
  }

  protected copy(name: string, variant: MudIconVariant): void {
    void navigator.clipboard?.writeText(this.snippet(name, variant));
    this.copied.set(variant + name);
    setTimeout(() => this.copied.set(null), 1200);
  }
}
