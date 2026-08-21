import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudAvatar } from './mud-avatar.component';
import type { MudAvatarSize } from './mud-avatar.component';

@Component({
  imports: [MudAvatar],
  template: `
    <mud-avatar [size]="size()">OP</mud-avatar>
  `,
})
class Host {
  readonly size = signal<MudAvatarSize>('medium');
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('mud-avatar') as HTMLElement;

  return { fixture, host: fixture.componentInstance, el };
}

describe('MudAvatar', () => {
  it('renders a medium avatar by default and projects content', async () => {
    const { el } = await render();

    expect(el.classList.contains('avatar')).toBe(true);
    expect(el.classList.contains('avatar--md')).toBe(true);
    expect(el.textContent).toContain('OP');
  });

  it('maps all five sizes to the design-system classes', async () => {
    const { fixture, host, el } = await render();

    const sizes: [MudAvatarSize, string][] = [
      ['extra-small', 'avatar--xs'],
      ['small', 'avatar--sm'],
      ['medium', 'avatar--md'],
      ['large', 'avatar--lg'],
      ['extra-large', 'avatar--xl'],
    ];

    for (const [size, className] of sizes) {
      host.size.set(size);
      await fixture.whenStable();
      expect(el.classList.contains(className)).toBe(true);
    }
  });

  it('removes the previous size class when the size changes', async () => {
    const { fixture, host, el } = await render();

    host.size.set('extra-large');
    await fixture.whenStable();

    expect(el.classList.contains('avatar--xl')).toBe(true);
    expect(el.classList.contains('avatar--md')).toBe(false);
  });
});

@Component({
  imports: [MudAvatar],
  template: `
    <mud-avatar [label]="label()">
      @if (withImg()) {
        <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" [attr.alt]="alt()" />
      } @else {
        OP
      }
    </mud-avatar>
  `,
})
class LabelHost {
  readonly label = signal<string | undefined>(undefined);
  readonly withImg = signal(false);
  readonly alt = signal<string | null>(null);
}

async function renderLabelHost() {
  const fixture = TestBed.createComponent(LabelHost);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('mud-avatar') as HTMLElement;

  return { fixture, host: fixture.componentInstance, el };
}

describe('MudAvatar accessibility', () => {
  it('is decorative by default: no role and no aria-label', async () => {
    const { el } = await renderLabelHost();

    expect(el.hasAttribute('role')).toBe(false);
    expect(el.hasAttribute('aria-label')).toBe(false);
  });

  it('exposes role="img" with the accessible name when label is set', async () => {
    const { fixture, host, el } = await renderLabelHost();

    host.label.set('Olga Popescu');
    await fixture.whenStable();

    expect(el.getAttribute('role')).toBe('img');
    expect(el.getAttribute('aria-label')).toBe('Olga Popescu');
  });

  it('drops role and aria-label again when the label is cleared', async () => {
    const { fixture, host, el } = await renderLabelHost();

    host.label.set('Olga Popescu');
    await fixture.whenStable();
    host.label.set(undefined);
    await fixture.whenStable();

    expect(el.hasAttribute('role')).toBe(false);
    expect(el.hasAttribute('aria-label')).toBe(false);
  });

  it('warns in dev mode when a projected img has no alt attribute and no label', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    try {
      const fixture = TestBed.createComponent(LabelHost);

      fixture.componentInstance.withImg.set(true);
      await fixture.whenStable();

      expect(warn).toHaveBeenCalledWith(expect.stringContaining('alt'));
    } finally {
      warn.mockRestore();
    }
  });

  it('does not warn when the img has an alt attribute, even an empty one', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    try {
      const fixture = TestBed.createComponent(LabelHost);

      fixture.componentInstance.withImg.set(true);
      fixture.componentInstance.alt.set('');
      await fixture.whenStable();

      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });

  it('does not warn about a missing alt when a label is provided', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    try {
      const fixture = TestBed.createComponent(LabelHost);

      fixture.componentInstance.withImg.set(true);
      fixture.componentInstance.label.set('Olga Popescu');
      await fixture.whenStable();

      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });

  it('does not warn for initials content', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    try {
      await renderLabelHost();

      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });
});
