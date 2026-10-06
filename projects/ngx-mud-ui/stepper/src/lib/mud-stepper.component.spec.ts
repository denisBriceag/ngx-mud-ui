import { TestBed } from '@angular/core/testing';
import { Component, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, required } from '@angular/forms/signals';
import { MudStepper } from './mud-stepper.component';
import type { MudStepperStepClick } from './mud-stepper.component';
import { MudStep } from './mud-step.component';
import { MudStepHeader } from './mud-step-header.component';
import { provideMudStepperLabels } from './stepper-labels';

describe('MudStepHeader', () => {
  async function renderHeader(state: string) {
    const fixture = TestBed.createComponent(MudStepHeader);

    fixture.componentRef.setInput('state', state);
    fixture.componentRef.setInput('index', 2);
    fixture.componentRef.setInput('label', 'Address');
    fixture.componentRef.setInput('secondaryText', 'Where you live');
    await fixture.whenStable();

    return fixture.nativeElement as HTMLElement;
  }

  it('renders the 1-based number, heading and supporting text', async () => {
    const el = await renderHeader('current');

    expect(el.querySelector('.stepper-step__number')?.textContent?.trim()).toBe('3');
    expect(el.querySelector('.stepper-step__heading')?.textContent).toBe('Address');
    expect(el.querySelector('.stepper-step__supporting')?.textContent).toBe('Where you live');
  });

  it("overrides CdkStepHeader's inherited role=tab with role=button", async () => {
    const el = await renderHeader('current');

    expect(el.getAttribute('role')).toBe('button');
  });

  it('renders the check icon instead of the number when completed', async () => {
    const el = await renderHeader('completed');

    expect(el.querySelector('.stepper-step__number')).toBeNull();
    expect(el.querySelector('svg.stepper-step__icon--check')).not.toBeNull();
  });

  it('renders the exclamation icon when blocked', async () => {
    const el = await renderHeader('blocked');

    expect(el.querySelector('.stepper-step__number')).toBeNull();
    expect(el.querySelector('svg.stepper-step__icon--blocked')).not.toBeNull();
  });

  it('renders the state suffix as text (the glyphs are aria-hidden) and omits it when absent', async () => {
    const fixture = TestBed.createComponent(MudStepHeader);

    fixture.componentRef.setInput('state', 'completed');
    fixture.componentRef.setInput('index', 0);
    fixture.componentRef.setInput('label', 'Identity');
    fixture.componentRef.setInput('stateLabel', 'completed');
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.stepper-step__state')?.textContent).toBe(', completed');
    expect(el.textContent?.replace(/\s+/g, ' ').trim()).toBe('Identity, completed');

    fixture.componentRef.setInput('stateLabel', undefined);
    await fixture.whenStable();
    expect(el.querySelector('.stepper-step__state')).toBeNull();
  });

  it('still announces secondaryText for a blocked step with no label', async () => {
    const fixture = TestBed.createComponent(MudStepHeader);

    fixture.componentRef.setInput('state', 'blocked');
    fixture.componentRef.setInput('index', 0);
    fixture.componentRef.setInput('secondaryText', 'Something failed');
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.stepper-step__heading')).toBeNull();
    expect(el.querySelector('.stepper-step__supporting')?.textContent).toContain(
      'Something failed',
    );
  });
});

function keydown(el: HTMLElement, key: string, keyCode: number): void {
  const event = new KeyboardEvent('keydown', { key, bubbles: true });

  Object.defineProperty(event, 'keyCode', { get: () => keyCode });
  el.dispatchEvent(event);
}

@Component({
  imports: [MudStepper, MudStep, ReactiveFormsModule],
  template: `
    <mud-stepper
      [linear]="linear()"
      [orientation]="orientation()"
      (selectedIndexChange)="indexes.push($event)"
    >
      <mud-step label="Identity" supportingText="Who you are" [stepControl]="identity">
        <p id="panel-1">Identity content</p>
      </mud-step>
      <mud-step label="Address" errorMessage="Address is incomplete" [stepControl]="address">
        <p id="panel-2">Address content</p>
      </mud-step>
      <mud-step label="Review">
        <p id="panel-3">Review content</p>
      </mud-step>
    </mud-stepper>
  `,
})
class StepperHost {
  readonly stepper = viewChild.required(MudStepper);
  readonly linear = signal(false);
  readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
  readonly indexes: number[] = [];
  readonly identity = new FormGroup({ name: new FormControl('', Validators.required) });
  readonly address = new FormGroup({ street: new FormControl('', Validators.required) });
}

async function renderStepper(setup?: (host: StepperHost) => void) {
  const fixture = TestBed.createComponent(StepperHost);

  setup?.(fixture.componentInstance);
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;

  return {
    fixture,
    host: fixture.componentInstance,
    root,
    steps: () => Array.from(root.querySelectorAll<HTMLElement>('.stepper-step')),
    headers: () => Array.from(root.querySelectorAll<HTMLElement>('mud-step-header')),
    panels: () => Array.from(root.querySelectorAll<HTMLElement>('[role="region"]')),
    list: () => root.querySelector<HTMLElement>('[role="list"]')!,
  };
}

describe('MudStepper', () => {
  it('renders one header per step; first step is current, list semantics + aria-current wiring', async () => {
    const t = await renderStepper();
    const steps = t.steps();

    expect(steps.length).toBe(3);
    expect(steps[0].classList).toContain('stepper-step--current');
    expect(t.list()).not.toBeNull();
    expect(t.list().hasAttribute('aria-orientation')).toBe(false);
    expect(steps[0].getAttribute('role')).toBe('listitem');
    // Connector must be a real aria-hidden element, not a pseudo-element —
    // ancestor pseudo-elements make axe's color-contrast check abstain.
    expect(steps[0].querySelector('.stepper-step__connector')?.getAttribute('aria-hidden')).toBe(
      'true',
    );

    const header = t.headers()[0];
    const panel = t.panels()[0];

    expect(header.getAttribute('aria-current')).toBe('step');
    expect(t.headers()[1].hasAttribute('aria-current')).toBe(false);
    expect(header.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('aria-labelledby')).toBe(header.id);
    expect(t.panels()[1].hidden).toBe(true);
    expect(t.panels()[0].hidden).toBe(false);
  });

  it('non-linear: other steps are available and clickable', async () => {
    const t = await renderStepper();

    expect(t.steps()[2].classList).toContain('stepper-step--available');
    t.headers()[2].click();
    await t.fixture.whenStable();

    expect(t.host.stepper().selectedIndex).toBe(2);
    expect(t.steps()[2].classList).toContain('stepper-step--current');
    expect(t.host.indexes).toEqual([2]);
  });

  it('derives completed (interacted + valid) with check icon and blocked (interacted + invalid) with errorMessage', async () => {
    const t = await renderStepper((host) => {
      host.identity.controls.name.setValue('Ana');
    });

    // leave step 1 (valid) → completed; land on step 2, leave it invalid → blocked
    t.headers()[1].click();
    await t.fixture.whenStable();
    t.headers()[2].click();
    await t.fixture.whenStable();

    expect(t.steps()[0].classList).toContain('stepper-step--completed');
    expect(t.steps()[0].querySelector('.stepper-step__icon--check')).not.toBeNull();
    expect(t.steps()[1].classList).toContain('stepper-step--blocked');
    // errorMessage replaces the supporting text while blocked
    expect(t.steps()[1].querySelector('.stepper-step__supporting')?.textContent).toContain(
      'Address is incomplete',
    );
  });

  it('linear: future steps are incomplete + aria-disabled, click is a no-op, next() is gated by validity', async () => {
    const t = await renderStepper((host) => host.linear.set(true));

    expect(t.steps()[1].classList).toContain('stepper-step--incomplete');
    expect(t.headers()[1].getAttribute('aria-disabled')).toBe('true');

    t.headers()[1].click();
    await t.fixture.whenStable();

    expect(t.host.stepper().selectedIndex).toBe(0);

    t.host.stepper().next();
    await t.fixture.whenStable();

    expect(t.host.stepper().selectedIndex).toBe(0); // identity invalid → blocked

    t.host.identity.controls.name.setValue('Ana');
    t.host.stepper().next();
    await t.fixture.whenStable();

    expect(t.host.stepper().selectedIndex).toBe(1);
  });

  it('re-renders header state when a control becomes valid programmatically (statusChanges bridge)', async () => {
    const t = await renderStepper();

    t.headers()[1].click(); // leave step 1 invalid → blocked
    await t.fixture.whenStable();

    expect(t.steps()[0].classList).toContain('stepper-step--blocked');

    t.host.identity.controls.name.setValue('Ana'); // no user event on the stepper
    await t.fixture.whenStable();

    expect(t.steps()[0].classList).toContain('stepper-step--completed');
  });

  it('honours completed/hasError/state overrides and falls back to the derived state for unknown forced states', async () => {
    @Component({
      imports: [MudStepper, MudStep],
      template: `
        <mud-stepper>
          <mud-step label="A"><p>a</p></mud-step>
          <mud-step label="B" [completed]="true"><p>b</p></mud-step>
          <mud-step label="C" [hasError]="true"><p>c</p></mud-step>
          <mud-step label="D" state="blocked"><p>d</p></mud-step>
          <mud-step label="E" state="edit"><p>e</p></mud-step>
        </mud-stepper>
      `,
    })
    class OverridesHost {}

    const fixture = TestBed.createComponent(OverridesHost);

    await fixture.whenStable();
    const steps = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.stepper-step'),
    );

    expect(steps[1].classList).toContain('stepper-step--completed');
    expect(steps[2].classList).toContain('stepper-step--blocked');
    expect(steps[3].classList).toContain('stepper-step--blocked');
    // "edit" is not an MudStepState — ignore it and derive (non-linear → available)
    expect(steps[4].classList).toContain('stepper-step--available');
    expect(steps[4].classList).not.toContain('stepper-step--edit');
  });

  it('keyboard: arrows move focus, Enter selects, roving tabindex follows', async () => {
    const t = await renderStepper();

    t.headers()[0].focus();
    keydown(t.headers()[0], 'ArrowRight', 39);
    await t.fixture.whenStable();

    expect(document.activeElement).toBe(t.headers()[1]);
    expect(t.headers()[1].tabIndex).toBe(0);
    expect(t.headers()[0].tabIndex).toBe(-1);

    keydown(t.headers()[1], 'Enter', 13);
    await t.fixture.whenStable();

    expect(t.host.stepper().selectedIndex).toBe(1);
  });

  it('linear: keyboard Enter on a focused non-navigable header is a no-op', async () => {
    const t = await renderStepper((host) => host.linear.set(true));

    // arrows move focus freely; only selection is gated in linear mode
    t.headers()[0].focus();
    keydown(t.headers()[0], 'ArrowRight', 39);
    await t.fixture.whenStable();

    expect(document.activeElement).toBe(t.headers()[1]);

    keydown(t.headers()[1], 'Enter', 13);
    await t.fixture.whenStable();

    expect(t.host.stepper().selectedIndex).toBe(0);
    expect(t.host.indexes).toEqual([]);
  });

  it('statusChanges bridge re-subscribes for dynamically added steps', async () => {
    @Component({
      imports: [MudStepper, MudStep, ReactiveFormsModule],
      template: `
        <mud-stepper>
          <mud-step label="Identity"><p>one</p></mud-step>
          @if (showExtra()) {
            <mud-step label="Extra" [stepControl]="extra"><p>extra</p></mud-step>
          }
          <mud-step label="Review"><p>two</p></mud-step>
        </mud-stepper>
      `,
    })
    class DynamicHost {
      readonly showExtra = signal(false);
      readonly extra = new FormGroup({ value: new FormControl('', Validators.required) });
    }

    const fixture = TestBed.createComponent(DynamicHost);

    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const headers = () => Array.from(root.querySelectorAll<HTMLElement>('mud-step-header'));
    const steps = () => Array.from(root.querySelectorAll<HTMLElement>('.stepper-step'));

    fixture.componentInstance.showExtra.set(true);
    await fixture.whenStable();

    expect(steps().length).toBe(3);

    // visit the added step and leave it invalid → blocked
    headers()[1].click();
    await fixture.whenStable();
    headers()[2].click();
    await fixture.whenStable();

    expect(steps()[1].classList).toContain('stepper-step--blocked');

    // programmatic validity change on the ADDED control must re-render,
    // proving the bridge re-subscribed after steps.changes
    fixture.componentInstance.extra.controls.value.setValue('filled');
    await fixture.whenStable();

    expect(steps()[1].classList).toContain('stepper-step--completed');
  });

  it('announces completed and blocked through the header text, with the labels token', async () => {
    TestBed.configureTestingModule({
      providers: [provideMudStepperLabels({ completed: 'finalizat' })],
    });
    const t = await renderStepper((host) => host.identity.controls.name.setValue('Ana'));

    t.headers()[1].click();
    await t.fixture.whenStable();
    t.headers()[2].click();
    await t.fixture.whenStable();

    const stateOf = (i: number) => t.headers()[i].querySelector('.stepper-step__state')?.textContent;

    expect(stateOf(0)).toBe(', finalizat'); // override
    expect(stateOf(1)).toBe(', has errors'); // untouched default
    expect(stateOf(2)).toBeUndefined(); // current: aria-current already says so
    expect(t.headers()[2].getAttribute('aria-current')).toBe('step');
  });

  it('keyboard Enter/Space go through the cancelable stepClick, like a click', async () => {
    const t = await renderStepper();
    const clicks: number[] = [];
    let prevent = false;

    t.host.stepper().stepClick.subscribe((e: MudStepperStepClick) => {
      clicks.push(e.index);

      if (prevent) e.preventDefault();
    });

    t.headers()[0].focus();
    keydown(t.headers()[0], 'ArrowRight', 39);
    await t.fixture.whenStable();
    keydown(t.headers()[1], ' ', 32);
    await t.fixture.whenStable();

    expect(clicks).toEqual([1]);
    expect(t.host.stepper().selectedIndex).toBe(1);

    prevent = true;
    keydown(t.headers()[1], 'ArrowRight', 39);
    await t.fixture.whenStable();
    keydown(t.headers()[2], 'Enter', 13);
    await t.fixture.whenStable();

    expect(clicks).toEqual([1, 2]);
    expect(t.host.stepper().selectedIndex).toBe(1); // vetoed
  });

  it('linear: a non-navigable header refuses pointer focus, so arrows keep starting from the active item', async () => {
    const t = await renderStepper((host) => host.linear.set(true));
    const mousedown = new MouseEvent('mousedown', { bubbles: true, cancelable: true });

    t.headers()[2].dispatchEvent(mousedown);

    expect(mousedown.defaultPrevented).toBe(true); // browser skips focusing it

    const navigable = new MouseEvent('mousedown', { bubbles: true, cancelable: true });

    t.headers()[0].dispatchEvent(navigable);
    expect(navigable.defaultPrevented).toBe(false);
  });

  it('auto-compact follows the measured width and switches off when the orientation turns vertical', async () => {
    // The runner's iframe has no layout (zero-width), so drive the observer by hand.
    const RealResizeObserver = globalThis.ResizeObserver;
    let resize: ((entries: ResizeObserverEntry[]) => void) | undefined;

    globalThis.ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) {
        resize = (entries) => callback(entries, this as unknown as ResizeObserver);
      }

      observe(): void {
        // nothing to observe: the test feeds entries through `resize`
      }

      unobserve(): void {
        // see observe
      }

      disconnect(): void {
        // see observe
      }
    };

    try {
      @Component({
        imports: [MudStepper, MudStep],
        template: `
          <mud-stepper [orientation]="orientation()">
            <mud-step label="One"><p>1</p></mud-step>
            <mud-step label="Two"><p>2</p></mud-step>
          </mud-stepper>
        `,
      })
      class NarrowHost {
        readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
      }

      const fixture = TestBed.createComponent(NarrowHost);

      await fixture.whenStable();
      const track = (fixture.nativeElement as HTMLElement).querySelector('.stepper') as HTMLElement;
      const measured = async (width: number) => {
        resize!([{ contentRect: { width } } as ResizeObserverEntry]);
        await fixture.whenStable();
      };

      expect(resize).toBeDefined();
      await measured(400);
      expect(track.classList.contains('stepper--compact')).toBe(true);

      // A display:none ancestor reports 0 — must not count as "narrow".
      await measured(0);
      expect(track.classList.contains('stepper--compact')).toBe(true);
      await measured(800);
      expect(track.classList.contains('stepper--compact')).toBe(false);
      await measured(0);
      expect(track.classList.contains('stepper--compact')).toBe(false);

      await measured(400);
      fixture.componentInstance.orientation.set('vertical');
      await fixture.whenStable();
      expect(track.classList.contains('stepper--compact')).toBe(false);

      fixture.componentInstance.orientation.set('horizontal');
      await fixture.whenStable();
      expect(track.classList.contains('stepper--compact')).toBe(true);
    } finally {
      globalThis.ResizeObserver = RealResizeObserver;
    }
  });

  it('re-watches a stepControl that is swapped for another control', async () => {
    @Component({
      imports: [MudStepper, MudStep],
      template: `
        <mud-stepper>
          <mud-step label="Identity" [stepControl]="control()"><p>one</p></mud-step>
          <mud-step label="Review"><p>two</p></mud-step>
        </mud-stepper>
      `,
    })
    class SwapHost {
      readonly control = signal(new FormGroup({ name: new FormControl('', Validators.required) }));
    }

    const fixture = TestBed.createComponent(SwapHost);

    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const first = () => root.querySelectorAll('.stepper-step')[0].classList;

    root.querySelectorAll<HTMLElement>('mud-step-header')[1].click();
    await fixture.whenStable();
    expect(first()).toContain('stepper-step--blocked');

    const replacement = new FormGroup({ name: new FormControl('Ana', Validators.required) });

    fixture.componentInstance.control.set(replacement);
    await fixture.whenStable();
    expect(first()).toContain('stepper-step--completed');

    // Only the NEW control's statusChanges may drive the header now.
    replacement.controls.name.setValue('');
    await fixture.whenStable();
    expect(first()).toContain('stepper-step--blocked');
  });

  it('vertical: panels render inline inside each step', async () => {
    const t = await renderStepper((host) => host.orientation.set('vertical'));

    expect(t.list().classList).toContain('stepper--vertical');
    // panel is a descendant of its .stepper-step wrapper
    expect(t.steps()[0].querySelector('[role="region"] #panel-1')).not.toBeNull();
    expect(t.steps()[1].querySelector<HTMLElement>('[role="region"]')!.hidden).toBe(true);
  });

  it('vertical: keydown from inside the selected panel content does not reach the stepper', async () => {
    const t = await renderStepper((host) => host.orientation.set('vertical'));

    // Move keyboard-active header to step 2 (arrow keys move focus without
    // selecting) so a leaked keydown reaching the stepper would be observable:
    // it would select step 2, not just no-op re-select step 0.
    t.headers()[0].focus();
    keydown(t.headers()[0], 'ArrowDown', 40);
    await t.fixture.whenStable();
    expect(t.host.stepper().selectedIndex).toBe(0); // arrow move ≠ selection

    const inside = t.root.querySelector<HTMLElement>('#panel-1')!;
    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });

    Object.defineProperty(event, 'keyCode', { get: () => 32 });
    inside.dispatchEvent(event);
    await t.fixture.whenStable();

    expect(t.host.stepper().selectedIndex).toBe(0);
    expect(event.defaultPrevented).toBe(false);
  });
});

@Component({
  imports: [MudStepper, MudStep],
  template: `
    <mud-stepper [linear]="true">
      <mud-step label="Identity" [stepControl]="identity"><p>one</p></mud-step>
      <mud-step label="Review"><p>two</p></mud-step>
    </mud-stepper>
  `,
})
class SignalFormsHost {
  readonly stepper = viewChild.required(MudStepper);
  readonly model = signal({ name: '' });
  readonly identity = form(this.model, (path) => {
    required(path.name);
  });
}

describe('MudStepper with signal forms', () => {
  it('gates linear navigation on field validity and derives completed reactively', async () => {
    const fixture = TestBed.createComponent(SignalFormsHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    const steps = () => Array.from(root.querySelectorAll<HTMLElement>('.stepper-step'));

    host.stepper().next();
    await fixture.whenStable();

    expect(host.stepper().selectedIndex).toBe(0); // invalid field blocks

    host.model.set({ name: 'Ana' });
    await fixture.whenStable();
    host.stepper().next();
    await fixture.whenStable();

    expect(host.stepper().selectedIndex).toBe(1);
    expect(steps()[0].classList).toContain('stepper-step--completed');
  });

  it('shows blocked when leaving a step with an invalid field (non-linear)', async () => {
    @Component({
      imports: [MudStepper, MudStep],
      template: `
        <mud-stepper>
          <mud-step label="Identity" [stepControl]="identity"><p>one</p></mud-step>
          <mud-step label="Review"><p>two</p></mud-step>
        </mud-stepper>
      `,
    })
    class NonLinearSignalHost {
      readonly model = signal({ name: '' });
      readonly identity = form(this.model, (path) => {
        required(path.name);
      });
    }

    const fixture = TestBed.createComponent(NonLinearSignalHost);

    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    root.querySelectorAll<HTMLElement>('mud-step-header')[1].click();
    await fixture.whenStable();

    expect(root.querySelectorAll('.stepper-step')[0].classList).toContain(
      'stepper-step--blocked',
    );

    // becoming valid clears the blocked state without any stepper event
    fixture.componentInstance.model.set({ name: 'Ana' });
    await fixture.whenStable();

    expect(root.querySelectorAll('.stepper-step')[0].classList).toContain(
      'stepper-step--completed',
    );
  });
});

describe('MudStepper stepClick and compact', () => {
  it('emits a cancelable stepClick before selecting; preventDefault keeps selection', async () => {
    const fixture = TestBed.createComponent(StepClickHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const headers = fixture.nativeElement.querySelectorAll('mud-step-header');

    headers[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();

    expect(host.clicks).toEqual([1]);
    expect(host.stepper().selectedIndex).toBe(1);

    host.prevent.set(true);
    headers[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();

    expect(host.clicks).toEqual([1, 0]);
    expect(host.stepper().selectedIndex).toBe(1);
  });

  it('applies the compact class from the input', async () => {
    const fixture = TestBed.createComponent(StepClickHost);

    await fixture.whenStable();
    const track = fixture.nativeElement.querySelector('.stepper') as HTMLElement;

    expect(track.classList.contains('stepper--compact')).toBe(false);

    fixture.componentInstance.compact.set(true);
    await fixture.whenStable();
    expect(track.classList.contains('stepper--compact')).toBe(true);
  });
});

@Component({
  imports: [MudStepper, MudStep],
  template: `
    <mud-stepper [compact]="compact()" (stepClick)="onStepClick($event)">
      <mud-step label="One">one</mud-step>
      <mud-step label="Two">two</mud-step>
    </mud-stepper>
  `,
})
class StepClickHost {
  readonly stepper = viewChild.required(MudStepper);
  readonly compact = signal(false);
  readonly prevent = signal(false);
  readonly clicks: number[] = [];

  onStepClick(event: MudStepperStepClick): void {
    this.clicks.push(event.index);

    if (this.prevent()) event.preventDefault();
  }
}
