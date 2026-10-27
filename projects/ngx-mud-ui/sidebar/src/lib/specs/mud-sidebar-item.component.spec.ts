import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudSidebarItem } from '../mud-sidebar-item.component';

@Component({
  imports: [MudSidebarItem],
  template: `
    <a mud-sidebar-item href="#drafts" [selected]="selected()">
      <svg icon data-testid="icon"></svg>
      <svg selectedIcon data-testid="selected-icon"></svg>
      Schițe
      <span secondaryLabel>Nou</span>
      <span trailing data-testid="badge">1</span>
    </a>
    <button mud-sidebar-item type="button" [selected]="selected()">Jurnal</button>
  `,
})
class Host {
  readonly selected = signal(false);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const [anchor, button] = Array.from(
    (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[mud-sidebar-item]'),
  );

  return { fixture, host: fixture.componentInstance, anchor, button };
}

describe('MudSidebarItem', () => {
  it('uses the shared tree-item row contract', async () => {
    const { anchor, button } = await render();

    for (const row of [anchor, button]) {
      expect(row.classList).toContain('mud-tree-item');
      expect(row.classList).toContain('mud-sidebar-item');
    }
  });

  it('projects every slot into its tree-item wrapper', async () => {
    const { anchor } = await render();
    const slot = (name: string) => anchor.querySelector(`.mud-tree-item__${name}`) as HTMLElement;

    expect(slot('icon').querySelector('[data-testid="icon"]')).not.toBeNull();
    expect(slot('selected-icon').querySelector('[data-testid="selected-icon"]')).not.toBeNull();
    expect(slot('label').textContent?.trim()).toBe('Schițe');
    expect(slot('secondary').textContent?.trim()).toBe('Nou');
    expect(slot('trailing').querySelector('[data-testid="badge"]')).not.toBeNull();
    expect(slot('icon').getAttribute('aria-hidden')).toBe('true');
  });

  it('marks the current page per host kind', async () => {
    const { fixture, host, anchor, button } = await render();

    expect(anchor.hasAttribute('aria-current')).toBe(false);
    host.selected.set(true);
    await fixture.whenStable();
    expect(anchor.getAttribute('aria-current')).toBe('page');
    expect(button.getAttribute('aria-current')).toBe('true');
    expect(anchor.classList).toContain('mud-tree-item--selected');
  });
});
