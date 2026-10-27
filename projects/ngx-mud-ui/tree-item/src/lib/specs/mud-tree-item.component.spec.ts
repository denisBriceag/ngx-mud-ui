import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudTreeItem } from '../mud-tree-item.component';

@Component({
  imports: [MudTreeItem],
  template: `
    <a mud-tree-item href="#users" [selected]="selected()" [level]="level()">
      <svg icon data-testid="icon"></svg>
      <svg selectedIcon data-testid="selected-icon"></svg>
      Users
      <span secondaryLabel>12 new</span>
      <span trailing data-testid="badge">3</span>
    </a>
    <button mud-tree-item type="button" [selected]="selected()">Settings</button>
  `,
})
class Host {
  readonly selected = signal(false);
  readonly level = signal(1);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;

  return {
    fixture,
    host: fixture.componentInstance,
    anchor: root.querySelector('a') as HTMLAnchorElement,
    button: root.querySelector('button') as HTMLButtonElement,
  };
}

describe('MudTreeItem', () => {
  it('styles both host kinds as a tree item', async () => {
    const { anchor, button } = await render();

    expect(anchor.classList).toContain('mud-tree-item');
    expect(button.classList).toContain('mud-tree-item');
  });

  it('projects each slot into its own wrapper', async () => {
    const { anchor } = await render();
    const slot = (name: string) => anchor.querySelector(`.mud-tree-item__${name}`) as HTMLElement;

    expect(slot('icon').querySelector('[data-testid="icon"]')).not.toBeNull();
    expect(slot('selected-icon').querySelector('[data-testid="selected-icon"]')).not.toBeNull();
    expect(slot('label').textContent?.trim()).toBe('Users');
    expect(slot('secondary').textContent?.trim()).toBe('12 new');
    expect(slot('trailing').querySelector('[data-testid="badge"]')).not.toBeNull();
    expect(slot('icon').getAttribute('aria-hidden')).toBe('true');
    expect(slot('selected-icon').getAttribute('aria-hidden')).toBe('true');
  });

  // The CSS hides empty wrappers with :empty; a stray whitespace text node would
  // defeat it and leave a phantom 12px icon gap or trailing padding.
  it('empty slots match :empty', async () => {
    const { button } = await render();

    for (const name of ['icon', 'selected-icon', 'secondary', 'trailing']) {
      expect(button.querySelector(`.mud-tree-item__${name}`)!.matches(':empty')).toBe(true);
    }
  });

  it('maps selected to aria-current="page" on a link and "true" on a button', async () => {
    const { fixture, host, anchor, button } = await render();

    expect(anchor.hasAttribute('aria-current')).toBe(false);
    expect(button.hasAttribute('aria-current')).toBe(false);
    expect(anchor.classList).not.toContain('mud-tree-item--selected');

    host.selected.set(true);
    await fixture.whenStable();

    expect(anchor.getAttribute('aria-current')).toBe('page');
    expect(button.getAttribute('aria-current')).toBe('true');
    expect(anchor.classList).toContain('mud-tree-item--selected');
  });

  it('exposes level − 1 as the indent depth', async () => {
    const { fixture, host, anchor } = await render();

    expect(anchor.style.getPropertyValue('--mud-tree-item-depth')).toBe('0');

    host.level.set(3);
    await fixture.whenStable();

    expect(anchor.style.getPropertyValue('--mud-tree-item-depth')).toBe('2');
  });

  it('clamps an invalid level to 1 and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { fixture, host, anchor } = await render();

    host.level.set(0);
    await fixture.whenStable();

    expect(anchor.style.getPropertyValue('--mud-tree-item-depth')).toBe('0');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('mud-tree-item: level must be an integer'));
    warn.mockRestore();
  });
});

describe('MudTreeItem styles', () => {
  // The component brings its own CSS — there is no global stylesheet in jsdom.
  it('ships its own CSS', () => {
    @Component({ imports: [MudTreeItem], template: `<a mud-tree-item href="#">Home</a>` })
    class StylesHost {}

    TestBed.createComponent(StylesHost).detectChanges();
    const css = [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');

    expect(css).toMatch(/\.mud-tree-item\s*\{/);
  });
});
