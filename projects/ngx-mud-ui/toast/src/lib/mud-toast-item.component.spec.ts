import { Component, Injector, signal, viewChild } from '@angular/core';
import type { TemplateRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { MudToastItem } from './mud-toast-item.component';
import { MudToastRef } from './mud-toast-ref';
import { resolveToastConfig } from './mud-toast-config';
import { nextToastId } from './mud-toast-entry';
import type { MudToastEntry } from './mud-toast-entry';
import type { MudToastData, MudToastVariant } from './mud-toast-config';

function makeEntry(data: MudToastData, overrides: { variant?: MudToastVariant; showCloseButton?: boolean } = {}): MudToastEntry {
  return {
    id: nextToastId(),
    config: resolveToastConfig({ ...overrides, duration: 0 }),
    ref: new MudToastRef(),
    data,
    leaving: signal(false),
  };
}

@Component({
  imports: [MudToastItem],
  template: `<mud-toast-item [entry]="entry()" />`,
})
class Host {
  readonly entry = signal<MudToastEntry>(makeEntry({ message: 'Salvat' }));
}

describe('MudToastItem', () => {
  it('uses role=status/polite for info and success', () => {
    for (const variant of ['info', 'success'] as const) {
      const fixture = TestBed.createComponent(Host);

      fixture.componentInstance.entry.set(makeEntry({ message: 'x' }, { variant }));
      fixture.detectChanges();

      // role/aria-live/aria-atomic now live on the content wrapper, not the
      // host: the host also carries the close button, and aria-atomic would
      // otherwise fold the button's accessible name into every announcement.
      // They are applied in the same commit as the content (no macrotask
      // wait) — see the component for why the old one-render-late deferral
      // was removed.
      const el: HTMLElement = fixture.nativeElement.querySelector('.mud-toast__content');

      expect(el.getAttribute('role')).toBe('status');
      expect(el.getAttribute('aria-live')).toBe('polite');
      expect(el.getAttribute('aria-atomic')).toBe('true');
    }
  });

  it('uses role=alert/assertive for warning and error', () => {
    for (const variant of ['warning', 'error'] as const) {
      const fixture = TestBed.createComponent(Host);

      fixture.componentInstance.entry.set(makeEntry({ message: 'x' }, { variant }));
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement.querySelector('.mud-toast__content');

      expect(el.getAttribute('role')).toBe('alert');
      expect(el.getAttribute('aria-live')).toBe('assertive');
    }
  });

  it('drops its own live region when announcementMessage is set, to avoid double announcement', () => {
    const entry: MudToastEntry = {
      id: nextToastId(),
      config: resolveToastConfig({ duration: 0, announcementMessage: 'Cererea a fost salvată' }),
      ref: new MudToastRef(),
      data: { message: 'Salvat' },
      leaving: signal(false),
    };
    const fixture = TestBed.createComponent(Host);

    fixture.componentInstance.entry.set(entry);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement.querySelector('.mud-toast__content');

    expect(el.getAttribute('role')).toBeNull();
    expect(el.getAttribute('aria-live')).toBeNull();
  });

  it('keeps the close button outside the live region so its name is not folded into announcements', () => {
    const fixture = TestBed.createComponent(Host);

    fixture.componentInstance.entry.set(makeEntry({ message: 'x' }));
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement.querySelector('mud-toast-item');
    const content = host.querySelector('.mud-toast__content')!;
    const closeButton = host.querySelector('.mud-toast__close')!;

    expect(host.hasAttribute('role')).toBe(false);
    expect(content.contains(closeButton)).toBe(false);
  });

  it('renders a string title and marks the has-title class', () => {
    const fixture = TestBed.createComponent(Host);

    fixture.componentInstance.entry.set(makeEntry({ title: 'Succes', message: 'Salvat' }));
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement.querySelector('mud-toast-item');

    expect(el.querySelector('.mud-toast__title')!.textContent!.trim()).toBe('Succes');
    expect(el.classList.contains('mud-toast--has-title')).toBe(true);
  });

  it('omits the title node and the has-title class when there is no title', () => {
    const fixture = TestBed.createComponent(Host);

    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement.querySelector('mud-toast-item');

    expect(el.querySelector('.mud-toast__title')).toBeNull();
    expect(el.classList.contains('mud-toast--has-title')).toBe(false);
  });

  it('dismisses with close-button when the × is activated', () => {
    const fixture = TestBed.createComponent(Host);

    fixture.detectChanges();
    const reasons: string[] = [];

    fixture.componentInstance.entry()!.ref._dismissRequests.subscribe((r) => reasons.push(r));

    const root: HTMLElement = fixture.nativeElement;

    root.querySelector<HTMLButtonElement>('.mud-toast__close')!.click();

    expect(reasons).toEqual(['close-button']);
  });

  it('honours showCloseButton: false', () => {
    const fixture = TestBed.createComponent(Host);

    fixture.componentInstance.entry.set(makeEntry({ message: 'x' }, { showCloseButton: false }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.mud-toast__close')).toBeNull();
  });

  it('labels the close button from closeLabel', () => {
    const entry = makeEntry({ message: 'x' });
    const fixture = TestBed.createComponent(Host);

    fixture.componentInstance.entry.set({ ...entry, config: { ...entry.config, closeLabel: 'Închide' } });
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.mud-toast__close')!.getAttribute('aria-label'),
    ).toBe('Închide');
  });
});

@Component({
  imports: [MudToastItem],
  template: `
    <ng-template #msg let-ref><button type="button" class="tpl-action" (click)="ref.dismiss('action')">Anulează</button></ng-template>
    @if (entry(); as e) {
      <mud-toast-item [entry]="e" />
    }
  `,
})
class TemplateHost {
  readonly msg = viewChild.required<TemplateRef<unknown>>('msg');
  readonly entry = signal<MudToastEntry | null>(null);
}

describe('MudToastItem template content', () => {
  it('renders a TemplateRef message with the ref as $implicit', () => {
    const fixture = TestBed.createComponent(TemplateHost);

    fixture.detectChanges();
    const ref = new MudToastRef();

    fixture.componentInstance.entry.set({
      id: nextToastId(),
      config: resolveToastConfig({ duration: 0 }),
      ref,
      data: { message: fixture.componentInstance.msg() },
      leaving: signal(false),
    });
    fixture.detectChanges();

    const reasons: string[] = [];

    ref._dismissRequests.subscribe((r) => reasons.push(r));
    const root: HTMLElement = fixture.nativeElement;

    root.querySelector<HTMLButtonElement>('.tpl-action')!.click();

    expect(reasons).toEqual(['action']);
  });
});

@Component({
  template: `<p class="custom-body">Cod: {{ code }}</p>`,
})
class CustomBody {
  readonly code = 'E42';
}

describe('MudToastItem componentType branch', () => {
  it('renders the component via NgComponentOutlet instead of the data-driven surface', () => {
    const fixture = TestBed.createComponent(Host);
    const entry: MudToastEntry = {
      id: nextToastId(),
      config: resolveToastConfig({ duration: 0 }),
      ref: new MudToastRef(),
      componentType: CustomBody,
      componentInjector: Injector.create({ providers: [], parent: TestBed.inject(Injector) }),
      leaving: signal(false),
    };

    fixture.componentInstance.entry.set(entry);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;

    // The custom component's own markup is present...
    expect(root.querySelector('.custom-body')!.textContent).toContain('E42');
    // ...and the data-driven surface it displaced is entirely absent, proving
    // this is a branch rather than the component simply being appended.
    expect(root.querySelector('.mud-toast__body')).toBeNull();
  });
});

describe('MudToastItem leading icon', () => {
  // Regression: the toast originally rendered `<mud-icon [name]="...">`, which
  // resolves through MudIconRegistry — a registry only a CONSUMER populates via
  // provideMudIcons([...]). Nothing in the library calls it, so every toast
  // shipped with an empty 0x0 icon slot. The glyphs are inlined now, matching
  // how inline-message and info-box already solve this.
  it('renders an inlined glyph for every variant, with no consumer setup', () => {
    for (const variant of ['info', 'warning', 'success', 'error'] as const) {
      const fixture = TestBed.createComponent(Host);

      fixture.componentInstance.entry.set(makeEntry({ message: 'x' }, { variant }));
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;
      const svg = root.querySelector<SVGElement>('.mud-toast__icon svg');

      expect(svg, `${variant} should render a glyph`).not.toBeNull();
      expect(svg!.getAttribute('viewBox')).toBe('0 0 24 24');
      // currentColor is what lets --toast-*-icon (white, or #B54708 for
      // warning) reach the glyph without a per-variant fill.
      expect(svg!.querySelector('path')!.getAttribute('fill')).toBe('currentColor');
    }
  });

  it('gives each variant a distinct glyph rather than one shared shape', () => {
    const paths = new Set<string>();

    for (const variant of ['info', 'warning', 'success', 'error'] as const) {
      const fixture = TestBed.createComponent(Host);

      fixture.componentInstance.entry.set(makeEntry({ message: 'x' }, { variant }));
      fixture.detectChanges();

      const root: HTMLElement = fixture.nativeElement;

      paths.add(root.querySelector('.mud-toast__icon svg path')!.getAttribute('d')!);
    }

    expect(paths.size).toBe(4);
  });

  it('hides the icon from assistive tech', () => {
    const fixture = TestBed.createComponent(Host);

    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;

    expect(root.querySelector('.mud-toast__icon')!.getAttribute('aria-hidden')).toBe('true');
  });
});

@Component({
  imports: [MudToastItem],
  template: `
    <ng-template #icon><svg class="custom-glyph" viewBox="0 0 24 24"></svg></ng-template>
    @if (entry(); as e) {
      <mud-toast-item [entry]="e" />
    }
  `,
})
class IconSlotHost {
  readonly icon = viewChild.required<TemplateRef<unknown>>('icon');
  readonly entry = signal<MudToastEntry | null>(null);
}

describe('MudToastItem icon slot', () => {
  it('lets data.icon replace the per-variant default', () => {
    const fixture = TestBed.createComponent(IconSlotHost);

    fixture.detectChanges();
    fixture.componentInstance.entry.set({
      id: nextToastId(),
      config: resolveToastConfig({ duration: 0, variant: 'success' }),
      ref: new MudToastRef(),
      data: { message: 'x', icon: fixture.componentInstance.icon() },
      leaving: signal(false),
    });
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;

    // The projected glyph is present...
    expect(root.querySelector('.mud-toast__icon .custom-glyph')).not.toBeNull();
    // ...and it REPLACED the default rather than rendering alongside it.
    expect(root.querySelectorAll('.mud-toast__icon svg')).toHaveLength(1);
  });
});
