import { ApplicationRef, Component, PLATFORM_ID, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { MudToast } from './mud-toast.service';
import { MudToastRef } from './mud-toast-ref';
import { MUD_TOAST_DATA } from './mud-toast-config';

function stacks(): HTMLElement[] {
  return [...document.querySelectorAll('mud-toast-stack')] as HTMLElement[];
}

function toasts(): HTMLElement[] {
  return [...document.querySelectorAll('mud-toast-item')] as HTMLElement[];
}

describe('MudToast service', () => {
  afterEach(() => TestBed.inject(MudToast).dismissAll());

  it('renders a toast into an overlay-hosted stack', async () => {
    const toast = TestBed.inject(MudToast);

    toast.open({ data: { message: 'Salvat' }, duration: 0 });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(toasts()).toHaveLength(1);
    expect(toasts()[0].textContent).toContain('Salvat');
  });

  it('reuses one stack per position and creates a second for a different position', async () => {
    const toast = TestBed.inject(MudToast);

    toast.open({ data: { message: 'a' }, duration: 0 });
    toast.open({ data: { message: 'b' }, duration: 0 });
    await TestBed.inject(ApplicationRef).whenStable();
    expect(stacks()).toHaveLength(1);

    toast.open({ data: { message: 'c' }, duration: 0, verticalPosition: 'bottom' });
    await TestBed.inject(ApplicationRef).whenStable();
    expect(stacks()).toHaveLength(2);
  });

  it('tears the overlay down once its last toast is gone', async () => {
    const toast = TestBed.inject(MudToast);
    const ref = toast.open({ data: { message: 'a' }, duration: 0 });

    await TestBed.inject(ApplicationRef).whenStable();

    ref.dismiss();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(stacks()).toHaveLength(0);
  });

  it('settles the ref with the dismiss reason', async () => {
    const toast = TestBed.inject(MudToast);
    const ref = toast.open({ data: { message: 'a' }, duration: 0 });

    await TestBed.inject(ApplicationRef).whenStable();

    const seen: string[] = [];

    ref.dismissed.subscribe((reason) => seen.push(reason));
    ref.dismiss('close-button');
    await TestBed.inject(ApplicationRef).whenStable();

    expect(seen).toEqual(['close-button']);
  });

  it('dismissAll settles every open toast with dismiss-all', async () => {
    const toast = TestBed.inject(MudToast);
    const a = toast.open({ data: { message: 'a' }, duration: 0 });
    const b = toast.open({ data: { message: 'b' }, duration: 0, verticalPosition: 'bottom' });

    await TestBed.inject(ApplicationRef).whenStable();

    const seen: string[] = [];

    a.dismissed.subscribe((r) => seen.push(r));
    b.dismissed.subscribe((r) => seen.push(r));
    toast.dismissAll();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(seen).toEqual(['dismiss-all', 'dismiss-all']);
    expect(toasts()).toHaveLength(0);
  });

  it('opens a component with MUD_TOAST_DATA and exposes the instance', async () => {
    const toast = TestBed.inject(MudToast);
    const ref = toast.openFromComponent(CustomBody, { data: { code: 'E42' }, duration: 0 });

    await TestBed.inject(ApplicationRef).whenStable();

    expect(document.querySelector('.custom-body')!.textContent).toContain('E42');
    expect(ref.instance).toBeInstanceOf(CustomBody);
  });

  it('emits opened once the toast is on screen, then completes', async () => {
    const toast = TestBed.inject(MudToast);
    const ref = toast.open({ data: { message: 'a' }, duration: 0 });

    let emissions = 0;
    let completed = false;
    let renderedAtOpen = -1;

    ref.opened.subscribe({
      next: () => {
        emissions++;
        // Captured synchronously inside the subscriber so a premature `opened`
        // (fired before the toast's own item is in the DOM) is caught, not
        // masked by whenStable() settling everything before we look.
        renderedAtOpen = document.querySelectorAll('mud-toast-item').length;
      },
      complete: () => (completed = true),
    });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(emissions).toBe(1);
    expect(completed).toBe(true);
    expect(renderedAtOpen).toBe(1);
  });
});

@Component({
  template: `<p class="custom-body">Cod: {{ data.code }}</p>`,
})
class CustomBody {
  readonly data = inject<{ code: string }>(MUD_TOAST_DATA);
}

describe('MudToast on the server', () => {
  it('renders nothing and returns an already-settled ref', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });

    const ref = TestBed.inject(MudToast).open({ data: { message: 'a' }, duration: 0 });
    let completed = false;

    ref.dismissed.subscribe({ complete: () => (completed = true) });

    expect(toasts()).toHaveLength(0);
    expect(completed).toBe(true);
    expect(ref).toBeInstanceOf(MudToastRef);
  });
});
