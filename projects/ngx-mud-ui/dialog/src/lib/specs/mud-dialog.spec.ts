import type { TemplateRef } from '@angular/core';
import { ApplicationRef, Component, inject, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudDialog } from '../mud-dialog.service';
import { MudDialogRef } from '../mud-dialog-ref';
import { MUD_DIALOG_DATA } from '../mud-dialog-config';
import {
  MudDialogTitle,
  MudDialogContent,
  MudDialogActions,
  MudDialogClose,
  MudDialogImage,
} from '../mud-dialog-directives';

interface GreetingData {
  name: string;
  // Test-only hook: lets a spec observe the MudDialogRef the opened component actually received.
  capture?: (ref: MudDialogRef<string>) => void;
}

@Component({
  template: `<p class="greeting">Hello {{ data.name }}</p>`,
})
class GreetingDialog {
  readonly data = inject<GreetingData>(MUD_DIALOG_DATA);
  readonly ref = inject<MudDialogRef<string>>(MudDialogRef);

  constructor() {
    this.data.capture?.(this.ref);
  }
}

@Component({
  template: `<ng-template #tpl><p class="tpl-content">Template body</p></ng-template>`,
})
class TplHost {
  readonly tpl = viewChild.required<TemplateRef<unknown>>('tpl');
}

@Component({
  imports: [MudDialogTitle, MudDialogContent, MudDialogActions, MudDialogClose, MudDialogImage],
  template: `
    <img mudDialogImage src="hero.png" alt="" />
    <h2 mudDialogTitle>Sigur ștergeți?</h2>
    <div mudDialogContent>Acțiunea nu poate fi anulată.</div>
    <div mudDialogActions>
      <button type="button" class="cancel" [mudDialogClose]="false">Anulează</button>
      <button type="button" class="confirm" [mudDialogClose]="true">Șterge</button>
    </div>
  `,
})
class ConfirmDialog {}

@Component({
  imports: [MudDialogActions],
  template: `<div mudDialogActions layout="stacked">
    <button type="button">Primary</button>
  </div>`,
})
class StackedActionsDialog {}

@Component({
  imports: [MudDialogClose],
  template: `<ng-template #tpl let-data
    ><button type="button" class="tpl-close" [mudDialogClose]="data.reportName"
      >Close</button
    ></ng-template
  >`,
})
class TplWithCloseHost {
  readonly tpl = viewChild.required<TemplateRef<unknown>>('tpl');
}

function overlayRoot(): HTMLElement {
  return document.querySelector('.cdk-overlay-container') as HTMLElement;
}

describe('MudDialog', () => {
  afterEach(() => {
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('opens a component in a mud-dialog-container with the md size class by default', async () => {
    const dialog = TestBed.inject(MudDialog);

    dialog.open(GreetingDialog, { data: { name: 'Ana' } });
    await TestBed.inject(ApplicationRef).whenStable();

    const container = overlayRoot().querySelector('mud-dialog-container') as HTMLElement;

    expect(container).toBeTruthy();
    expect(container.classList.contains('dialog--md')).toBe(true);
    expect(container.querySelector('.greeting')?.textContent).toContain('Hello Ana');
  });

  it('opens a TemplateRef', async () => {
    const fixture = TestBed.createComponent(TplHost);

    await fixture.whenStable();
    TestBed.inject(MudDialog).open(fixture.componentInstance.tpl());
    await TestBed.inject(ApplicationRef).whenStable();

    expect(overlayRoot().querySelector('.tpl-content')?.textContent).toContain('Template body');
  });

  it('close(result) resolves closed with reason action and removes the dialog', async () => {
    const dialog = TestBed.inject(MudDialog);
    const ref = dialog.open<string>(GreetingDialog, { data: { name: 'Ana' } });
    const outcomes: unknown[] = [];

    ref.closed.subscribe((outcome) => outcomes.push(outcome));
    ref.close('saved');
    await TestBed.inject(ApplicationRef).whenStable();

    expect(outcomes).toEqual([{ result: 'saved', reason: 'action' }]);
    expect(overlayRoot().querySelector('mud-dialog-container')).toBeNull();
  });

  it('applies size sm|lg as container classes', async () => {
    const dialog = TestBed.inject(MudDialog);

    dialog.open(GreetingDialog, { data: { name: 'x' }, size: 'lg' });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(
      overlayRoot().querySelector('mud-dialog-container')?.classList.contains('dialog--lg'),
    ).toBe(true);
  });

  it('injects the exact MudDialogRef instance that open() returned into the opened component', async () => {
    const dialog = TestBed.inject(MudDialog);
    let injectedRef: MudDialogRef<string> | undefined;

    const ref = dialog.open<string>(GreetingDialog, {
      data: { name: 'Ana', capture: (r: MudDialogRef<string>) => (injectedRef = r) },
    });

    await TestBed.inject(ApplicationRef).whenStable();

    expect(injectedRef).toBe(ref);
  });

  it('backdrop click closes with reason backdrop', async () => {
    const ref = TestBed.inject(MudDialog).open(GreetingDialog, { data: { name: 'x' } });
    const outcomes: unknown[] = [];

    ref.closed.subscribe((o) => outcomes.push(o));
    await TestBed.inject(ApplicationRef).whenStable();
    (document.querySelector('.cdk-overlay-backdrop') as HTMLElement).click();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(outcomes).toEqual([{ result: undefined, reason: 'backdrop' }]);
  });

  it('Escape closes with reason escape', async () => {
    const ref = TestBed.inject(MudDialog).open(GreetingDialog, { data: { name: 'x' } });
    const outcomes: unknown[] = [];

    ref.closed.subscribe((o) => outcomes.push(o));
    await TestBed.inject(ApplicationRef).whenStable();
    const container = overlayRoot().querySelector('mud-dialog-container') as HTMLElement;

    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await TestBed.inject(ApplicationRef).whenStable();

    expect(outcomes).toEqual([{ result: undefined, reason: 'escape' }]);
  });

  it('Escape with a modifier key does not close (parity with CdkDialog)', async () => {
    const ref = TestBed.inject(MudDialog).open(GreetingDialog, { data: { name: 'x' } });
    const outcomes: unknown[] = [];

    ref.closed.subscribe((o) => outcomes.push(o));
    await TestBed.inject(ApplicationRef).whenStable();
    const container = overlayRoot().querySelector('mud-dialog-container') as HTMLElement;

    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', shiftKey: true, bubbles: true }));
    await TestBed.inject(ApplicationRef).whenStable();

    expect(outcomes).toEqual([]);
    expect(overlayRoot().querySelector('mud-dialog-container')).toBeTruthy();
  });

  it('closeOnBackdrop false ignores a backdrop click but still closes on Escape', async () => {
    const ref = TestBed.inject(MudDialog).open(GreetingDialog, { data: { name: 'x' }, closeOnBackdrop: false });
    const outcomes: unknown[] = [];

    ref.closed.subscribe((o) => outcomes.push(o));
    await TestBed.inject(ApplicationRef).whenStable();
    (document.querySelector('.cdk-overlay-backdrop') as HTMLElement).click();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(outcomes).toEqual([]);
    expect(overlayRoot().querySelector('mud-dialog-container')).toBeTruthy();

    overlayRoot().querySelector('mud-dialog-container')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await TestBed.inject(ApplicationRef).whenStable();

    expect(outcomes).toEqual([{ result: undefined, reason: 'escape' }]);
  });

  it('closeOnEscape false ignores Escape but still closes on a backdrop click', async () => {
    const ref = TestBed.inject(MudDialog).open(GreetingDialog, { data: { name: 'x' }, closeOnEscape: false });
    const outcomes: unknown[] = [];

    ref.closed.subscribe((o) => outcomes.push(o));
    await TestBed.inject(ApplicationRef).whenStable();
    overlayRoot().querySelector('mud-dialog-container')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await TestBed.inject(ApplicationRef).whenStable();

    expect(outcomes).toEqual([]);
    expect(overlayRoot().querySelector('mud-dialog-container')).toBeTruthy();

    (document.querySelector('.cdk-overlay-backdrop') as HTMLElement).click();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(outcomes).toEqual([{ result: undefined, reason: 'backdrop' }]);
  });

  it('both false leave only the close button and actions to close it', async () => {
    const ref = TestBed.inject(MudDialog).open(GreetingDialog, {
      data: { name: 'x' },
      closeOnBackdrop: false,
      closeOnEscape: false,
    });
    const outcomes: unknown[] = [];

    ref.closed.subscribe((o) => outcomes.push(o));
    await TestBed.inject(ApplicationRef).whenStable();
    (document.querySelector('.cdk-overlay-backdrop') as HTMLElement).click();
    overlayRoot().querySelector('mud-dialog-container')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await TestBed.inject(ApplicationRef).whenStable();

    expect(outcomes).toEqual([]);
    expect(overlayRoot().querySelector('mud-dialog-container')).toBeTruthy();
  });

  it('renders the close button with the closeLabel and closes with reason close-button', async () => {
    const ref = TestBed.inject(MudDialog).open(GreetingDialog, { data: { name: 'x' }, closeLabel: 'Închide' });
    const outcomes: unknown[] = [];

    ref.closed.subscribe((o) => outcomes.push(o));
    await TestBed.inject(ApplicationRef).whenStable();
    const close = overlayRoot().querySelector('.dialog__close') as HTMLButtonElement;

    expect(close.getAttribute('aria-label')).toBe('Închide');
    close.click();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(outcomes).toEqual([{ result: undefined, reason: 'close-button' }]);
  });

  it('showCloseButton false renders no close button', async () => {
    TestBed.inject(MudDialog).open(GreetingDialog, { data: { name: 'x' }, showCloseButton: false });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(overlayRoot().querySelector('.dialog__close')).toBeNull();
  });

  // CDK-owned focus behavior — ONE smoke assertion each, not re-tested in depth.
  it('moves focus into the dialog on open and restores it on close', async () => {
    const button = document.createElement('button');

    document.body.appendChild(button);
    button.focus();
    const ref = TestBed.inject(MudDialog).open(GreetingDialog, { data: { name: 'x' } });

    await TestBed.inject(ApplicationRef).whenStable();
    expect(overlayRoot().contains(document.activeElement)).toBe(true);

    ref.close();
    await TestBed.inject(ApplicationRef).whenStable();
    expect(document.activeElement).toBe(button);
    button.remove();
  });

  it('wires the title id into the container aria-labelledby and clamps via the title class', async () => {
    TestBed.inject(MudDialog).open(ConfirmDialog);
    await TestBed.inject(ApplicationRef).whenStable();

    const container = overlayRoot().querySelector('mud-dialog-container') as HTMLElement;
    const title = container.querySelector('.dialog__title') as HTMLElement;

    expect(title.id).toMatch(/^mud-dialog-title-/);
    expect(container.getAttribute('aria-labelledby')).toBe(title.id);
  });

  it('config.ariaLabel sets aria-label and suppresses aria-labelledby even with a mudDialogTitle', async () => {
    TestBed.inject(MudDialog).open(ConfirmDialog, { ariaLabel: 'Confirmă ștergerea' });
    await TestBed.inject(ApplicationRef).whenStable();

    const container = overlayRoot().querySelector('mud-dialog-container') as HTMLElement;

    expect(container.getAttribute('aria-label')).toBe('Confirmă ștergerea');
    expect(container.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('gives content, actions, and image their layout classes', async () => {
    TestBed.inject(MudDialog).open(ConfirmDialog);
    await TestBed.inject(ApplicationRef).whenStable();
    const root = overlayRoot();

    expect(root.querySelector('.dialog__content')).toBeTruthy();
    expect(root.querySelector('.dialog__actions')).toBeTruthy();
    expect(root.querySelector('img.dialog__image')).toBeTruthy();
  });

  it('mudDialogClose closes with the bound result and reason action', async () => {
    const ref = TestBed.inject(MudDialog).open<boolean>(ConfirmDialog);
    const outcomes: unknown[] = [];

    ref.closed.subscribe((o) => outcomes.push(o));
    await TestBed.inject(ApplicationRef).whenStable();
    (overlayRoot().querySelector('.confirm') as HTMLButtonElement).click();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(outcomes).toEqual([{ result: true, reason: 'action' }]);
  });

  it('a [mudDialogClose] button inside an opened TemplateRef closes with reason action', async () => {
    // Pins the embedded-view injector path: CDK builds a template's injector
    // differently from a component's, and MudDialogClose still has to resolve
    // the same MudDialogRef through it.
    const fixture = TestBed.createComponent(TplWithCloseHost);

    await fixture.whenStable();
    const ref = TestBed.inject(MudDialog).open<string>(fixture.componentInstance.tpl(), {
      data: { reportName: 'Raport T3 2026' },
    });
    const outcomes: unknown[] = [];

    ref.closed.subscribe((o) => outcomes.push(o));
    await TestBed.inject(ApplicationRef).whenStable();
    (overlayRoot().querySelector('.tpl-close') as HTMLButtonElement).click();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(outcomes).toEqual([{ result: 'Raport T3 2026', reason: 'action' }]);
  });

  it('MudDialogClose defaults to type="button" so it cannot submit a host form', async () => {
    TestBed.inject(MudDialog).open(ConfirmDialog);
    await TestBed.inject(ApplicationRef).whenStable();

    const confirm = overlayRoot().querySelector('.confirm') as HTMLButtonElement;

    expect(confirm.getAttribute('type')).toBe('button');
  });

  it('stacked layout adds the modifier class', async () => {
    TestBed.inject(MudDialog).open(StackedActionsDialog);
    await TestBed.inject(ApplicationRef).whenStable();

    const actions = overlayRoot().querySelector('.dialog__actions') as HTMLElement;

    expect(actions.classList.contains('dialog__actions--stacked')).toBe(true);
  });
});

describe('MudDialog styles', () => {
  // The overlay content brings its own CSS — there is no global stylesheet in jsdom.
  it('ships its own CSS', async () => {
    @Component({ template: `<p>Body</p>` })
    class StylesBody {}

    TestBed.inject(MudDialog).open(StylesBody);
    await TestBed.inject(ApplicationRef).whenStable();
    const css = [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');

    expect(css).toMatch(/\.dialog\s*\{/);
  });
});
