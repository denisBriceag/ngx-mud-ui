import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { forwardCrumbClick } from './forward-crumb-click';
import { MudBreadcrumbItem } from './mud-breadcrumb-item.directive';

@Component({
  imports: [MudBreadcrumbItem],
  // The handler sits on the ANCHOR, not on the <li> the directive is attached
  // to: a click forwarded to the <li> would run nothing at all, so this fixture
  // cannot pass by bubbling from the wrong element.
  template: `<ol>
    <li mudBreadcrumbItem><a href="/servicii" (click)="onClick($event)">Servicii</a></li>
  </ol>`,
})
class Host {
  clicked = 0;

  onClick(event: MouseEvent): void {
    // jsdom has no navigation; a forwarded click re-clicks this real anchor and
    // would otherwise log "Not implemented: navigation to another Document".
    event.preventDefault();
    this.clicked += 1;
  }
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();

  const crumb = fixture.debugElement
    .query((node) => node.nativeElement?.hasAttribute?.('mudBreadcrumbItem'))
    .injector.get(MudBreadcrumbItem);

  return { fixture, host: fixture.componentInstance, crumb };
}

// The overflow panel's mirrored links and the mobile back link both used to
// carry their own copy of this five-condition guard, written by two different
// tasks with asymmetric coverage (one tested ctrlKey, the other only metaKey).
// One function, one matrix, tested once.
describe('forwardCrumbClick', () => {
  it('forwards a plain primary click and prevents its default', async () => {
    const { host, crumb } = await render();
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });

    expect(forwardCrumbClick(event, crumb)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(host.clicked).toBe(1);
  });

  // TRAP 3. The forward target must be the crumb's inner anchor: synthesising
  // the click on the <li> the directive is attached to would never reach
  // routerLink or the consumer's own handler.
  it('fires the click on the inner anchor, not on the <li>', async () => {
    const { crumb } = await render();
    const seen: EventTarget[] = [];

    crumb.element.addEventListener('click', (event) => seen.push(event.target!));
    forwardCrumbClick(new MouseEvent('click', { bubbles: true, cancelable: true }), crumb);

    expect(crumb.element.tagName).toBe('LI');
    expect(seen).toEqual([crumb.target()]);
    expect(crumb.target().tagName).toBe('A');
  });

  const modified: [string, MouseEventInit][] = [
    ['a non-primary button', { button: 1 }],
    ['ctrl', { ctrlKey: true }],
    ['meta', { metaKey: true }],
    ['shift', { shiftKey: true }],
    ['alt', { altKey: true }],
  ];

  it.each(modified)('leaves %s to the browser', async (_name, init) => {
    const { host, crumb } = await render();
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, ...init });

    expect(forwardCrumbClick(event, crumb)).toBe(false);
    expect(event.defaultPrevented).toBe(false);
    expect(host.clicked).toBe(0);
  });

  it('runs beforeForward ahead of the forwarded click, not after', async () => {
    // Load-bearing ordering: the overflow panel tears down its overlay in this
    // callback, and the forwarded click may navigate away and destroy the
    // component that owns it.
    const { host, crumb } = await render();
    const order: string[] = [];

    crumb.target().addEventListener('click', () => order.push('forwarded'));

    forwardCrumbClick(new MouseEvent('click', { bubbles: true, cancelable: true }), crumb, () =>
      order.push('before'),
    );

    expect(order).toEqual(['before', 'forwarded']);
    expect(host.clicked).toBe(1);
  });

  it('does not run beforeForward for a modified click', async () => {
    const { crumb } = await render();
    const before = vi.fn();

    forwardCrumbClick(
      new MouseEvent('click', { bubbles: true, cancelable: true, metaKey: true }),
      crumb,
      before,
    );

    expect(before).not.toHaveBeenCalled();
  });
});
