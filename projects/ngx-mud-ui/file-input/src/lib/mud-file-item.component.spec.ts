import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudFileItem } from './mud-file-item.component';
import type { MudFileItemRemove, MudFileItemState } from './mud-file-item.component';

@Component({
  imports: [MudFileItem],
  template: `
    <mud-file-item
      [filename]="filename()"
      [size]="size()"
      [state]="state()"
      [errorText]="errorText()"
      [previewSrc]="previewSrc()"
      [disabled]="disabled()"
      [removable]="removable()"
      [progress]="progress()"
      (removed)="removals.push($event)"
    />
  `,
})
class Host {
  readonly filename = signal('raport.pdf');
  readonly size = signal<number | undefined>(undefined);
  readonly state = signal<MudFileItemState>('uploaded');
  readonly errorText = signal<string | undefined>(undefined);
  readonly previewSrc = signal<string | undefined>(undefined);
  readonly disabled = signal(false);
  readonly removable = signal(true);
  readonly progress = signal<number | undefined>(undefined);
  readonly removals: MudFileItemRemove[] = [];
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('mud-file-item') as HTMLElement;

  return {
    fixture,
    host: fixture.componentInstance,
    el,
    filenameEl: () => el.querySelector('.file-item__filename') as HTMLElement | null,
    meta: () => el.querySelector('.file-item__meta') as HTMLElement | null,
    glyph: () => el.querySelector('.file-item__glyph') as HTMLElement | null,
    thumbnail: () => el.querySelector('.file-item__thumbnail') as HTMLImageElement | null,
    spinner: () => el.querySelector('.file-item__spinner') as HTMLElement | null,
    statusIcon: (kind: string) => el.querySelector(`.file-item__status--${kind}`) as HTMLElement | null,
    removeBtn: () => el.querySelector('.file-item__remove') as HTMLButtonElement | null,
    errorMessage: () => el.querySelector('.file-item__error-message') as HTMLElement | null,
    progress: () => el.querySelector('.file-item__progress') as HTMLElement | null,
  };
}

@Component({
  imports: [MudFileItem],
  template: `
    <mud-file-item filename="raport.pdf" [state]="state()" [previewSrc]="previewSrc()">
      <svg icon class="custom-icon" viewBox="0 0 20 20"></svg>
    </mud-file-item>
  `,
})
class SlottedHost {
  readonly state = signal<MudFileItemState>('uploaded');
  readonly previewSrc = signal<string | undefined>(undefined);
}

async function renderSlotted() {
  const fixture = TestBed.createComponent(SlottedHost);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('mud-file-item') as HTMLElement;

  return {
    fixture,
    host: fixture.componentInstance,
    el,
    custom: () => el.querySelector('.custom-icon') as SVGElement | null,
    glyph: () => el.querySelector('.file-item__glyph') as HTMLElement | null,
    thumbnail: () => el.querySelector('.file-item__thumbnail') as HTMLImageElement | null,
  };
}

describe('MudFileItem leading-icon projection', () => {
  it('lets a projected [icon] replace the default glyph', async () => {
    const { custom, glyph } = await renderSlotted();

    expect(custom()).not.toBeNull();
    expect(glyph()).toBeNull();
  });

  it('still prefers the preview thumbnail over a projected icon', async () => {
    const { fixture, host, custom, thumbnail } = await renderSlotted();

    host.previewSrc.set('blob:preview');
    await fixture.whenStable();

    expect(thumbnail()).not.toBeNull();
    expect(custom()).toBeNull();
  });

  it('restores the projected icon after a preview fails', async () => {
    const { fixture, host, custom, thumbnail, glyph } = await renderSlotted();

    host.previewSrc.set('blob:broken');
    await fixture.whenStable();
    thumbnail()!.dispatchEvent(new Event('error'));
    await fixture.whenStable();

    // Falling back must land on the consumer's icon, not the built-in glyph.
    expect(custom()).not.toBeNull();
    expect(glyph()).toBeNull();
  });

  it('drops the projected icon in the error state, like the built-in glyph', async () => {
    const { fixture, host, custom } = await renderSlotted();

    host.state.set('error');
    await fixture.whenStable();

    expect(custom()).toBeNull();
  });
});

describe('MudFileItem', () => {
  it('renders the filename', async () => {
    const { filenameEl } = await render();

    expect(filenameEl()?.textContent?.trim()).toBe('raport.pdf');
  });

  it('renders the size as a human-readable string', async () => {
    const { fixture, host, meta } = await render();

    host.size.set(512);
    await fixture.whenStable();
    expect(meta()?.textContent?.trim()).toBe('512 B');

    host.size.set(1536);
    await fixture.whenStable();
    expect(meta()?.textContent?.trim()).toBe('1.5 KB');

    host.size.set(2.5 * 1024 * 1024);
    await fixture.whenStable();
    expect(meta()?.textContent?.trim()).toBe('2.5 MB');

    host.size.set(1.25 * 1024 * 1024 * 1024);
    await fixture.whenStable();
    expect(meta()?.textContent?.trim()).toBe('1.25 GB');
  });

  it('omits the size meta line when no size is given', async () => {
    const { meta } = await render();

    expect(meta()).toBeNull();
  });

  it('in the resting state shows the file glyph and the remove button only', async () => {
    const { el, glyph, spinner, statusIcon, removeBtn } = await render();

    expect(el.classList.contains('file-item--uploaded')).toBe(true);
    expect(glyph()).not.toBeNull();
    expect(removeBtn()).not.toBeNull();
    expect(spinner()).toBeNull();
    expect(statusIcon('success')).toBeNull();
    expect(statusIcon('error')).toBeNull();
  });

  it('while uploading shows a spinner and a cancel button that emits removed', async () => {
    const { fixture, host, spinner, removeBtn } = await render();

    host.state.set('uploading');
    await fixture.whenStable();

    expect(spinner()).not.toBeNull();
    expect(removeBtn()!.getAttribute('aria-label')).toBe('Cancel upload raport.pdf');

    removeBtn()!.click();
    expect(host.removals).toEqual([{ filename: 'raport.pdf' }]);
  });

  it('a removable=false uploading row has no cancel button', async () => {
    const { fixture, host, removeBtn } = await render();

    host.state.set('uploading');
    host.removable.set(false);
    await fixture.whenStable();

    expect(removeBtn()).toBeNull();
  });

  it('a progress number while uploading renders a determinate progress bar', async () => {
    const { fixture, host, progress, el } = await render();

    host.state.set('uploading');
    host.progress.set(33.4);
    await fixture.whenStable();

    const bar = progress()!;

    expect(bar.getAttribute('role')).toBe('progressbar');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
    expect(bar.getAttribute('aria-valuenow')).toBe('33');
    // Named by the file, so a list of uploads reads apart.
    expect(bar.getAttribute('aria-label')).toBe('raport.pdf');
    expect(el.querySelector<HTMLElement>('.file-item__progress-fill')!.style.inlineSize).toBe('33.4%');
  });

  it('clamps progress to 0-100', async () => {
    const { fixture, host, progress } = await render();

    host.state.set('uploading');
    host.progress.set(140);
    await fixture.whenStable();
    expect(progress()!.getAttribute('aria-valuenow')).toBe('100');

    host.progress.set(-5);
    await fixture.whenStable();
    expect(progress()!.getAttribute('aria-valuenow')).toBe('0');
  });

  it('shows no progress bar without a number, or outside the uploading state', async () => {
    const { fixture, host, progress, spinner } = await render();

    host.state.set('uploading');
    await fixture.whenStable();
    expect(progress()).toBeNull();
    expect(spinner()).not.toBeNull();

    host.progress.set(Number.NaN);
    await fixture.whenStable();
    expect(progress()).toBeNull();

    host.progress.set(100);
    host.state.set('success');
    await fixture.whenStable();
    expect(progress()).toBeNull();
  });

  it('on success shows the confirmation icon and hides the remove button', async () => {
    const { fixture, host, statusIcon, removeBtn } = await render();

    host.state.set('success');
    await fixture.whenStable();

    expect(statusIcon('success')).not.toBeNull();
    expect(removeBtn()).toBeNull();
  });

  it('on error shows the error icon, keeps remove, drops the leading glyph and renders the message', async () => {
    const { fixture, host, glyph, statusIcon, removeBtn, errorMessage } = await render();

    host.state.set('error');
    host.errorText.set('Fișierul este prea mare');
    await fixture.whenStable();

    expect(statusIcon('error')).not.toBeNull();
    expect(removeBtn()).not.toBeNull();
    expect(glyph()).toBeNull();
    expect(errorMessage()?.textContent?.trim()).toBe('Fișierul este prea mare');
  });

  it('ignores errorText outside the error state', async () => {
    const { fixture, host, errorMessage } = await render();

    host.errorText.set('Fișierul este prea mare');
    await fixture.whenStable();

    expect(errorMessage()).toBeNull();
  });

  it('renders a thumbnail for previewSrc and falls back to the glyph when the image fails', async () => {
    const { fixture, host, thumbnail, glyph } = await render();

    host.previewSrc.set('blob:preview');
    await fixture.whenStable();

    expect(thumbnail()).not.toBeNull();
    expect(glyph()).toBeNull();

    thumbnail()!.dispatchEvent(new Event('error'));
    await fixture.whenStable();

    expect(thumbnail()).toBeNull();
    expect(glyph()).not.toBeNull();
  });

  it('recovers from a preview failure when previewSrc changes', async () => {
    const { fixture, host, thumbnail } = await render();

    host.previewSrc.set('blob:broken');
    await fixture.whenStable();
    thumbnail()!.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(thumbnail()).toBeNull();

    host.previewSrc.set('blob:fresh');
    await fixture.whenStable();

    expect(thumbnail()).not.toBeNull();
  });

  it('hides the remove button when removable is false', async () => {
    const { fixture, host, removeBtn } = await render();

    host.removable.set(false);
    await fixture.whenStable();

    expect(removeBtn()).toBeNull();
  });

  it('labels the remove button with removeLabel plus the filename', async () => {
    const { removeBtn } = await render();

    expect(removeBtn()?.getAttribute('aria-label')).toBe('Remove file raport.pdf');
  });

  it('emits removed with the filename on remove click', async () => {
    const { host, removeBtn } = await render();

    removeBtn()!.click();

    expect(host.removals).toEqual([{ filename: 'raport.pdf' }]);
  });

  it('renders on the server without constructing a ResizeObserver', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });

    const observed: string[] = [];
    const RealResizeObserver = globalThis.ResizeObserver;

    globalThis.ResizeObserver = class {
      constructor() {
        observed.push('constructed');
      }
      observe() {
        observed.push('observe');
      }
      disconnect() {
        observed.push('disconnect');
      }
      unobserve() {
        observed.push('unobserve');
      }
    } as unknown as typeof ResizeObserver;

    try {
      const { fixture, host, filenameEl, meta, removeBtn } = await render();

      host.size.set(2048);
      await fixture.whenStable();

      expect(filenameEl()?.textContent?.trim()).toBe('raport.pdf');
      expect(meta()?.textContent?.trim()).toBe('2.0 KB');
      expect(removeBtn()).not.toBeNull();
      expect(observed).toEqual([]);
    } finally {
      globalThis.ResizeObserver = RealResizeObserver;
    }
  });

  it('disables the remove button and suppresses removal while disabled', async () => {
    const { fixture, host, el, removeBtn } = await render();

    host.disabled.set(true);
    await fixture.whenStable();

    expect(el.classList.contains('is-disabled')).toBe(true);
    expect(removeBtn()?.disabled).toBe(true);

    removeBtn()!.click();
    expect(host.removals).toEqual([]);
  });
});

@Component({
  imports: [MudFileItem],
  template: `
    <mud-file-item filename="certificat.pdf" [variant]="variant()" [size]="size()">
      <span info class="probe-info">Emis <strong>12.03.2026</strong> · EVO</span>
    </mud-file-item>
  `,
})
class SystemHost {
  readonly variant = signal<'default' | 'system'>('system');
  readonly size = signal<number | undefined>(undefined);
}

// Separate host: an `@if` around the [icon] counts as projected content even when false, which would hide
// the fallback glyph in every other test.
@Component({
  imports: [MudFileItem],
  template: `
    <mud-file-item filename="certificat.pdf" variant="system">
      <svg icon class="custom-icon" viewBox="0 0 20 20"></svg>
    </mud-file-item>
  `,
})
class SystemIconHost {}

describe('MudFileItem system variant', () => {
  async function renderSystem(setup: (host: SystemHost) => void = () => undefined) {
    const fixture = TestBed.createComponent(SystemHost);

    setup(fixture.componentInstance);
    await fixture.whenStable();

    const el = fixture.nativeElement.querySelector('mud-file-item') as HTMLElement;

    return { fixture, host: fixture.componentInstance, el };
  }

  it('renders the issued-document card with the system glyph and the projected info line', async () => {
    const { el } = await renderSystem();

    expect(el.classList).toContain('file-item--system');
    expect(el.querySelector('.file-item__system-glyph')).not.toBeNull();
    expect(el.querySelector('.file-item__glyph')).toBeNull();
    expect(el.querySelector('.file-item__info .probe-info')?.textContent?.trim()).toBe(
      'Emis 12.03.2026 · EVO',
    );
  });

  it('puts the size on the info line', async () => {
    const { el } = await renderSystem((host) => host.size.set(2048));

    expect(el.querySelector('.file-item__info .file-item__meta')?.textContent?.trim()).toBe('2.0 KB');
  });

  it('a projected icon still replaces the glyph', async () => {
    const fixture = TestBed.createComponent(SystemIconHost);

    await fixture.whenStable();
    const el = fixture.nativeElement.querySelector('mud-file-item') as HTMLElement;

    expect(el.querySelector('.custom-icon')).not.toBeNull();
    expect(el.querySelector('.file-item__system-glyph')).toBeNull();
  });

  it('the default variant ignores info content', async () => {
    const { el } = await renderSystem((host) => host.variant.set('default'));

    expect(el.classList).not.toContain('file-item--system');
    expect(el.querySelector('.probe-info')).toBeNull();
    expect(el.querySelector('.file-item__glyph')).not.toBeNull();
  });
});
