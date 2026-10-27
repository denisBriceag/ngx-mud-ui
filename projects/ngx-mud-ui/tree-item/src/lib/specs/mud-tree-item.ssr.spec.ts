import { Component, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudTreeItem } from '../mud-tree-item.component';
import { MudBadge } from 'ngx-mud-ui/badge';

@Component({
  imports: [MudTreeItem, MudBadge],
  template: `
    <a mud-tree-item href="/users" selected [level]="2">
      <svg icon></svg>
      <svg selectedIcon></svg>
      Users
      <span secondaryLabel>12 new</span>
      <mud-badge trailing [count]="3" />
    </a>
    <button mud-tree-item type="button" selected>Settings</button>
    <button mud-tree-item type="button" disabled>Archive</button>
  `,
})
class Host {}

describe('MudTreeItem on the server', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
  });

  // Everything the row needs (classes, ARIA, indent) is a host binding, so the
  // server markup must already be the final markup: hydration then changes nothing.
  it('serializes the full row: classes, aria-current, indent and every slot', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(Host);

    await fixture.whenStable();

    const [link, button, disabled] = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.mud-tree-item'),
    );

    expect(link.classList).toContain('mud-tree-item--selected');
    expect(link.getAttribute('aria-current')).toBe('page');
    expect(link.style.getPropertyValue('--mud-tree-item-depth')).toBe('1');
    expect(link.querySelector('.mud-tree-item__icon svg')).not.toBeNull();
    expect(link.querySelector('.mud-tree-item__selected-icon svg')).not.toBeNull();
    expect(link.querySelector('.mud-tree-item__label')?.textContent?.trim()).toBe('Users');
    expect(link.querySelector('.mud-tree-item__secondary')?.textContent?.trim()).toBe('12 new');
    expect(link.querySelector('.mud-tree-item__trailing .badge')?.textContent).toBe('3');
    expect(button.getAttribute('aria-current')).toBe('true');
    expect(disabled.hasAttribute('aria-current')).toBe(false);
    expect(disabled.hasAttribute('disabled')).toBe(true);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
