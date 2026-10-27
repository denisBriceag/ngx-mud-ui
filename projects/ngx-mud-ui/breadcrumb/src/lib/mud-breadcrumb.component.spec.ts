import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MudBreadcrumb } from './mud-breadcrumb.component';
import { MudBreadcrumbItem } from './mud-breadcrumb-item.directive';
import { withSwappedVirtualConsole } from './virtual-console.test-helper';

@Component({
  imports: [MudBreadcrumb, MudBreadcrumbItem],
  template: `
    <nav mudBreadcrumb [maxVisible]="maxVisible()" [label]="label()">
      <ol>
        @for (crumb of crumbs(); track crumb.text) {
          <li mudBreadcrumbItem [disabled]="crumb.disabled ?? false">
            <a [href]="crumb.href">{{ crumb.text }}</a>
          </li>
        }
      </ol>
    </nav>
  `,
})
class Host {
  readonly maxVisible = signal(4);
  readonly label = signal('Breadcrumb');
  readonly crumbs = signal<{ text: string; href: string; disabled?: boolean }[]>([]);
}

const trail = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    text: `Nivel ${String(index + 1)}`,
    href: `/nivel-${String(index + 1)}`,
  }));

async function render(
  crumbs: { text: string; href: string; disabled?: boolean }[] = trail(3),
) {
  const fixture = TestBed.createComponent(Host);

  fixture.componentInstance.crumbs.set(crumbs);
  await fixture.whenStable();

  const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;

  return {
    fixture,
    host: fixture.componentInstance,
    nav,
    // The consumer's own <ol>. Every crumb and the overflow trigger live in it;
    // the back link deliberately does not.
    list: () => nav.querySelector('ol') as HTMLOListElement,
    // A crumb is "in the trail" when it is not collapsed out of it.
    visible: () =>
      [...nav.querySelectorAll('.mud-breadcrumb__item')]
        .filter((el) => !el.classList.contains('mud-breadcrumb__item--collapsed'))
        .map((el) => el.textContent?.trim()),
    collapsed: () =>
      [...nav.querySelectorAll('.mud-breadcrumb__item--collapsed')].map((el) =>
        el.textContent?.trim(),
      ),
  };
}

describe('MudBreadcrumb', () => {
  it('labels the navigation landmark', async () => {
    const { nav } = await render();

    expect(nav.getAttribute('aria-label')).toBe('Breadcrumb');
  });

  it('lets a consumer-set aria-label win over the label input', async () => {
    @Component({
      imports: [MudBreadcrumb, MudBreadcrumbItem],
      template: `<nav mudBreadcrumb aria-label="Unde sunt">
        <ol>
          <li mudBreadcrumbItem><a href="/">A</a></li>
        </ol>
      </nav>`,
    })
    class Explicit {}

    const fixture = TestBed.createComponent(Explicit);

    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('nav').getAttribute('aria-label')).toBe('Unde sunt');
  });

  it('keeps every crumb when the count is at or below maxVisible', async () => {
    const { visible, collapsed } = await render(trail(4));

    expect(visible()).toEqual(['Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4']);
    expect(collapsed()).toEqual([]);
  });

  it('collapses the middle, keeping the first crumb and the last two', async () => {
    const { visible, collapsed } = await render(trail(6));

    expect(visible()).toEqual(['Nivel 1', 'Nivel 5', 'Nivel 6']);
    expect(collapsed()).toEqual(['Nivel 2', 'Nivel 3', 'Nivel 4']);
  });

  it('recomputes the collapse set when maxVisible changes', async () => {
    const { fixture, host, collapsed } = await render(trail(6));

    host.maxVisible.set(10);
    await fixture.whenStable();

    expect(collapsed()).toEqual([]);
  });

  it('coerces maxVisible below 2 up to 2 and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { fixture, host, visible } = await render(trail(5));

    host.maxVisible.set(1);
    await fixture.whenStable();

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('maxVisible must be >= 2'));
    expect(visible()).toEqual(['Nivel 1', 'Nivel 4', 'Nivel 5']);

    warn.mockRestore();
  });

  it('marks the last crumb as the current page when none is explicitly active', async () => {
    const { nav } = await render(trail(3));

    const current = nav.querySelectorAll('[aria-current="page"]');

    expect(current.length).toBe(1);
    expect(current[0].textContent?.trim()).toBe('Nivel 3');
  });

  it('skips disabled crumbs when resolving the current page', async () => {
    const { nav } = await render([
      { text: 'Nivel 1', href: '/a' },
      { text: 'Nivel 2', href: '/b' },
      { text: 'Nivel 3', href: '/c', disabled: true },
    ]);

    expect(nav.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('Nivel 2');
  });

  it('falls back to the last crumb when every crumb is disabled', async () => {
    const { nav } = await render([
      { text: 'Nivel 1', href: '/a', disabled: true },
      { text: 'Nivel 2', href: '/b', disabled: true },
    ]);

    expect(nav.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('Nivel 2');
  });

  it('renders an empty trail without error', async () => {
    const { nav } = await render([]);

    expect(nav.querySelectorAll('.mud-breadcrumb__item').length).toBe(0);
  });

  it('never collapses a two-crumb trail', async () => {
    const { fixture, host, collapsed } = await render(trail(2));

    host.maxVisible.set(2);
    await fixture.whenStable();

    expect(collapsed()).toEqual([]);
  });

  it('keeps the back link outside the list, ahead of it in DOM order', async () => {
    // The back link replaces the whole trail rather than joining it, so it sits
    // OUTSIDE the <ol> — an <ol> may only contain <li>. It must also never be
    // the nav's LAST child: at desktop width it is display:none, but the moment
    // it is not, a trailing back link would read as a crumb sitting after the
    // current page. Rendering it first keeps visual, DOM and tab order in step.
    const { nav, list } = await render(trail(3));

    expect(nav.firstElementChild?.classList.contains('mud-breadcrumb__back')).toBe(true);
    expect(nav.lastElementChild).toBe(list());
    expect(list().querySelector('.mud-breadcrumb__back')).toBeNull();
    expect(list().lastElementChild?.textContent?.trim()).toBe('Nivel 3');
  });

  it('renders the trail as a real <ol> of <li> crumbs', async () => {
    const { list } = await render(trail(3));

    expect(list().tagName).toBe('OL');
    expect([...list().children].map((el) => el.tagName)).toEqual(['LI', 'LI', 'LI']);
  });
});

// The stylesheet is not loaded in jsdom and container queries do not exist
// there, so getComputedStyle can say nothing about the separator. What jsdom
// CAN evaluate is selector matching — Element.matches() runs the real selector
// engine over the real DOM this component built. These tests therefore mirror
// the selector list from _breadcrumb.scss verbatim and assert which elements it
// picks out. If the SCSS and this constant drift apart the tests stop proving
// anything, hence: keep them in lockstep.
const SEPARATOR_SELECTOR = [
  '.mud-breadcrumb__item + .mud-breadcrumb__item',
  '.mud-breadcrumb__item + .mud-breadcrumb__overflow',
  '.mud-breadcrumb__overflow + .mud-breadcrumb__item',
].join(',');

describe('MudBreadcrumb separator rule', () => {
  const chevroned = (list: HTMLElement) =>
    [...list.children]
      .filter((el) => el.matches(SEPARATOR_SELECTOR))
      .map((el) => el.textContent?.trim());

  it('gives the first crumb no leading chevron', async () => {
    const { list } = await render(trail(3));

    // Adjacency, not :first-child. The back link no longer shares a parent with
    // the crumbs, so :first-child would happen to work here — which is exactly
    // the reasoning that produced the bug twice before. The rule stays keyed on
    // adjacency so nothing the container renders can ever perturb it again.
    const first = list().querySelector('.mud-breadcrumb__item') as HTMLElement;

    expect(first.matches(SEPARATOR_SELECTOR)).toBe(false);
    expect(chevroned(list())).toEqual(['Nivel 2', 'Nivel 3']);
  });

  it('gives the first crumb no leading chevron when there is no back link either', async () => {
    @Component({
      imports: [MudBreadcrumb, MudBreadcrumbItem],
      template: `
        <nav mudBreadcrumb [responsive]="false">
          <ol>
            <li mudBreadcrumbItem><a href="/a">A</a></li>
            <li mudBreadcrumbItem><a href="/b">B</a></li>
          </ol>
        </nav>
      `,
    })
    class NoBackLink {}

    const fixture = TestBed.createComponent(NoBackLink);

    await fixture.whenStable();

    const list = fixture.nativeElement.querySelector('ol') as HTMLElement;
    const first = list.querySelector('.mud-breadcrumb__item') as HTMLElement;

    expect(first.matches(SEPARATOR_SELECTOR)).toBe(false);
    expect(chevroned(list)).toEqual(['B']);
  });

  it('chevrons the overflow trigger and the crumb that follows the collapsed run', async () => {
    const { list } = await render(trail(6));

    // <ol>[Nivel 1][…][2 collapsed][3 collapsed][4 collapsed][Nivel 5][Nivel 6]</ol>
    // The trigger follows a crumb, so it gets one. Nivel 5 follows a crumb that
    // is display:none — which does not affect selector matching — so the first
    // visible crumb after the panel still gets its chevron.
    const overflow = list().querySelector('mud-breadcrumb-overflow') as HTMLElement;

    expect(overflow.matches(SEPARATOR_SELECTOR)).toBe(true);
    expect(chevroned(list())).toEqual(['…', 'Nivel 2', 'Nivel 3', 'Nivel 4', 'Nivel 5', 'Nivel 6']);
  });

  it('never chevrons the back link, which is not a sibling of any crumb', async () => {
    const { nav } = await render(trail(4));

    const back = nav.querySelector('.mud-breadcrumb__back') as HTMLElement;

    expect(back.matches(SEPARATOR_SELECTOR)).toBe(false);
  });
});

// Same reasoning as the separator block above: jsdom cannot evaluate CSS, but
// it runs the real selector engine. These mirror the structural selectors in
// _breadcrumb.scss that depend on the consumer's <ol> being where we think it
// is — the one thing the move to <li> could silently break without any test
// noticing, because the component keeps working and only the styling dies.
describe('MudBreadcrumb stylesheet selector contract', () => {
  it('reaches the consumer’s unclassed <ol> as a child of the host', async () => {
    const { list } = await render(trail(3));

    // `.mud-breadcrumb > ol` carries the flex row and the UA list reset.
    expect(list().matches('.mud-breadcrumb > ol')).toBe(true);
  });

  it('reaches the inner control at any depth under the crumb', async () => {
    const { list } = await render(trail(3));
    const anchor = list().querySelector('a') as HTMLElement;

    // `.mud-breadcrumb__item a` carries the colour/decoration reset. It is a
    // DESCENDANT selector, not a child one, because `MudBreadcrumbItem.target()`
    // resolves the crumb's real click/focus target with `querySelector('a,button')`
    // — which matches at any depth — so the CSS contract has to match that
    // reach or a nested control renders correctly but unstyled. See the next
    // test for the nested case this guards against.
    expect(anchor.matches('.mud-breadcrumb__item a')).toBe(true);
  });

  it('resolves a wrapped anchor as the crumb target, styled the same as an unwrapped one', async () => {
    // This is the case the fix exists for: `<li mudBreadcrumbItem>` wraps its
    // control in a <span>, so `target()`'s depth-agnostic `querySelector`
    // still finds it (the functional contract was never broken), but a CHILD
    // combinator (`.mud-breadcrumb__item > a`) would not — leaving a fully
    // working crumb with the UA's default blue, underlined text.
    //
    // RED against the pre-fix child combinator: `anchor.matches('.mud-breadcrumb__item > a')`
    // is `false` here because the <span> sits between the <li> and the <a>.
    // GREEN after loosening the stylesheet to `.mud-breadcrumb__item a`.
    @Component({
      imports: [MudBreadcrumb, MudBreadcrumbItem],
      template: `
        <nav mudBreadcrumb>
          <ol>
            <li mudBreadcrumbItem>
              <span><a href="/nested">Nested</a></span>
            </li>
          </ol>
        </nav>
      `,
    })
    class NestedControl {}

    const fixture = TestBed.createComponent(NestedControl);

    await fixture.whenStable();

    const anchor = fixture.nativeElement.querySelector('a') as HTMLElement;
    const item = fixture.debugElement
      .query(By.directive(MudBreadcrumbItem))
      .injector.get(MudBreadcrumbItem);

    // Functional contract: target() must find the nested anchor, not fall
    // back to the <li> — that fallback is what would silently break
    // routerLink and misplace aria-current/aria-disabled.
    expect(item.target()).toBe(anchor);

    // Style contract: the stylesheet must reach as deep as target() does.
    expect(anchor.matches('.mud-breadcrumb__item a')).toBe(true);
  });

  it('hides the whole <ol>, not just the crumbs, under the collapsible gate', async () => {
    const { list } = await render(trail(3));

    // Hiding only `.mud-breadcrumb__item` would leave an empty flex row — and
    // an empty list in the accessibility tree — sitting next to the back link.
    expect(list().matches('.mud-breadcrumb--collapsible > ol')).toBe(true);
  });
});

describe('MudBreadcrumb overflow menu width', () => {
  it('overrides the shared `.menu` 270px minimum with upstream’s 160px', async () => {
    await render(trail(3));

    const css = [...document.querySelectorAll('style')].map((style) => style.textContent ?? '').join('\n');

    // Two classes, so it beats `.menu` on specificity regardless of stylesheet order.
    expect(css).toMatch(/\.menu\.mud-breadcrumb__panel\s*\{[^}]*min-inline-size:\s*var\(--mud-breadcrumb-menu-min-width\)/);
  });
});

describe('MudBreadcrumb collapsible gate', () => {
  // The container query below 640px hides the whole trail and reveals the back
  // link. Ungated it hides the trail even when NO back link exists, leaving a
  // completely empty <nav>. The host class is the gate; jsdom cannot evaluate
  // the query, so the class is the only testable face of that CSS contract.
  const isCollapsible = (nav: HTMLElement) =>
    nav.classList.contains('mud-breadcrumb--collapsible');

  it('marks an ordinary trail collapsible', async () => {
    const { nav } = await render(trail(3));

    expect(isCollapsible(nav)).toBe(true);
  });

  it('is not collapsible when responsive is off — the docs promise the full trail', async () => {
    @Component({
      imports: [MudBreadcrumb, MudBreadcrumbItem],
      template: `
        <nav mudBreadcrumb [responsive]="false">
          <ol>
            <li mudBreadcrumbItem><a href="/a">A</a></li>
            <li mudBreadcrumbItem><a href="/b">B</a></li>
          </ol>
        </nav>
      `,
    })
    class NotResponsive {}

    const fixture = TestBed.createComponent(NotResponsive);

    await fixture.whenStable();

    expect(isCollapsible(fixture.nativeElement.querySelector('nav'))).toBe(false);
  });

  it('is not collapsible for a single-crumb trail', async () => {
    const { nav } = await render(trail(1));

    expect(isCollapsible(nav)).toBe(false);
  });

  it('is not collapsible when the current page is already the root', async () => {
    @Component({
      imports: [MudBreadcrumb, MudBreadcrumbItem],
      template: `
        <nav mudBreadcrumb>
          <ol>
            <li mudBreadcrumbItem active><a href="/a">A</a></li>
            <li mudBreadcrumbItem><a href="/b">B</a></li>
          </ol>
        </nav>
      `,
    })
    class RootIsCurrent {}

    const fixture = TestBed.createComponent(RootIsCurrent);

    await fixture.whenStable();

    expect(isCollapsible(fixture.nativeElement.querySelector('nav'))).toBe(false);
  });

  it('drops the class when the trail shrinks to a single crumb', async () => {
    const { fixture, host, nav } = await render(trail(3));

    expect(isCollapsible(nav)).toBe(true);

    host.crumbs.set(trail(1));
    await fixture.whenStable();

    expect(isCollapsible(nav)).toBe(false);
  });
});

describe('MudBreadcrumb overflow placement', () => {
  it('renders no trigger while the trail fits', async () => {
    const { nav } = await render(trail(4));

    expect(nav.querySelector('mud-breadcrumb-overflow')).toBeNull();
  });

  it('inserts the trigger immediately after the first crumb, inside the list', async () => {
    const { list } = await render(trail(6));

    const children = [...list().children].map((el) => el.tagName.toLowerCase());

    // DOM order is the tab order and the screen-reader order; the trigger must
    // sit second, not at the end where a naive <ng-content> would leave it.
    expect(children[0]).toBe('li');
    expect(children[1]).toBe('mud-breadcrumb-overflow');
  });

  // TRAP 4. An <ol> may only contain <li>, and the trigger's host element is
  // <mud-breadcrumb-overflow> — it is created from the first crumb's
  // ViewContainerRef, so it cannot be anything else. role="listitem" is what
  // keeps the accessibility tree a coherent list across that gap.
  it('gives the trigger role="listitem" so the list stays coherent', async () => {
    const { list } = await render(trail(6));
    const overflow = list().querySelector('mud-breadcrumb-overflow') as HTMLElement;

    expect(overflow.parentElement).toBe(list());
    expect(overflow.getAttribute('role')).toBe('listitem');
  });

  it('feeds the collapsed crumbs to the trigger', async () => {
    const { nav, fixture } = await render(trail(6));

    (
      nav.querySelector('.mud-breadcrumb__overflow-trigger') as HTMLButtonElement
    ).click();
    await fixture.whenStable();

    expect(
      [...document.querySelectorAll('.mud-breadcrumb__panel-item')].map((el) =>
        el.textContent?.trim(),
      ),
    ).toEqual(['Nivel 2', 'Nivel 3', 'Nivel 4']);
  });

  it('removes the trigger when the trail shrinks back below the limit', async () => {
    const { fixture, host, nav } = await render(trail(6));

    host.crumbs.set(trail(3));
    await fixture.whenStable();

    expect(nav.querySelector('mud-breadcrumb-overflow')).toBeNull();
  });

  it('keeps a single trigger across repeated collapse changes', async () => {
    const { fixture, host, nav } = await render(trail(6));

    host.crumbs.set(trail(8));
    await fixture.whenStable();
    host.crumbs.set(trail(7));
    await fixture.whenStable();

    expect(nav.querySelectorAll('mud-breadcrumb-overflow').length).toBe(1);
  });

  it('recreates the trigger under a new first crumb when the leading crumb changes identity', async () => {
    const { fixture, host, list } = await render(trail(6));

    // @for tracks by crumb.text, so replacing the first crumb's text (a
    // tenant/workspace switch, say) destroys the old MudBreadcrumbItem view —
    // and with it, the overflow component that was anchored inside that
    // view's ViewContainerRef — while the trail stays long enough to collapse.
    const swapped = [{ text: 'Tenant B', href: '/tenant-b' }, ...trail(6).slice(1)];

    host.crumbs.set(swapped);
    await fixture.whenStable();

    const children = [...list().children];

    expect(children[0].tagName.toLowerCase()).toBe('li');
    expect(children[0].textContent?.trim()).toBe('Tenant B');
    expect(children[1]?.tagName.toLowerCase()).toBe('mud-breadcrumb-overflow');
  });
});

describe('MudBreadcrumb back link', () => {
  const back = (nav: HTMLElement) => nav.querySelector('.mud-breadcrumb__back') as HTMLElement | null;

  it('points at the parent of the current page', async () => {
    const { nav } = await render(trail(4));

    expect(back(nav)?.textContent?.trim()).toBe('Nivel 3');
    expect(back(nav)?.getAttribute('href')).toBe('/nivel-3');
  });

  it('uses the crumb before an explicitly active one', async () => {
    @Component({
      imports: [MudBreadcrumb, MudBreadcrumbItem],
      template: `
        <nav mudBreadcrumb>
          <ol>
            <li mudBreadcrumbItem><a href="/a">A</a></li>
            <li mudBreadcrumbItem><a href="/b">B</a></li>
            <li mudBreadcrumbItem active><a href="/c">C</a></li>
            <li mudBreadcrumbItem><a href="/d">D</a></li>
          </ol>
        </nav>
      `,
    })
    class Explicit {}

    const fixture = TestBed.createComponent(Explicit);

    await fixture.whenStable();

    expect(
      fixture.nativeElement.querySelector('.mud-breadcrumb__back')?.textContent?.trim(),
    ).toBe('B');
  });

  it('renders no back link for a single-crumb trail', async () => {
    const { nav } = await render(trail(1));

    expect(back(nav)).toBeNull();
  });

  it('renders no back link when responsive is off', async () => {
    @Component({
      imports: [MudBreadcrumb, MudBreadcrumbItem],
      template: `
        <nav mudBreadcrumb [responsive]="false">
          <ol>
            <li mudBreadcrumbItem><a href="/a">A</a></li>
            <li mudBreadcrumbItem><a href="/b">B</a></li>
          </ol>
        </nav>
      `,
    })
    class NotResponsive {}

    const fixture = TestBed.createComponent(NotResponsive);

    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.mud-breadcrumb__back')).toBeNull();
  });

  // TRAP 3. The back link navigates by synthesising a click on the crumb. The
  // directive's host is the <li> now, and a click there runs nothing — no
  // routerLink, no consumer handler bound to the anchor. The handler below is
  // deliberately on the ANCHOR, not the <li>, so a click forwarded to the wrong
  // element would leave hits at 0 rather than bubbling its way to a pass.
  it('forwards a plain click to the parent crumb’s inner anchor', async () => {
    @Component({
      imports: [MudBreadcrumb, MudBreadcrumbItem],
      template: `
        <nav mudBreadcrumb>
          <ol>
            <li mudBreadcrumbItem><a href="/a" (click)="onClick($event)">A</a></li>
            <li mudBreadcrumbItem><a href="/b">B</a></li>
          </ol>
        </nav>
      `,
    })
    class Forwarding {
      hits = 0;
      target: EventTarget | null = null;

      onClick(event: MouseEvent): void {
        // jsdom has no navigation; forwarding a click re-clicks this real
        // anchor, and without this it logs "Not implemented: navigation to
        // another Document" on every run.
        event.preventDefault();
        this.hits += 1;
        this.target = event.target;
      }
    }

    const fixture = TestBed.createComponent(Forwarding);

    await fixture.whenStable();

    fixture.nativeElement
      .querySelector('.mud-breadcrumb__back')
      .dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await fixture.whenStable();

    expect(fixture.componentInstance.hits).toBe(1);
    expect(fixture.componentInstance.target).toBe(
      fixture.nativeElement.querySelector('ol a[href="/a"]'),
    );
  });

  it('leaves a modified click to the browser', async () => {
    const { nav, fixture } = await render(trail(3));
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true });

    const navigationAttempted = await withSwappedVirtualConsole(async () => {
      back(nav)?.dispatchEvent(event);
      await fixture.whenStable();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(event.defaultPrevented).toBe(false);
    expect(navigationAttempted).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Not implemented: navigation to another Document'),
      }),
    );
  });

  it('renders no back link when the current page is already the root', async () => {
    // currentIndex resolves to 0 here (explicit active on the first crumb),
    // so there is no crumb above it — the earlier `?? items[length - 2]`
    // fallback would have wrongly pointed "back" at a later crumb instead.
    @Component({
      imports: [MudBreadcrumb, MudBreadcrumbItem],
      template: `
        <nav mudBreadcrumb>
          <ol>
            <li mudBreadcrumbItem active><a href="/a">A</a></li>
            <li mudBreadcrumbItem><a href="/b">B</a></li>
            <li mudBreadcrumbItem><a href="/c">C</a></li>
          </ol>
        </nav>
      `,
    })
    class RootIsCurrent {}

    const fixture = TestBed.createComponent(RootIsCurrent);

    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.mud-breadcrumb__back')).toBeNull();
  });

  it('skips a disabled parent and points at the nearest reachable ancestor', async () => {
    // A › B(disabled) › C. Taking items[currentIndex - 1] blindly would mirror
    // B, and the crumb's own capture-phase blocker would swallow the forwarded
    // click — a dead control, and on mobile the ONLY control on screen.
    const { nav } = await render([
      { text: 'A', href: '/a' },
      { text: 'B', href: '/b', disabled: true },
      { text: 'C', href: '/c' },
    ]);

    expect(back(nav)?.textContent?.trim()).toBe('A');
    expect(back(nav)?.getAttribute('href')).toBe('/a');
  });

  it('renders no back link when every ancestor is disabled', async () => {
    // Nothing reachable above the current page: better no affordance at all
    // than an inert one the user cannot tell apart from a working link.
    const { nav } = await render([
      { text: 'A', href: '/a', disabled: true },
      { text: 'B', href: '/b', disabled: true },
      { text: 'C', href: '/c' },
    ]);

    expect(back(nav)).toBeNull();
    expect(nav.classList.contains('mud-breadcrumb--collapsible')).toBe(false);
  });

  it('renders a button, not an anchor, for a back target with no href', async () => {
    @Component({
      imports: [MudBreadcrumb, MudBreadcrumbItem],
      template: `
        <nav mudBreadcrumb>
          <ol>
            <!-- Stand-in for a consumer's own non-link crumb with a click
                 listener (e.g. a menu-opening span); its a11y is the
                 consumer's concern, not this test's. -->
            <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
            <li mudBreadcrumbItem (click)="onClick($event)"><span>A</span></li>
            <li mudBreadcrumbItem><a href="/b">B</a></li>
          </ol>
        </nav>
      `,
    })
    class NoHrefTarget {
      hits = 0;

      onClick(event: MouseEvent): void {
        event.preventDefault();
        this.hits += 1;
      }
    }

    const fixture = TestBed.createComponent(NoHrefTarget);

    await fixture.whenStable();

    const backEl = fixture.nativeElement.querySelector('.mud-breadcrumb__back') as HTMLElement;

    expect(backEl.tagName).toBe('BUTTON');
    expect(backEl.textContent?.trim()).toBe('A');

    backEl.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await fixture.whenStable();

    expect(fixture.componentInstance.hits).toBe(1);
  });
});

describe('MudBreadcrumb leading icon', () => {
  const css = () =>
    [...document.querySelectorAll('style')].map((style) => style.textContent ?? '').join('\n');

  @Component({
    imports: [MudBreadcrumb, MudBreadcrumbItem],
    template: `
      <nav mudBreadcrumb>
        <ol>
          <li mudBreadcrumbItem>
            <a href="/"><svg icon-start aria-hidden="true" viewBox="0 0 16 16"></svg>Acasă</a>
          </li>
          <li mudBreadcrumbItem active><span>Cerere nouă</span></li>
        </ol>
      </nav>
    `,
  })
  class IconTrail {}

  it('sizes an [icon-start] anywhere in a crumb to 16px with the item gap, in the text colour', async () => {
    const fixture = TestBed.createComponent(IconTrail);

    await fixture.whenStable();

    const icon = fixture.nativeElement.querySelector('[icon-start]') as SVGElement;

    expect(icon.matches('.mud-breadcrumb__item [icon-start]')).toBe(true);
    expect(css()).toMatch(
      /\.mud-breadcrumb__item \[icon-start\]\s*\{[^}]*inline-size:\s*16px[^}]*block-size:\s*16px[^}]*margin-inline-end:\s*var\(--mud-breadcrumb-gap-item\)[^}]*color:\s*inherit/,
    );
  });

  it('drops the gap on an icon-only crumb, keyed off the link aria-label', () => {
    TestBed.createComponent(IconTrail).detectChanges();

    expect(css()).toMatch(
      /\.mud-breadcrumb__item :is\(a, button\)\[aria-label\] > \[icon-start\]:only-child\s*\{[^}]*margin-inline-end:\s*0/,
    );
  });

  it('keeps the crumb text free of the icon for the overflow menu and back link', async () => {
    const fixture = TestBed.createComponent(IconTrail);

    await fixture.whenStable();

    const first = fixture.debugElement
      .queryAll(By.directive(MudBreadcrumbItem))[0]
      .injector.get(MudBreadcrumbItem);

    expect(first.text()).toBe('Acasă');
  });
});
