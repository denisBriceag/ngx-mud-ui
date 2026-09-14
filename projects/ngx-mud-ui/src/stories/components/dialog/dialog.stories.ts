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
  disableClose: boolean;
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
      <code>disableClose</code>, <code>closeLabel</code> și <code>autoFocus</code> alese în
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
  readonly disableClose = input(false);
  readonly closeLabel = input('Close');
  readonly autoFocus = input<string>('first-tabbable');

  openDialog(): void {
    this._dialog.open<boolean>(PlaygroundDialogContent, {
      size: this.size(),
      showCloseButton: this.showCloseButton(),
      disableClose: this.disableClose(),
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

const meta: Meta<PlaygroundArgs> = {
  title: 'Components/Dialog',
  decorators: [moduleMetadata({ imports: [MudButton] })],
  // Hand-declared: the "component" here is a service, so there is nothing for
  // Storybook/compodoc to introspect for controls.
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    showCloseButton: { control: 'boolean' },
    disableClose: { control: 'boolean' },
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
    disableClose: false,
    closeLabel: 'Close',
    autoFocus: 'first-tabbable',
  },
};

export default meta;

type Story = StoryObj<PlaygroundArgs>;

export const Playground: Story = {
  decorators: [moduleMetadata({ imports: [PlaygroundLauncher] })],
  render: (args) => ({
    props: args,
    template: `
      <div style="${WRAP}">
        <mud-dialog-story-playground-launcher
          [size]="size"
          [showCloseButton]="showCloseButton"
          [disableClose]="disableClose"
          [closeLabel]="closeLabel"
          [autoFocus]="autoFocus"
        />
      </div>
    `,
  }),
};

/** Title + body + two actions wired via `mudDialogClose`. */
export const Confirm: Story = {
  parameters: { controls: { disable: true } },
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
  parameters: { controls: { disable: true } },
  decorators: [moduleMetadata({ imports: [ImageLauncher] })],
  render: () => ({ template: `<div style="${WRAP}"><mud-dialog-story-image-launcher /></div>` }),
};

/** `layout="stacked"`: full-width buttons in a column, primary on top. */
export const StackedActions: Story = {
  parameters: { controls: { disable: true } },
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
  parameters: { controls: { disable: true } },
  decorators: [moduleMetadata({ imports: [LongContentLauncher] })],
  render: () => ({ template: `<div style="${WRAP}"><mud-dialog-story-long-content-launcher /></div>` }),
};

/** `MudDialog.open()` also accepts a `TemplateRef`; `config.data` lands as `let-data`. */
export const FromTemplate: Story = {
  parameters: { controls: { disable: true } },
  decorators: [moduleMetadata({ imports: [TemplateLauncher] })],
  render: () => ({ template: `<div style="${WRAP}"><mud-dialog-story-template-launcher /></div>` }),
};
