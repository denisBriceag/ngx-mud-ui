import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { Component, ViewEncapsulation, inject, input } from '@angular/core';
import { expect, userEvent, within } from 'storybook/test';
import { MudDrawer, MudDrawerClose, MudDrawerTitle } from 'ngx-mud-ui/drawer';
import type { MudDrawerPosition } from 'ngx-mud-ui/drawer';
import { MudButton, MudIconButton } from 'ngx-mud-ui/button';

const WRAP = 'display:flex;gap:12px;flex-wrap:wrap;padding:24px';

const PARAGRAPHS = [
  'Selectați categoriile de servicii pe care doriți să le vedeți în listă.',
  'Puteți combina mai multe filtre; rezultatele se actualizează după ce apăsați „Aplică”.',
  'Filtrele rămân salvate pe durata sesiunii curente.',
];

const COOKIE_STYLE = `.story-cookie-drawer .drawer { --mud-drawer-radius: 16px; }`;

interface PlaygroundArgs {
  position: MudDrawerPosition;
  width: string;
  height: string;
  closeOnBackdrop: boolean;
  closeOnEscape: boolean;
}

/** Shared demo body: header with title + ×, text, one action. Consumer-owned chrome. */
@Component({
  selector: 'mud-drawer-story-panel',
  imports: [MudDrawerTitle, MudDrawerClose, MudButton, MudIconButton],
  template: `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:24px 24px 0">
      <h2 mudDrawerTitle style="margin:0;font-size:20px;line-height:28px">Filtre</h2>
      <button mudIconButton aria-label="Închide" mudDrawerClose>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20" focusable="false" aria-hidden="true">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M4.41 4.41a.833.833 0 0 1 1.18 0L10 8.821l4.41-4.41a.833.833 0 1 1 1.18 1.178L11.178 10l4.41 4.41a.833.833 0 0 1-1.178 1.18L10 11.178l-4.41 4.41a.833.833 0 0 1-1.18-1.178L8.821 10l-4.41-4.41a.833.833 0 0 1 0-1.18" />
        </svg>
      </button>
    </div>
    <div style="padding:16px 24px;flex:1 1 auto">
      @for (paragraph of paragraphs(); track $index) {
        <p>{{ paragraph }}</p>
      }
    </div>
    <div style="padding:16px 24px 24px">
      <button mudButton [mudDrawerClose]="'applied'">Aplică</button>
    </div>
  `,
  host: { style: 'display:contents' },
})
class StoryPanel {
  readonly paragraphs = input<readonly string[]>(PARAGRAPHS);
}

@Component({
  selector: 'mud-drawer-story-playground-content',
  imports: [StoryPanel],
  template: `<mud-drawer-story-panel [paragraphs]="paragraphs" />`,
  host: { style: 'display:contents' },
})
class PlaygroundContent {
  protected readonly paragraphs = Array.from({ length: 12 }, (_, i) => PARAGRAPHS[i % PARAGRAPHS.length]);
}

@Component({
  selector: 'mud-drawer-story-playground-launcher',
  imports: [MudButton],
  template: `<button mudButton (click)="openDrawer()">Deschide drawer-ul</button>`,
})
class PlaygroundLauncher {
  private readonly _drawer = inject(MudDrawer);

  readonly position = input<MudDrawerPosition>('right');
  readonly width = input('382px');
  readonly height = input('auto');
  readonly closeOnBackdrop = input(true);
  readonly closeOnEscape = input(true);

  openDrawer(): void {
    this._drawer.open<string>(PlaygroundContent, {
      position: this.position(),
      width: this.width(),
      height: this.height(),
      closeOnBackdrop: this.closeOnBackdrop(),
      closeOnEscape: this.closeOnEscape(),
    });
  }
}

@Component({
  selector: 'mud-drawer-story-close-launcher',
  imports: [MudButton],
  template: `<button mudButton (click)="open()">Deschide filtrele</button>`,
})
class WithCloseButtonLauncher {
  private readonly _drawer = inject(MudDrawer);

  open(): void {
    this._drawer.open<string>(StoryPanel);
  }
}

@Component({
  selector: 'mud-drawer-story-positions-launcher',
  imports: [MudButton],
  template: `
    @for (position of positions; track position) {
      <button mudButton="outlined" (click)="open(position)">{{ position }}</button>
    }
  `,
  host: { style: 'display:contents' },
})
class PositionsLauncher {
  private readonly _drawer = inject(MudDrawer);
  protected readonly positions: MudDrawerPosition[] = ['top', 'right', 'bottom', 'left'];

  open(position: MudDrawerPosition): void {
    this._drawer.open(StoryPanel, { position });
  }
}

@Component({
  selector: 'mud-drawer-story-cookie-content',
  imports: [MudButton, MudDrawerClose],
  template: `
    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:16px 24px;padding:24px;max-inline-size:1248px;margin-inline:auto">
      <p style="margin:0;flex:1 1 320px">
        Folosim cookie-uri pentru a îmbunătăți experiența pe platformă. Le puteți accepta pe toate sau
        doar pe cele strict necesare.
      </p>
      <div style="display:flex;gap:8px">
        <button mudButton="outlined" [mudDrawerClose]="'necessary'">Doar necesare</button>
        <button mudButton [mudDrawerClose]="'all'">Accept toate</button>
      </div>
    </div>
  `,
  host: { style: 'display:contents' },
})
class CookieContent {}

@Component({
  selector: 'mud-drawer-story-cookie-launcher',
  imports: [MudButton],
  template: `<button mudButton (click)="open()">Arată bannerul cookie</button>`,
  // Unscoped on purpose: the drawer renders in the overlay, outside this view —
  // the story equivalent of a rule in the app's global stylesheet.
  styles: [COOKIE_STYLE],
  encapsulation: ViewEncapsulation.None,
})
class CookieLauncher {
  private readonly _drawer = inject(MudDrawer);

  open(): void {
    this._drawer.open<'all' | 'necessary'>(CookieContent, {
      position: 'bottom',
      closeOnBackdrop: false,
      closeOnEscape: false,
      ariaLabel: 'Consimțământ cookie-uri',
      panelClass: 'story-cookie-drawer',
    });
  }
}

const TERMS = [
  'Prezentul document descrie modul în care sunt colectate, utilizate și protejate datele dumneavoastră cu caracter personal atunci când accesați serviciile publice electronice.',
  'Datele colectate includ numele, adresa, numărul de identificare (IDNP) și orice alte informații furnizate voluntar în cadrul cererilor depuse.',
  'Informațiile sunt utilizate exclusiv în scopul procesării cererilor dumneavoastră și al comunicării stadiului acestora.',
  'Datele nu sunt transmise către terți în scopuri comerciale și sunt păstrate doar pe durata necesară îndeplinirii obligațiilor legale.',
  'Aveți dreptul de a solicita accesul, rectificarea sau ștergerea datelor dumneavoastră, în condițiile legii privind protecția datelor cu caracter personal.',
  'Continuarea utilizării platformei după această dată presupune acceptarea termenilor actualizați.',
  'Pentru întrebări sau nelămuriri, contactați echipa de suport prin formularul disponibil pe site.',
];

/** Header and actions stay put; only the middle block scrolls (consumer CSS). */
@Component({
  selector: 'mud-drawer-story-scrollable-content',
  imports: [MudDrawerTitle, MudDrawerClose, MudButton, MudIconButton],
  template: `
    <div class="terms__header">
      <h2 mudDrawerTitle style="margin:0;font-size:20px;line-height:28px">Termeni și condiții</h2>
      <button mudIconButton aria-label="Închide" mudDrawerClose>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20" focusable="false" aria-hidden="true">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M4.41 4.41a.833.833 0 0 1 1.18 0L10 8.821l4.41-4.41a.833.833 0 1 1 1.18 1.178L11.178 10l4.41 4.41a.833.833 0 0 1-1.178 1.18L10 11.178l-4.41 4.41a.833.833 0 0 1-1.18-1.178L8.821 10l-4.41-4.41a.833.833 0 0 1 0-1.18" />
        </svg>
      </button>
    </div>
    <!-- Focusable + named so keyboard users can scroll text that has no controls in it. -->
    <div class="terms__body" tabindex="0" role="region" aria-label="Textul termenilor">
      @for (paragraph of paragraphs; track $index) {
        <p>{{ paragraph }}</p>
      }
    </div>
    <div class="terms__actions">
      <button mudButton="outlined" [mudDrawerClose]="false">Refuz</button>
      <button mudButton [mudDrawerClose]="true">Accept</button>
    </div>
  `,
  styles: `
    :host { display: contents; }
    .terms__header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 24px 24px 16px; }
    /* The scroll region: min-height 0 lets the flex child shrink below its content. */
    .terms__body { flex: 1 1 auto; min-height: 0; overflow-y: auto; padding: 0 24px; }
    .terms__body:focus-visible {
      outline: var(--mud-focus-ring-outer-width, 3px) solid var(--mud-focus-ring-outer-color, #1a73e8);
      outline-offset: calc(-1 * var(--mud-focus-ring-outer-width, 3px));
    }
    .terms__actions { display: flex; justify-content: flex-end; gap: 8px; padding: 16px 24px 24px; }
  `,
})
class TermsContent {
  protected readonly paragraphs = [...TERMS, ...TERMS, ...TERMS];
}

@Component({
  selector: 'mud-drawer-story-scrollable-launcher',
  imports: [MudButton],
  template: `<button mudButton (click)="open()">Citește termenii</button>`,
})
class ScrollableLauncher {
  private readonly _drawer = inject(MudDrawer);

  open(): void {
    this._drawer.open<boolean>(TermsContent);
  }
}

const INJECT = `private readonly drawer = inject(MudDrawer);`;

const PANEL_SOURCE = `@Component({
  selector: 'app-filters-drawer',
  imports: [MudDrawerTitle, MudDrawerClose, MudButton, MudIconButton],
  template: \`
    <header class="filters__header">
      <h2 mudDrawerTitle>Filtre</h2>
      <!-- The × is yours: any button with mudDrawerClose closes the drawer. -->
      <button mudIconButton aria-label="Închide" mudDrawerClose><svg>…</svg></button>
    </header>
    <div class="filters__body">…</div>
    <button mudButton [mudDrawerClose]="'applied'">Aplică</button>
  \`,
})
export class FiltersDrawer {}`;

const playgroundSource = (args: PlaygroundArgs): string => `import { Component, inject } from '@angular/core';
import { MudDrawer, MudDrawerTitle, MudDrawerClose } from 'ngx-mud-ui/drawer';
import { MudButton, MudIconButton } from 'ngx-mud-ui/button';

${PANEL_SOURCE}

@Component({ selector: 'app-catalog', imports: [MudButton], template: \`<button mudButton (click)="filter()">Filtre</button>\` })
export class CatalogComponent {
  ${INJECT}

  filter(): void {
    const ref = this.drawer.open<string>(FiltersDrawer, {
      position: '${args.position}',
      width: '${args.width}',   // left/right only
      height: '${args.height}', // top/bottom only
      closeOnBackdrop: ${args.closeOnBackdrop},
      closeOnEscape: ${args.closeOnEscape},
    });

    ref.closed.subscribe(({ result, reason }) => console.log(result, reason));
  }
}`;

const CLOSE_SOURCE = `import { Component, inject } from '@angular/core';
import { MudDrawer, MudDrawerTitle, MudDrawerClose } from 'ngx-mud-ui/drawer';
import { MudButton, MudIconButton } from 'ngx-mud-ui/button';

${PANEL_SOURCE}

@Component({ selector: 'app-catalog', imports: [MudButton], template: \`<button mudButton (click)="filter()">Deschide filtrele</button>\` })
export class CatalogComponent {
  ${INJECT}

  filter(): void {
    this.drawer.open<string>(FiltersDrawer); // right, 382px
  }
}`;

const POSITIONS_SOURCE = `this.drawer.open(FiltersDrawer, { position: 'top' });
this.drawer.open(FiltersDrawer, { position: 'right' }); // default
this.drawer.open(FiltersDrawer, { position: 'bottom' });
this.drawer.open(FiltersDrawer, { position: 'left' });`;

const COOKIE_SOURCE = `import { Component, afterNextRender, inject } from '@angular/core';
import { MudDrawer, MudDrawerClose } from 'ngx-mud-ui/drawer';
import { MudButton } from 'ngx-mud-ui/button';

@Component({
  selector: 'app-cookie-banner',
  imports: [MudButton, MudDrawerClose],
  template: \`
    <p>Folosim cookie-uri pentru a îmbunătăți experiența pe platformă.</p>
    <button mudButton="outlined" [mudDrawerClose]="'necessary'">Doar necesare</button>
    <button mudButton [mudDrawerClose]="'all'">Accept toate</button>
  \`,
})
export class CookieBanner {}

/* global styles — round the page-facing corners */
// .cookie-drawer .drawer { --mud-drawer-radius: 16px; }

export class AppComponent {
  ${INJECT}

  constructor() {
    // Browser only: afterNextRender never runs during server-side rendering,
    // so no overlay markup ends up in the server HTML.
    afterNextRender(() => {
      this.drawer
        .open<'all' | 'necessary'>(CookieBanner, {
          position: 'bottom',          // height: auto = content height
          closeOnBackdrop: false,      // a choice is required:
          closeOnEscape: false,        // only the banner's own buttons close it
          ariaLabel: 'Consimțământ cookie-uri',
          panelClass: 'cookie-drawer',
        })
        .closed.subscribe(({ result }) => this.saveConsent(result));
    });
  }

  private saveConsent(choice: 'all' | 'necessary' | undefined): void {
    /* … */
  }
}`;

const SCROLLABLE_SOURCE = `import { Component, inject } from '@angular/core';
import { MudDrawer, MudDrawerTitle, MudDrawerClose } from 'ngx-mud-ui/drawer';
import { MudButton, MudIconButton } from 'ngx-mud-ui/button';

@Component({
  selector: 'app-terms-drawer',
  imports: [MudDrawerTitle, MudDrawerClose, MudButton, MudIconButton],
  template: \`
    <header class="terms__header">
      <h2 mudDrawerTitle>Termeni și condiții</h2>
      <button mudIconButton aria-label="Închide" mudDrawerClose><svg>…</svg></button>
    </header>
    <!-- tabindex + a name: keyboard users scroll the text by focusing it. -->
    <div class="terms__body" tabindex="0" role="region" aria-label="Textul termenilor">…</div>
    <footer class="terms__actions">
      <button mudButton="outlined" [mudDrawerClose]="false">Refuz</button>
      <button mudButton [mudDrawerClose]="true">Accept</button>
    </footer>
  \`,
  styles: \`
    /* The drawer is a flex column: let your three blocks be its children. */
    :host { display: contents; }

    /* Only the body scrolls. min-height: 0 lets it shrink below its content. */
    .terms__body { flex: 1 1 auto; min-height: 0; overflow-y: auto; }
    .terms__body:focus-visible { outline: 3px solid var(--mud-focus-ring-outer-color); outline-offset: -3px; }
  \`,
})
export class TermsDrawer {}

export class SignupComponent {
  ${INJECT}
  protected accepted = false;

  readTerms(): void {
    this.drawer.open<boolean>(TermsDrawer).closed.subscribe(({ result }) => (this.accepted = !!result));
  }
}`;

const meta: Meta<PlaygroundArgs> = {
  title: 'Components/Drawer',
  decorators: [moduleMetadata({ imports: [MudButton] })],
  // Hand-declared: the "component" is a service — nothing for compodoc to introspect.
  argTypes: {
    position: { control: 'select', options: ['top', 'right', 'bottom', 'left'] },
    width: { control: 'text', description: 'Left/right only. Full screen width at ≤480px.' },
    height: { control: 'text', description: 'Top/bottom only. `auto` = content height.' },
    closeOnBackdrop: { control: 'boolean' },
    closeOnEscape: { control: 'boolean' },
  },
  args: { position: 'right', width: '382px', height: 'auto', closeOnBackdrop: true, closeOnEscape: true },
};

export default meta;

type Story = StoryObj<PlaygroundArgs>;

export const Playground: Story = {
  parameters: {
    docs: { source: { language: 'ts', transform: (_c: string, ctx: { args: PlaygroundArgs }) => playgroundSource(ctx.args) } },
  },
  decorators: [moduleMetadata({ imports: [PlaygroundLauncher] })],
  render: (args) => ({
    props: args,
    template: `
      <div style="${WRAP}">
        <mud-drawer-story-playground-launcher
          [position]="position"
          [width]="width"
          [height]="height"
          [closeOnBackdrop]="closeOnBackdrop"
          [closeOnEscape]="closeOnEscape"
        />
      </div>
    `,
  }),
};

/** The close (×) button is consumer-owned: any element with `mudDrawerClose`. */
export const WithCloseButton: Story = {
  parameters: { controls: { disable: true }, docs: { source: { code: CLOSE_SOURCE, language: 'ts' } } },
  decorators: [moduleMetadata({ imports: [WithCloseButtonLauncher] })],
  render: () => ({ template: `<div style="${WRAP}"><mud-drawer-story-close-launcher /></div>` }),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Deschide filtrele' }));

    // The drawer renders in a CDK overlay under <body>, outside canvasElement.
    const drawer = document.querySelector('[role="dialog"]') as HTMLElement;
    const title = drawer.querySelector('h2') as HTMLElement;

    await expect(drawer.classList.contains('drawer--right')).toBe(true);
    await expect(drawer.getAttribute('aria-labelledby')).toBe(title.id);

    // Canvas must rest: close before the play ends (house rule).
    await userEvent.click(drawer.querySelector('[aria-label="Închide"]') as HTMLButtonElement);
    await expect(document.querySelector('[role="dialog"]')).toBeNull();
  },
};

/** One launcher per edge. */
export const Positions: Story = {
  parameters: { controls: { disable: true }, docs: { source: { code: POSITIONS_SOURCE, language: 'ts' } } },
  decorators: [moduleMetadata({ imports: [PositionsLauncher] })],
  render: () => ({ template: `<div style="${WRAP}"><mud-drawer-story-positions-launcher /></div>` }),
};

/** Bottom drawer, content height, rounded top corners, a choice is required. */
export const CookieBanner: Story = {
  parameters: { controls: { disable: true }, docs: { source: { code: COOKIE_SOURCE, language: 'ts' } } },
  decorators: [moduleMetadata({ imports: [CookieLauncher] })],
  render: () => ({
    template: `<div style="${WRAP}"><mud-drawer-story-cookie-launcher /></div>`,
  }),
};

/** Long content: the header and the actions stay put, only the middle block scrolls. */
export const ScrollableContent: Story = {
  parameters: { controls: { disable: true }, docs: { source: { code: SCROLLABLE_SOURCE, language: 'ts' } } },
  decorators: [moduleMetadata({ imports: [ScrollableLauncher] })],
  render: () => ({ template: `<div style="${WRAP}"><mud-drawer-story-scrollable-launcher /></div>` }),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Citește termenii' }));

    const drawer = document.querySelector('mud-drawer-container') as HTMLElement;
    const body = drawer.querySelector('.terms__body') as HTMLElement;
    const actions = drawer.querySelector('.terms__actions') as HTMLElement;

    // Let the slide-in land before measuring (rects include the transform).
    await Promise.all(drawer.getAnimations({ subtree: true }).map((animation) => animation.finished));
    const actionsTop = actions.getBoundingClientRect().top;

    // Keyboard users scroll it by focusing it: it must be a tab stop with a name.
    await expect(body.tabIndex).toBe(0);
    await expect(body.getAttribute('role')).toBe('region');
    await expect(body.getAttribute('aria-label')).toBeTruthy();

    // The body is the scroll region; the drawer itself must not scroll.
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    await expect(drawer.scrollHeight).toBe(drawer.clientHeight);

    body.scrollTop = body.scrollHeight;
    await expect(body.scrollTop).toBeGreaterThan(0);
    await expect(actions.getBoundingClientRect().top).toBe(actionsTop);
    await expect(actions.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight);

    // Canvas must rest: close before the play ends (house rule).
    await userEvent.click(drawer.querySelector('[aria-label="Închide"]') as HTMLButtonElement);
    await expect(document.querySelector('mud-drawer-container')).toBeNull();
  },
};
