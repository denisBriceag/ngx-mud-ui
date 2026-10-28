import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { applicationConfig } from '@storybook/angular-vite';
import { Component, inject, input } from '@angular/core';
import { MUD_TOAST_DEFAULT_OPTIONS, MudToast } from 'ngx-mud-ui/toast';
import type {
  MudToastHorizontalPosition,
  MudToastVariant,
  MudToastVerticalPosition,
} from 'ngx-mud-ui/toast';
import { MudButton } from 'ngx-mud-ui/button';
import { MudDialog, MudDialogActions, MudDialogClose, MudDialogContent, MudDialogTitle } from 'ngx-mud-ui/dialog';

const quote = (value: string) => `'${value.replace(/'/g, "\\'")}'`;

const playgroundSource = (args: Record<string, unknown>): string => {
  const data = [
    ...(args['title'] ? [`title: ${quote(String(args['title']))}`] : []),
    `message: ${quote(String(args['message']))}`,
  ];
  const config = [
    `variant: ${quote(String(args['variant']))}`,
    `duration: ${args['duration']}`,
    `pauseOnHover: ${args['pauseOnHover']}`,
    `showCloseButton: ${args['showCloseButton']}`,
    `closeLabel: ${quote(String(args['closeLabel']))}`,
    ...(args['announcementMessage'] ? [`announcementMessage: ${quote(String(args['announcementMessage']))}`] : []),
    `horizontalPosition: ${quote(String(args['horizontalPosition']))}`,
    `verticalPosition: ${quote(String(args['verticalPosition']))}`,
    `data: { ${data.join(', ')} }`,
  ];

  return `import { Component, inject } from '@angular/core';
import { MudToast } from 'ngx-mud-ui/toast';

@Component({
  selector: 'app-checkout',
  template: \`<button type="button" (click)="submit()">Trimite cererea</button>\`,
})
export class CheckoutComponent {
  private readonly toast = inject(MudToast);

  submit(): void {
    this.toast.open({
      ${config.join(',\n      ')},
    });
  }
}`;
};

const VARIANTS_SOURCE = `import { Component, inject } from '@angular/core';
import { MudToast } from 'ngx-mud-ui/toast';
import type { MudToastVariant } from 'ngx-mud-ui/toast';

@Component({
  selector: 'app-variant-demo',
  template: \`
    <button type="button" (click)="show('info')">Info</button>
    <button type="button" (click)="show('success')">Succes</button>
    <button type="button" (click)="show('warning')">Avertisment</button>
    <button type="button" (click)="show('error')">Eroare</button>
  \`,
})
export class VariantDemoComponent {
  private readonly toast = inject(MudToast);

  show(variant: MudToastVariant): void {
    this.toast.open({
      variant,
      duration: 0, // pinned open so the four can be compared side by side
      data: { title: 'Titlu opțional', message: 'Mesajul toastului.' },
    });
  }
}`;

const STACKING_SOURCE = `import { Component, inject } from '@angular/core';
import { MudToast } from 'ngx-mud-ui/toast';

@Component({
  selector: 'app-sync-status',
  template: \`<button type="button" (click)="burst()">Sincronizează</button>\`,
})
export class SyncStatusComponent {
  private readonly toast = inject(MudToast);

  burst(): void {
    // Two success toasts sit 8px apart; the error that follows opens the gap to
    // 18px. With the default maxVisible of 3, the last two queue and promote as
    // the visible ones are dismissed.
    this.toast.open({ variant: 'success', duration: 0, data: { message: 'Document încărcat.' } });
    this.toast.open({ variant: 'success', duration: 0, data: { message: 'Semnătura aplicată.' } });
    this.toast.open({ variant: 'error', duration: 0, data: { message: 'Plata a eșuat.' } });
    this.toast.open({ variant: 'warning', duration: 0, data: { message: 'Sesiunea expiră în curând.' } });
    this.toast.open({ variant: 'info', duration: 0, data: { message: 'Se sincronizează în fundal.' } });
  }
}`;

const MAX_VISIBLE_SOURCE = `import { ApplicationConfig } from '@angular/core';
import { MUD_TOAST_DEFAULT_OPTIONS } from 'ngx-mud-ui/toast';

// Every field of the open() config can be defaulted app-wide here, plus
// maxVisible, which is the only setting NOT available per-toast.
export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: MUD_TOAST_DEFAULT_OPTIONS,
      useValue: {
        maxVisible: 1, // this story: one at a time, the rest queue
        duration: 6000, // and a longer default dismiss delay
      },
    },
  ],
};

// Nothing changes at the call site — the service reads the token itself.
@Component({
  selector: 'app-queue-demo',
  template: \`<button type="button" (click)="burst()">Deschide trei</button>\`,
})
export class QueueDemoComponent {
  private readonly toast = inject(MudToast);

  burst(): void {
    this.toast.open({ variant: 'info', duration: 0, data: { message: 'Primul.' } });
    this.toast.open({ variant: 'info', duration: 0, data: { message: 'Al doilea.' } });
    this.toast.open({ variant: 'info', duration: 0, data: { message: 'Al treilea.' } });
  }
}`;

@Component({
  selector: 'mud-toast-story-playground',
  imports: [MudButton],
  template: `<button mudButton (click)="show()">Afișează toastul</button>`,
})
class ToastPlaygroundLauncher {
  private readonly _toast = inject(MudToast);

  readonly variant = input<MudToastVariant>('info');
  readonly title = input('');
  readonly message = input('Cererea a fost trimisă.');
  readonly duration = input(4000);
  readonly pauseOnHover = input(true);
  readonly showCloseButton = input(true);
  readonly closeLabel = input('Close');
  readonly announcementMessage = input('');
  readonly horizontalPosition = input<MudToastHorizontalPosition>('end');
  readonly verticalPosition = input<MudToastVerticalPosition>('top');

  show(): void {
    this._toast.open({
      variant: this.variant(),
      duration: this.duration(),
      pauseOnHover: this.pauseOnHover(),
      showCloseButton: this.showCloseButton(),
      closeLabel: this.closeLabel(),
      announcementMessage: this.announcementMessage() || undefined,
      horizontalPosition: this.horizontalPosition(),
      verticalPosition: this.verticalPosition(),
      data: { title: this.title() || undefined, message: this.message() },
    });
  }
}

const meta: Meta<ToastPlaygroundLauncher> = {
  title: 'Components/Toast',
  component: ToastPlaygroundLauncher,
};

export default meta;
type Story = StoryObj<ToastPlaygroundLauncher>;

// Every advertised config field is BOUND below. An unbound arg renders an inert
// Controls row with no error, which is easy to ship by accident.
export const Playground: Story = {
  args: {
    variant: 'info',
    title: '',
    message: 'Cererea a fost trimisă.',
    duration: 4000,
    pauseOnHover: true,
    showCloseButton: true,
    closeLabel: 'Close',
    announcementMessage: '',
    horizontalPosition: 'end',
    verticalPosition: 'top',
  },
  argTypes: {
    variant: { control: 'select', options: ['info', 'warning', 'success', 'error'] },
    horizontalPosition: { control: 'select', options: ['start', 'center', 'end', 'left', 'right'] },
    verticalPosition: { control: 'inline-radio', options: ['top', 'bottom'] },
  },
  parameters: {
    // `transform` rather than a static `code`: the snippet is rebuilt from the
    // live args, so changing a control updates the open() call shown below.
    docs: { source: { language: 'ts', transform: (_code: string, ctx: { args: Record<string, unknown> }) => playgroundSource(ctx.args) } },
  },
};

@Component({
  selector: 'mud-toast-story-variants',
  imports: [MudButton],
  template: `
    <button mudButton (click)="show('info')">Info</button>
    <button mudButton (click)="show('success')">Succes</button>
    <button mudButton (click)="show('warning')">Avertisment</button>
    <button mudButton="outlined" color="destructive" (click)="show('error')">Eroare</button>
  `,
})
class ToastVariantsLauncher {
  private readonly _toast = inject(MudToast);

  show(variant: MudToastVariant): void {
    this._toast.open({
      variant,
      duration: 0,
      data: {
        title: 'Titlu opțional',
        message: 'Mesajul toastului, cu un rând suficient de lung cât să treacă pe al doilea rând.',
      },
    });
  }
}

/** One toast per variant, each pinned open (`duration: 0`) for visual comparison. */
export const Variants: Story = {
  render: () => ({ template: `<mud-toast-story-variants />`, moduleMetadata: { imports: [ToastVariantsLauncher] } }),
  parameters: {
    controls: { disable: true },
    docs: { source: { code: VARIANTS_SOURCE, language: 'ts' } },
  },
};

@Component({
  selector: 'mud-toast-story-stacking',
  imports: [MudButton],
  template: `<button mudButton (click)="burst()">Deschide un grup de cinci</button>`,
})
class ToastStackingLauncher {
  private readonly _toast = inject(MudToast);

  burst(): void {
    // Two success toasts (8px apart), then an error (18px apart) — the gap rule.
    // Default maxVisible is 3, so the warning and info that follow queue up and
    // only appear once one of the first three is dismissed.
    this._toast.open({ variant: 'success', duration: 0, data: { message: 'Document încărcat.' } });
    this._toast.open({ variant: 'success', duration: 0, data: { message: 'Semnătura aplicată.' } });
    this._toast.open({ variant: 'error', duration: 0, data: { message: 'Plata a eșuat.' } });
    this._toast.open({ variant: 'warning', duration: 0, data: { message: 'Sesiunea expiră în curând.' } });
    this._toast.open({ variant: 'info', duration: 0, data: { message: 'Se sincronizează în fundal.' } });
  }
}

/** Five toasts against the default `maxVisible: 3` — the last two wait in the queue and promote as the visible ones are dismissed. */
export const Stacking: Story = {
  render: () => ({ template: `<mud-toast-story-stacking />`, moduleMetadata: { imports: [ToastStackingLauncher] } }),
  parameters: {
    controls: { disable: true },
    docs: { source: { code: STACKING_SOURCE, language: 'ts' } },
  },
};

@Component({
  selector: 'mud-toast-story-max-visible',
  imports: [MudButton],
  template: `<button mudButton (click)="burst()">Deschide trei</button>`,
})
class ToastMaxVisibleLauncher {
  private readonly _toast = inject(MudToast);

  burst(): void {
    this._toast.open({ variant: 'info', duration: 0, data: { message: 'Primul.' } });
    this._toast.open({ variant: 'info', duration: 0, data: { message: 'Al doilea.' } });
    this._toast.open({ variant: 'info', duration: 0, data: { message: 'Al treilea.' } });
  }
}

/** `maxVisible` is the one setting that cannot be passed per toast — it comes from `MUD_TOAST_DEFAULT_OPTIONS`. This story provides `maxVisible: 1`, so three toasts surface one at a time. */
export const AppWideDefaults: Story = {
  decorators: [
    applicationConfig({
      providers: [{ provide: MUD_TOAST_DEFAULT_OPTIONS, useValue: { maxVisible: 1, duration: 6000 } }],
    }),
  ],
  render: () => ({
    template: `<mud-toast-story-max-visible />`,
    moduleMetadata: { imports: [ToastMaxVisibleLauncher] },
  }),
  parameters: {
    controls: { disable: true },
    docs: { source: { code: MAX_VISIBLE_SOURCE, language: 'ts' } },
  },
};

@Component({
  selector: 'mud-toast-story-dialog-content',
  imports: [MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose, MudButton],
  template: `
    <h2 mudDialogTitle>Trimiteți cererea?</h2>
    <div mudDialogContent>Toast-ul deschis înainte rămâne vizibil deasupra acestui dialog.</div>
    <div mudDialogActions>
      <button mudButton [mudDialogClose]="true">Trimite</button>
    </div>
  `,
})
class ToastOverDialogContent {}

@Component({
  selector: 'mud-toast-story-over-dialog',
  imports: [MudButton],
  template: `<button mudButton (click)="saveThenConfirm()">Salvează și trimite</button>`,
})
class ToastOverDialogLauncher {
  private readonly _toast = inject(MudToast);
  private readonly _dialog = inject(MudDialog);

  saveThenConfirm(): void {
    const ref = this._toast.open({ variant: 'success', duration: 0, data: { message: 'Modificările au fost salvate.' } });

    // Open the dialog once the toast has finished entering — the order that used to bury it.
    ref.opened.subscribe(() => this._dialog.open(ToastOverDialogContent, { size: 'sm' }));
  }
}

const OVER_DIALOG_SOURCE = `// Nothing to configure: a toast stays above dialogs, drawers and other overlays,
// even when it was opened first.
const ref = this.toast.open({ variant: 'success', data: { message: 'Modificările au fost salvate.' } });

ref.opened.subscribe(() => this.dialog.open(ConfirmDialog));`;

/** A toast opened BEFORE a dialog still sits above the dialog and its backdrop. */
export const OverADialog: Story = {
  render: () => ({ template: `<mud-toast-story-over-dialog />`, moduleMetadata: { imports: [ToastOverDialogLauncher] } }),
  parameters: {
    controls: { disable: true },
    docs: { source: { code: OVER_DIALOG_SOURCE, language: 'ts' } },
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Salvează și trimite' }));

    // Overlays render outside canvasElement (CDK overlay container under <body>).
    await waitFor(() => expect(document.querySelector('.mud-toast')).toBeTruthy());
    const toast = document.querySelector('.mud-toast') as HTMLElement;
    // Captured while the slide-in still runs (the dialog only opens once it ends).
    // A replay would cancel it and create a NEW animation object. Guards the
    // re-show: it is replay-free only because CDK's display:flex on the overlay
    // host keeps the briefly hidden popover rendered.
    const enter = toast.getAnimations();

    await waitFor(() => expect(document.querySelector('mud-dialog-container')).toBeTruthy());
    const dialog = document.querySelector('mud-dialog-container') as HTMLElement;

    await Promise.all(dialog.getAnimations({ subtree: true }).map((animation) => animation.finished));
    const box = toast.getBoundingClientRect();
    const topmost = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);

    // The toast, not the dialog's backdrop, is what the user sees and clicks.
    await expect(toast.contains(topmost)).toBe(true);
    await expect(toast.getAnimations().filter((animation) => !enter.includes(animation))).toHaveLength(0);

    // Canvas must rest: close the dialog, then the toast.
    await userEvent.click(within(dialog).getByRole('button', { name: 'Trimite' }));
    await waitFor(() => expect(document.querySelector('mud-dialog-container')).toBeNull());
    await userEvent.click(toast.querySelector('.mud-toast__close') as HTMLButtonElement);
    await waitFor(() => expect(document.querySelector('.mud-toast')).toBeNull());
  },
};
