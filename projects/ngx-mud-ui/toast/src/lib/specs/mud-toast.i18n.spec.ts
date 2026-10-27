import { ApplicationRef, Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MUD_LABELS_RO, provideMudLabels } from 'ngx-mud-ui/i18n';
import { MUD_TOAST_DEFAULT_OPTIONS } from '../mud-toast-config';
import { MudToast } from '../mud-toast.service';

@Component({ providers: [provideMudLabels({ toast: { close: 'Sub' } })], template: '' })
class SubtreeHost {
  readonly toast = inject(MudToast);
}

async function closeLabel(open: (toast: MudToast) => void = (t) => t.open({ data: { message: 'x' }, duration: 0 })) {
  open(TestBed.inject(MudToast));
  await TestBed.inject(ApplicationRef).whenStable();

  return document.querySelector('.mud-toast__close')!.getAttribute('aria-label');
}

describe('MudToast i18n', () => {
  afterEach(() => TestBed.inject(MudToast).dismissAll());

  it('uses the English default with no provider', async () => {
    expect(await closeLabel()).toBe('Close');
  });

  it('closeLabel follows app labels when the default options leave it unset', async () => {
    TestBed.configureTestingModule({
      providers: [provideMudLabels(MUD_LABELS_RO), { provide: MUD_TOAST_DEFAULT_OPTIONS, useValue: { duration: 0 } }],
    });
    expect(await closeLabel()).toBe(MUD_LABELS_RO.toast!.close);
  });

  it('default options closeLabel and a per-call closeLabel win, in that order', async () => {
    TestBed.configureTestingModule({
      providers: [provideMudLabels(MUD_LABELS_RO), { provide: MUD_TOAST_DEFAULT_OPTIONS, useValue: { closeLabel: 'Default' } }],
    });
    expect(await closeLabel()).toBe('Default');
    TestBed.inject(MudToast).dismissAll();
    expect(await closeLabel((t) => t.open({ data: { message: 'y' }, duration: 0, closeLabel: 'Call' }))).toBe('Call');
  });

  it('a subtree provideMudLabels does NOT reach toasts', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const fixture = TestBed.createComponent(SubtreeHost);

    fixture.componentInstance.toast.open({ data: { message: 'x' }, duration: 0 });
    await TestBed.inject(ApplicationRef).whenStable();
    expect(document.querySelector('.mud-toast__close')!.getAttribute('aria-label')).toBe(MUD_LABELS_RO.toast!.close);
  });
});
