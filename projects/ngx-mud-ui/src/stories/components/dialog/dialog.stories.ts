import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import type { TemplateRef } from '@angular/core';
import { Component, inject, input, viewChild } from '@angular/core';
import { expect, userEvent, within } from 'storybook/test';
import {
  MudDialog,
  MudDialogTitle,
  MudDialogContent,
  MudDialogActions,
  MudDialogClose,
  MudDialogImage,
} from 'ngx-mud-ui/dialog';
import type { MudDialogSize } from 'ngx-mud-ui/dialog';
import { MudButton } from 'ngx-mud-ui/button';

const WRAP = 'display:flex;padding:24px';

const HERO_IMAGE =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 280">` +
      `<rect width="560" height="280" fill="#20686f"/>` +
      `<circle cx="280" cy="150" r="90" fill="#ffffff" fill-opacity="0.18"/>` +
      `<circle cx="440" cy="60" r="40" fill="#ffffff" fill-opacity="0.12"/>` +
      `</svg>`,
  );

interface PlaygroundArgs {
  size: MudDialogSize;
  showCloseButton: boolean;
  closeOnBackdrop: boolean;
  closeOnEscape: boolean;
  closeLabel: string;
  autoFocus: string;
}

@Component({
  selector: 'mud-dialog-story-playground-content',
  imports: [MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose, MudButton],
  template: `
    <h2 mudDialogTitle>Confirmați modificările</h2>
    <div mudDialogContent>
      Acest dialog reflectă opțiunile <code>size</code>, <code>showCloseButton</code>,
      <code>closeOnBackdrop</code>, <code>closeOnEscape</code>, <code>closeLabel</code> și <code>autoFocus</code> alese în
      panoul Controls — redeschideți-l după fiecare schimbare ca să vedeți unde aterizează
      focusul.
    </div>
    <div mudDialogActions>
      <button mudButton="outlined" [mudDialogClose]="false">Anulează</button>
      <button mudButton [mudDialogClose]="true">Salvează</button>
    </div>
  `,
})
class PlaygroundDialogContent {}

@Component({
  selector: 'mud-dialog-story-playground-launcher',
  imports: [MudButton],
  template: `<button mudButton (click)="openDialog()">Deschide dialogul</button>`,
})
class PlaygroundLauncher {
  private readonly _dialog = inject(MudDialog);

  readonly size = input<MudDialogSize>('md');
  readonly showCloseButton = input(true);
  readonly closeOnBackdrop = input(true);
  readonly closeOnEscape = input(true);
  readonly closeLabel = input('Close');
  readonly autoFocus = input<string>('first-tabbable');

  openDialog(): void {
    this._dialog.open<boolean>(PlaygroundDialogContent, {
      size: this.size(),
      showCloseButton: this.showCloseButton(),
      closeOnBackdrop: this.closeOnBackdrop(),
      closeOnEscape: this.closeOnEscape(),
      closeLabel: this.closeLabel(),
      autoFocus: this.autoFocus(),
    });
  }
}

@Component({
  selector: 'mud-dialog-story-confirm-content',
  imports: [MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose, MudButton],
  template: `
    <h2 mudDialogTitle>Ștergeți documentul?</h2>
    <div mudDialogContent>Acțiunea nu poate fi anulată.</div>
    <div mudDialogActions>
      <button mudButton="outlined" [mudDialogClose]="false">Anulează</button>
      <button mudButton color="destructive" [mudDialogClose]="true">Șterge</button>
    </div>
  `,
})
class ConfirmDialogContent {}

@Component({
  selector: 'mud-dialog-story-confirm-launcher',
  imports: [MudButton],
  template: `<button mudButton color="destructive" (click)="open()">Șterge documentul…</button>`,
})
class ConfirmLauncher {
  private readonly _dialog = inject(MudDialog);

  open(): void {
    this._dialog.open<boolean>(ConfirmDialogContent, { size: 'sm' });
  }
}

@Component({
  selector: 'mud-dialog-story-image-content',
  imports: [MudDialogImage, MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose, MudButton],
  template: `
    <img mudDialogImage [src]="hero" alt="" style="height: 280px" />
    <h2 mudDialogTitle>Serviciile digitale, la un clic distanță</h2>
    <div mudDialogContent>
      Tabloul de bord a fost actualizat: găsiți rapid cele mai folosite servicii publice, direct pe
      prima pagină.
    </div>
    <div mudDialogActions>
      <button mudButton [mudDialogClose]="undefined">Am înțeles</button>
    </div>
  `,
})
class ImageDialogContent {
  protected readonly hero = HERO_IMAGE;
}

@Component({
  selector: 'mud-dialog-story-image-launcher',
  imports: [MudButton],
  template: `<button mudButton (click)="open()">Deschide cu imagine</button>`,
})
class ImageLauncher {
  private readonly _dialog = inject(MudDialog);

  open(): void {
    this._dialog.open(ImageDialogContent);
  }
}

@Component({
  selector: 'mud-dialog-story-stacked-content',
  imports: [MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose, MudButton],
  template: `
    <h2 mudDialogTitle>Sesiune expirată</h2>
    <div mudDialogContent>
      Sesiunea dumneavoastră a expirat din motive de securitate. Autentificați-vă din nou pentru a
      continua.
    </div>
    <div mudDialogActions layout="stacked">
      <button mudButton="outlined" [mudDialogClose]="false">Anulează</button>
      <button mudButton [mudDialogClose]="true">Autentificare</button>
    </div>
  `,
})
class StackedActionsContent {}

@Component({
  selector: 'mud-dialog-story-stacked-launcher',
  imports: [MudButton],
  template: `<button mudButton (click)="open()">Deschide cu acțiuni stivuite</button>`,
})
class StackedActionsLauncher {
  private readonly _dialog = inject(MudDialog);

  open(): void {
    this._dialog.open<boolean>(StackedActionsContent, { size: 'sm' });
  }
}

const LONG_PARAGRAPHS = [
  'Prezentul document descrie modul în care sunt colectate, utilizate și protejate datele dumneavoastră cu caracter personal atunci când accesați serviciile publice electronice.',
  'Datele colectate includ numele, adresa, numărul de identificare (IDNP) și orice alte informații furnizate voluntar în cadrul cererilor depuse.',
  'Informațiile sunt utilizate exclusiv în scopul procesării cererilor dumneavoastră și al comunicării stadiului acestora.',
  'Datele nu sunt transmise către terți în scopuri comerciale și sunt păstrate doar pe durata necesară îndeplinirii obligațiilor legale.',
  'Aveți dreptul de a solicita accesul, rectificarea sau ștergerea datelor dumneavoastră, în condițiile legii privind protecția datelor cu caracter personal.',
  'Continuarea utilizării platformei după această dată presupune acceptarea termenilor actualizați.',
  'Pentru întrebări sau nelămuriri, contactați echipa de suport prin formularul disponibil pe site.',
];

@Component({
  selector: 'mud-dialog-story-long-content',
  imports: [MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose, MudButton],
  template: `
    <h2 mudDialogTitle>
      Actualizare a Termenilor de Utilizare și a Politicii de Confidențialitate pentru Platforma
      Națională de Servicii Electronice
    </h2>
    <div mudDialogContent>
      @for (paragraph of paragraphs; track paragraph) {
        <p>{{ paragraph }}</p>
      }
    </div>
    <div mudDialogActions>
      <button mudButton="outlined" [mudDialogClose]="false">Refuz</button>
      <button mudButton [mudDialogClose]="true">Accept</button>
    </div>
  `,
})
class LongContentDialog {
  protected readonly paragraphs = LONG_PARAGRAPHS;
}

@Component({
  selector: 'mud-dialog-story-long-content-launcher',
  imports: [MudButton],
  template: `<button mudButton (click)="open()">Deschide conținut lung</button>`,
})
class LongContentLauncher {
  private readonly _dialog = inject(MudDialog);

  open(): void {
    this._dialog.open<boolean>(LongContentDialog);
  }
}

@Component({
  selector: 'mud-dialog-story-template-launcher',
  imports: [MudButton, MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose],
  template: `
    <button mudButton (click)="open()">Deschide din șablon</button>
    <ng-template #tpl let-data>
      <h2 mudDialogTitle>Distribuiți acest raport</h2>
      <div mudDialogContent>
        Oricine din organizația dumneavoastră cu acest link poate vizualiza „{{ data.reportName }}”.
      </div>
      <div mudDialogActions>
        <button mudButton="outlined" [mudDialogClose]="undefined">Închide</button>
      </div>
    </ng-template>
  `,
})
class TemplateLauncher {
  private readonly _dialog = inject(MudDialog);
  private readonly _tpl = viewChild.required<TemplateRef<unknown>>('tpl');

  open(): void {
    this._dialog.open(this._tpl(), { data: { reportName: 'Raport T3 2026' }, size: 'sm' });
  }
}

const INJECT = `private readonly dialog = inject(MudDialog);`;

const playgroundSource = (args: PlaygroundArgs): string => `import { Component, inject } from '@angular/core';
import { MudDialog, MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose } from 'ngx-mud-ui/dialog';

@Component({
  selector: 'app-confirm-dialog',
  imports: [MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose],
  template: \`
    <h2 mudDialogTitle>Confirmați modificările</h2>
    <div mudDialogContent>Verificați datele înainte de a continua.</div>
    <div mudDialogActions>
      <button type="button" [mudDialogClose]="false">Anulează</button>
      <button type="button" [mudDialogClose]="true">Salvează</button>
    </div>
  \`,
})
export class ConfirmDialog {}

@Component({ selector: 'app-settings', template: \`<button type="button" (click)="edit()">Editează</button>\` })
export class SettingsComponent {
  ${INJECT}

  edit(): void {
    const ref = this.dialog.open<boolean>(ConfirmDialog, {
      size: '${args.size}',
      showCloseButton: ${args.showCloseButton},
      closeOnBackdrop: ${args.closeOnBackdrop},
      closeOnEscape: ${args.closeOnEscape},
      closeLabel: '${args.closeLabel}',
      autoFocus: '${args.autoFocus}',
    });

    ref.closed.subscribe(({ result, reason }) => console.log(result, reason));
  }
}`;

const CONFIRM_SOURCE = `import { Component, inject } from '@angular/core';
import { MudDialog, MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose } from 'ngx-mud-ui/dialog';
import { MudButton } from 'ngx-mud-ui/button';

@Component({
  selector: 'app-delete-dialog',
  imports: [MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose, MudButton],
  template: \`
    <h2 mudDialogTitle>Ștergeți documentul?</h2>
    <div mudDialogContent>Acțiunea nu poate fi anulată.</div>
    <div mudDialogActions>
      <button mudButton="outlined" [mudDialogClose]="false">Anulează</button>
      <button mudButton color="destructive" [mudDialogClose]="true">Șterge</button>
    </div>
  \`,
})
export class DeleteDialog {}

@Component({
  selector: 'app-document-row',
  imports: [MudButton],
  template: \`<button mudButton color="destructive" (click)="confirm()">Șterge documentul…</button>\`,
})
export class DocumentRowComponent {
  ${INJECT}

  confirm(): void {
    // mudDialogClose passes its value straight through as the result.
    this.dialog.open<boolean>(DeleteDialog, { size: 'sm' }).closed.subscribe(({ result }) => {
      if (result) this.delete();
    });
  }

  private delete(): void {
    /* … */
  }
}`;

const IMAGE_SOURCE = `import { Component, inject } from '@angular/core';
import { MudDialog, MudDialogImage, MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose } from 'ngx-mud-ui/dialog';
import { MudButton } from 'ngx-mud-ui/button';

@Component({
  selector: 'app-whats-new-dialog',
  imports: [MudDialogImage, MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose, MudButton],
  template: \`
    <!-- mudDialogImage is full-bleed; height is yours to set. -->
    <img mudDialogImage src="/assets/hero.svg" alt="" style="height: 280px" />
    <h2 mudDialogTitle>Serviciile digitale, la un clic distanță</h2>
    <div mudDialogContent>Tabloul de bord a fost actualizat.</div>
    <div mudDialogActions>
      <button mudButton [mudDialogClose]="undefined">Am înțeles</button>
    </div>
  \`,
})
export class WhatsNewDialog {}

@Component({ selector: 'app-shell', imports: [MudButton], template: \`<button mudButton (click)="announce()">Noutăți</button>\` })
export class ShellComponent {
  ${INJECT}

  announce(): void {
    this.dialog.open(WhatsNewDialog); // md is the default size
  }
}`;

const STACKED_SOURCE = `import { Component, inject } from '@angular/core';
import { MudDialog, MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose } from 'ngx-mud-ui/dialog';
import { MudButton } from 'ngx-mud-ui/button';

@Component({
  selector: 'app-session-dialog',
  imports: [MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose, MudButton],
  template: \`
    <h2 mudDialogTitle>Sesiune expirată</h2>
    <div mudDialogContent>Autentificați-vă din nou pentru a continua.</div>

    <!-- layout="stacked" forces one action per row at any width; the container
         also auto-stacks below 480px, so this is only for deliberate stacking. -->
    <div mudDialogActions layout="stacked">
      <button mudButton="outlined" [mudDialogClose]="false">Anulează</button>
      <button mudButton [mudDialogClose]="true">Autentificare</button>
    </div>
  \`,
})
export class SessionDialog {}

@Component({ selector: 'app-session-guard', imports: [MudButton], template: \`<button mudButton (click)="prompt()">Simulează expirarea</button>\` })
export class SessionGuardComponent {
  ${INJECT}

  prompt(): void {
    this.dialog.open<boolean>(SessionDialog, { size: 'sm' });
  }
}`;

const LONG_CONTENT_SOURCE = `import { Component, inject } from '@angular/core';
import { MudDialog, MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose } from 'ngx-mud-ui/dialog';
import { MudButton } from 'ngx-mud-ui/button';

@Component({
  selector: 'app-terms-dialog',
  imports: [MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose, MudButton],
  template: \`
    <h2 mudDialogTitle>Actualizare a Termenilor de Utilizare</h2>

    <!-- mudDialogContent IS the scroll region: the title and the action row stay
         pinned while only this element scrolls. Do not add your own wrapper. -->
    <div mudDialogContent>
      @for (paragraph of paragraphs; track paragraph) {
        <p>{{ paragraph }}</p>
      }
    </div>

    <div mudDialogActions>
      <button mudButton="outlined" [mudDialogClose]="false">Refuz</button>
      <button mudButton [mudDialogClose]="true">Accept</button>
    </div>
  \`,
})
export class TermsDialog {
  protected readonly paragraphs: readonly string[] = [/* … */];
}

@Component({ selector: 'app-terms-gate', imports: [MudButton], template: \`<button mudButton (click)="review()">Citește termenii</button>\` })
export class TermsGateComponent {
  ${INJECT}

  review(): void {
    this.dialog.open<boolean>(TermsDialog);
  }
}`;

const TEMPLATE_SOURCE = `import { Component, inject, viewChild } from '@angular/core';
import type { TemplateRef } from '@angular/core';
import { MudDialog, MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose } from 'ngx-mud-ui/dialog';
import { MudButton } from 'ngx-mud-ui/button';

@Component({
  selector: 'app-report-row',
  imports: [MudButton, MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose],
  template: \`
    <button mudButton (click)="share()">Distribuie…</button>

    <!-- \\\`let-data\\\` receives the config's \\\`data\\\` object. Use a template instead of
         a component when the body is small and needs the host's own state. -->
    <ng-template #tpl let-data>
      <h2 mudDialogTitle>Distribuiți acest raport</h2>
      <div mudDialogContent>Oricine cu acest link poate vizualiza „{{ data.reportName }}”.</div>
      <div mudDialogActions>
        <button mudButton="outlined" [mudDialogClose]="undefined">Închide</button>
      </div>
    </ng-template>
  \`,
})
export class ReportRowComponent {
  ${INJECT}
  private readonly tpl = viewChild.required<TemplateRef<unknown>>('tpl');

  share(): void {
    this.dialog.open(this.tpl(), { data: { reportName: 'Raport T3 2026' }, size: 'sm' });
  }
}`;

const meta: Meta<PlaygroundArgs> = {
  title: 'Components/Dialog',
  decorators: [moduleMetadata({ imports: [MudButton] })],
  // Hand-declared: the "component" here is a service, so there is nothing for
  // Storybook/compodoc to introspect for controls.
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    showCloseButton: { control: 'boolean' },
    closeOnBackdrop: { control: 'boolean' },
    closeOnEscape: { control: 'boolean' },
    closeLabel: { control: 'text' },
    autoFocus: {
      control: 'select',
      options: ['first-tabbable', 'dialog', 'first-heading', '.dialog__close'],
      description:
        'CDK passthrough deciding where focus lands on open. Keywords resolve inside the container; a CSS selector (e.g. `.dialog__close`) is resolved document-wide.',
    },
  },
  args: {
    size: 'md',
    showCloseButton: true,
    closeOnBackdrop: true,
    closeOnEscape: true,
    closeLabel: 'Close',
    autoFocus: 'first-tabbable',
  },
};

export default meta;

type Story = StoryObj<PlaygroundArgs>;

export const Playground: Story = {
  parameters: {
    // `transform`, not a static `code`: the snippet is rebuilt from the live
    // args, so changing a control updates the open() config shown below.
    docs: { source: { language: 'ts', transform: (_c: string, ctx: { args: PlaygroundArgs }) => playgroundSource(ctx.args) } },
  },
  decorators: [moduleMetadata({ imports: [PlaygroundLauncher] })],
  render: (args) => ({
    props: args,
    template: `
      <div style="${WRAP}">
        <mud-dialog-story-playground-launcher
          [size]="size"
          [showCloseButton]="showCloseButton"
          [closeOnBackdrop]="closeOnBackdrop"
          [closeOnEscape]="closeOnEscape"
          [closeLabel]="closeLabel"
          [autoFocus]="autoFocus"
        />
      </div>
    `,
  }),
};

/** Title + body + two actions wired via `mudDialogClose`. */
export const Confirm: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: CONFIRM_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [ConfirmLauncher] })],
  render: () => ({ template: `<div style="${WRAP}"><mud-dialog-story-confirm-launcher /></div>` }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Șterge documentul…' }));

    // The container renders into a CDK overlay attached to <body>, outside
    // canvasElement — query the document directly, as the date-picker
    // overlay play functions do.
    const dialog = document.querySelector('[role="dialog"]');
    const title = document.querySelector('.dialog__title');

    await expect(dialog).toBeTruthy();
    await expect(dialog?.getAttribute('aria-labelledby')).toBe(title?.id);

    // Canvas must rest: close the dialog before the play ends (house rule).
    const cancel = Array.from(dialog?.querySelectorAll('button') ?? []).find(
      (button) => button.textContent?.trim() === 'Anulează',
    ) as HTMLButtonElement;

    await userEvent.click(cancel);
    await expect(document.querySelector('[role="dialog"]')).toBeNull();
  },
};

/** A full-bleed hero image; the recommended height is 280px desktop / 180px mobile. */
export const WithImage: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: IMAGE_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [ImageLauncher] })],
  render: () => ({ template: `<div style="${WRAP}"><mud-dialog-story-image-launcher /></div>` }),
};

/** `layout="stacked"`: full-width buttons in a column, primary on top. */
export const StackedActions: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: STACKED_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [StackedActionsLauncher] })],
  render: () => ({ template: `<div style="${WRAP}"><mud-dialog-story-stacked-launcher /></div>` }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Deschide cu acțiuni stivuite' }));

    // Stacked buttons must fill the footer's content box — the base .mud-btn
    // max-width: 400px cap regressed this once (user-caught): width beats
    // nothing, max-width beats width.
    // Rect measurements include the enter animation's scale(0.95) — wait for
    // every animation on the card to land before measuring (no timeouts).
    const card = document.querySelector('.dialog') as HTMLElement;

    await Promise.all(card.getAnimations({ subtree: true }).map((animation) => animation.finished));
    const actions = document.querySelector('.dialog__actions--stacked') as HTMLElement;
    const buttons = Array.from(actions.querySelectorAll<HTMLButtonElement>('button'));
    const styles = getComputedStyle(actions);
    const contentWidth =
      actions.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);

    await expect(buttons.length).toBe(2);
    for (const button of buttons) {
      await expect(Math.abs(button.getBoundingClientRect().width - contentWidth)).toBeLessThan(1);
    }

    // Canvas must rest: close the dialog before the play ends (house rule).
    await userEvent.click(buttons.find((button) => button.textContent?.includes('Anulează'))!);
    await expect(document.querySelector('[role="dialog"]')).toBeNull();
  },
};

/** A long body scrolls inside a pinned header/footer; a long title clamps at 3 lines. */
export const LongContent: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: LONG_CONTENT_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [LongContentLauncher] })],
  render: () => ({ template: `<div style="${WRAP}"><mud-dialog-story-long-content-launcher /></div>` }),
};

/** `MudDialog.open()` also accepts a `TemplateRef`; `config.data` lands as `let-data`. */
export const FromTemplate: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: TEMPLATE_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [TemplateLauncher] })],
  render: () => ({ template: `<div style="${WRAP}"><mud-dialog-story-template-launcher /></div>` }),
};
