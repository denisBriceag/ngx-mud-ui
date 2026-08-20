import { TestBed } from '@angular/core/testing';
import { Component, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, required } from '@angular/forms/signals';
import { EgovProgressTracker } from './egov-progress-tracker.component';
import { EgovStep } from './egov-step.component';
import { EgovStepHeader } from './egov-step-header.component';

describe('EgovStepHeader', () => {
  async function renderHeader(state: string) {
    const fixture = TestBed.createComponent(EgovStepHeader);

    fixture.componentRef.setInput('state', state);
    fixture.componentRef.setInput('index', 2);
    fixture.componentRef.setInput('label', 'Address');
    fixture.componentRef.setInput('secondaryText', 'Where you live');
    await fixture.whenStable();

    return fixture.nativeElement as HTMLElement;
  }

  it('renders the 1-based number, heading and supporting text', async () => {
    const el = await renderHeader('current');

    expect(el.querySelector('.progress-step__number')?.textContent?.trim()).toBe('3');
    expect(el.querySelector('.progress-step__heading')?.textContent).toBe('Address');
    expect(el.querySelector('.progress-step__supporting')?.textContent).toBe('Where you live');
  });

  it("overrides CdkStepHeader's inherited role=tab with role=button", async () => {
    const el = await renderHeader('current');

    expect(el.getAttribute('role')).toBe('button');
  });

  it('renders the check icon instead of the number when completed', async () => {
    const el = await renderHeader('completed');

    expect(el.querySelector('.progress-step__number')).toBeNull();
    expect(el.querySelector('svg.progress-step__icon--check')).not.toBeNull();
  });

  it('renders the exclamation icon when blocked', async () => {
    const el = await renderHeader('blocked');

    expect(el.querySelector('.progress-step__number')).toBeNull();
    expect(el.querySelector('svg.progress-step__icon--blocked')).not.toBeNull();
  });

  it('still announces secondaryText for a blocked step with no label', async () => {
    const fixture = TestBed.createComponent(EgovStepHeader);

    fixture.componentRef.setInput('state', 'blocked');
    fixture.componentRef.setInput('index', 0);
    fixture.componentRef.setInput('secondaryText', 'Something failed');
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.progress-step__heading')).toBeNull();
    expect(el.querySelector('.progress-step__supporting')?.textContent).toContain(
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
  imports: [EgovProgressTracker, EgovStep, ReactiveFormsModule],
  template: `
    <egov-progress-tracker
      [linear]="linear()"
      [orientation]="orientation()"
      (selectedIndexChange)="indexes.push($event)"
    >
      <egov-step label="Identity" supportingText="Who you are" [stepControl]="identity">
        <p id="panel-1">Identity content</p>
      </egov-step>
      <egov-step label="Address" errorMessage="Address is incomplete" [stepControl]="address">
        <p id="panel-2">Address content</p>
      </egov-step>
      <egov-step label="Review">
        <p id="panel-3">Review content</p>
      </egov-step>
    </egov-progress-tracker>
  `,
})
class TrackerHost {
  readonly tracker = viewChild.required(EgovProgressTracker);
  readonly linear = signal(false);
  readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
  readonly indexes: number[] = [];
  readonly identity = new FormGroup({ name: new FormControl('', Validators.required) });
  readonly address = new FormGroup({ street: new FormControl('', Validators.required) });
}

async function renderTracker(setup?: (host: TrackerHost) => void) {
  const fixture = TestBed.createComponent(TrackerHost);

  setup?.(fixture.componentInstance);
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;

  return {
    fixture,
    host: fixture.componentInstance,
    root,
    steps: () => Array.from(root.querySelectorAll<HTMLElement>('.progress-step')),
    headers: () => Array.from(root.querySelectorAll<HTMLElement>('egov-step-header')),
    panels: () => Array.from(root.querySelectorAll<HTMLElement>('[role="region"]')),
    list: () => root.querySelector<HTMLElement>('[role="list"]')!,
  };
}

describe('EgovProgressTracker', () => {
  it('renders one header per step; first step is current, list semantics + aria-current wiring', async () => {
    const t = await renderTracker();
    const steps = t.steps();

    expect(steps.length).toBe(3);
    expect(steps[0].classList).toContain('progress-step--current');
    expect(t.list()).not.toBeNull();
    expect(t.list().hasAttribute('aria-orientation')).toBe(false);
    expect(steps[0].getAttribute('role')).toBe('listitem');
    // Connector must be a real aria-hidden element, not a pseudo-element —
    // ancestor pseudo-elements make axe's color-contrast check abstain.
    expect(steps[0].querySelector('.progress-step__connector')?.getAttribute('aria-hidden')).toBe(
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
    const t = await renderTracker();

    expect(t.steps()[2].classList).toContain('progress-step--available');
    t.headers()[2].click();
    await t.fixture.whenStable();

    expect(t.host.tracker().selectedIndex).toBe(2);
    expect(t.steps()[2].classList).toContain('progress-step--current');
    expect(t.host.indexes).toEqual([2]);
  });

  it('derives completed (interacted + valid) with check icon and blocked (interacted + invalid) with errorMessage', async () => {
    const t = await renderTracker((host) => {
      host.identity.controls.name.setValue('Ana');
    });

    // leave step 1 (valid) → completed; land on step 2, leave it invalid → blocked
    t.headers()[1].click();
    await t.fixture.whenStable();
    t.headers()[2].click();
    await t.fixture.whenStable();

    expect(t.steps()[0].classList).toContain('progress-step--completed');
    expect(t.steps()[0].querySelector('.progress-step__icon--check')).not.toBeNull();
    expect(t.steps()[1].classList).toContain('progress-step--blocked');
    // errorMessage replaces the supporting text while blocked
    expect(t.steps()[1].querySelector('.progress-step__supporting')?.textContent).toContain(
      'Address is incomplete',
    );
  });

  it('linear: future steps are incomplete + aria-disabled, click is a no-op, next() is gated by validity', async () => {
    const t = await renderTracker((host) => host.linear.set(true));

    expect(t.steps()[1].classList).toContain('progress-step--incomplete');
    expect(t.headers()[1].getAttribute('aria-disabled')).toBe('true');

    t.headers()[1].click();
    await t.fixture.whenStable();

    expect(t.host.tracker().selectedIndex).toBe(0);

    t.host.tracker().next();
    await t.fixture.whenStable();

    expect(t.host.tracker().selectedIndex).toBe(0); // identity invalid → blocked

    t.host.identity.controls.name.setValue('Ana');
    t.host.tracker().next();
    await t.fixture.whenStable();

    expect(t.host.tracker().selectedIndex).toBe(1);
  });

  it('re-renders header state when a control becomes valid programmatically (statusChanges bridge)', async () => {
    const t = await renderTracker();

    t.headers()[1].click(); // leave step 1 invalid → blocked
    await t.fixture.whenStable();

    expect(t.steps()[0].classList).toContain('progress-step--blocked');

    t.host.identity.controls.name.setValue('Ana'); // no user event on the tracker
    await t.fixture.whenStable();

    expect(t.steps()[0].classList).toContain('progress-step--completed');
  });

  it('honours completed/hasError/state overrides and falls back to the derived state for unknown forced states', async () => {
    @Component({
      imports: [EgovProgressTracker, EgovStep],
      template: `
        <egov-progress-tracker>
          <egov-step label="A"><p>a</p></egov-step>
          <egov-step label="B" [completed]="true"><p>b</p></egov-step>
          <egov-step label="C" [hasError]="true"><p>c</p></egov-step>
          <egov-step label="D" state="blocked"><p>d</p></egov-step>
          <egov-step label="E" state="edit"><p>e</p></egov-step>
        </egov-progress-tracker>
      `,
    })
    class OverridesHost {}

    const fixture = TestBed.createComponent(OverridesHost);

    await fixture.whenStable();
    const steps = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.progress-step'),
    );

    expect(steps[1].classList).toContain('progress-step--completed');
    expect(steps[2].classList).toContain('progress-step--blocked');
    expect(steps[3].classList).toContain('progress-step--blocked');
    // "edit" is not an EgovStepState — ignore it and derive (non-linear → available)
    expect(steps[4].classList).toContain('progress-step--available');
    expect(steps[4].classList).not.toContain('progress-step--edit');
  });

  it('keyboard: arrows move focus, Enter selects, roving tabindex follows', async () => {
    const t = await renderTracker();

    t.headers()[0].focus();
    keydown(t.headers()[0], 'ArrowRight', 39);
    await t.fixture.whenStable();

    expect(document.activeElement).toBe(t.headers()[1]);
    expect(t.headers()[1].tabIndex).toBe(0);
    expect(t.headers()[0].tabIndex).toBe(-1);

    keydown(t.headers()[1], 'Enter', 13);
    await t.fixture.whenStable();

    expect(t.host.tracker().selectedIndex).toBe(1);
  });

  it('linear: keyboard Enter on a focused non-navigable header is a no-op', async () => {
    const t = await renderTracker((host) => host.linear.set(true));

    // arrows move focus freely; only selection is gated in linear mode
    t.headers()[0].focus();
    keydown(t.headers()[0], 'ArrowRight', 39);
    await t.fixture.whenStable();

    expect(document.activeElement).toBe(t.headers()[1]);

    keydown(t.headers()[1], 'Enter', 13);
    await t.fixture.whenStable();

    expect(t.host.tracker().selectedIndex).toBe(0);
    expect(t.host.indexes).toEqual([]);
  });

  it('statusChanges bridge re-subscribes for dynamically added steps', async () => {
    @Component({
      imports: [EgovProgressTracker, EgovStep, ReactiveFormsModule],
      template: `
        <egov-progress-tracker>
          <egov-step label="Identity"><p>one</p></egov-step>
          @if (showExtra()) {
            <egov-step label="Extra" [stepControl]="extra"><p>extra</p></egov-step>
          }
          <egov-step label="Review"><p>two</p></egov-step>
        </egov-progress-tracker>
      `,
    })
    class DynamicHost {
      readonly showExtra = signal(false);
      readonly extra = new FormGroup({ value: new FormControl('', Validators.required) });
    }

    const fixture = TestBed.createComponent(DynamicHost);

    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const headers = () => Array.from(root.querySelectorAll<HTMLElement>('egov-step-header'));
    const steps = () => Array.from(root.querySelectorAll<HTMLElement>('.progress-step'));

    fixture.componentInstance.showExtra.set(true);
    await fixture.whenStable();

    expect(steps().length).toBe(3);

    // visit the added step and leave it invalid → blocked
    headers()[1].click();
    await fixture.whenStable();
    headers()[2].click();
    await fixture.whenStable();

    expect(steps()[1].classList).toContain('progress-step--blocked');

    // programmatic validity change on the ADDED control must re-render,
    // proving the bridge re-subscribed after steps.changes
    fixture.componentInstance.extra.controls.value.setValue('filled');
    await fixture.whenStable();

    expect(steps()[1].classList).toContain('progress-step--completed');
  });

  it('vertical: panels render inline inside each step', async () => {
    const t = await renderTracker((host) => host.orientation.set('vertical'));

    expect(t.list().classList).toContain('progress-tracker--vertical');
    // panel is a descendant of its .progress-step wrapper
    expect(t.steps()[0].querySelector('[role="region"] #panel-1')).not.toBeNull();
    expect(t.steps()[1].querySelector<HTMLElement>('[role="region"]')!.hidden).toBe(true);
  });

  it('vertical: keydown from inside the selected panel content does not reach the stepper', async () => {
    const t = await renderTracker((host) => host.orientation.set('vertical'));

    // Move keyboard-active header to step 2 (arrow keys move focus without
    // selecting) so a leaked keydown reaching the stepper would be observable:
    // it would select step 2, not just no-op re-select step 0.
    t.headers()[0].focus();
    keydown(t.headers()[0], 'ArrowDown', 40);
    await t.fixture.whenStable();
    expect(t.host.tracker().selectedIndex).toBe(0); // arrow move ≠ selection

    const inside = t.root.querySelector<HTMLElement>('#panel-1')!;
    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });

    Object.defineProperty(event, 'keyCode', { get: () => 32 });
    inside.dispatchEvent(event);
    await t.fixture.whenStable();

    expect(t.host.tracker().selectedIndex).toBe(0);
    expect(event.defaultPrevented).toBe(false);
  });
});

@Component({
  imports: [EgovProgressTracker, EgovStep],
  template: `
    <egov-progress-tracker [linear]="true">
      <egov-step label="Identity" [stepControl]="identity"><p>one</p></egov-step>
      <egov-step label="Review"><p>two</p></egov-step>
    </egov-progress-tracker>
  `,
})
class SignalFormsHost {
  readonly tracker = viewChild.required(EgovProgressTracker);
  readonly model = signal({ name: '' });
  readonly identity = form(this.model, (path) => {
    required(path.name);
  });
}

describe('EgovProgressTracker with signal forms', () => {
  it('gates linear navigation on field validity and derives completed reactively', async () => {
    const fixture = TestBed.createComponent(SignalFormsHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    const steps = () => Array.from(root.querySelectorAll<HTMLElement>('.progress-step'));

    host.tracker().next();
    await fixture.whenStable();

    expect(host.tracker().selectedIndex).toBe(0); // invalid field blocks

    host.model.set({ name: 'Ana' });
    await fixture.whenStable();
    host.tracker().next();
    await fixture.whenStable();

    expect(host.tracker().selectedIndex).toBe(1);
    expect(steps()[0].classList).toContain('progress-step--completed');
  });

  it('shows blocked when leaving a step with an invalid field (non-linear)', async () => {
    @Component({
      imports: [EgovProgressTracker, EgovStep],
      template: `
        <egov-progress-tracker>
          <egov-step label="Identity" [stepControl]="identity"><p>one</p></egov-step>
          <egov-step label="Review"><p>two</p></egov-step>
        </egov-progress-tracker>
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

    root.querySelectorAll<HTMLElement>('egov-step-header')[1].click();
    await fixture.whenStable();

    expect(root.querySelectorAll('.progress-step')[0].classList).toContain(
      'progress-step--blocked',
    );

    // becoming valid clears the blocked state without any tracker event
    fixture.componentInstance.model.set({ name: 'Ana' });
    await fixture.whenStable();

    expect(root.querySelectorAll('.progress-step')[0].classList).toContain(
      'progress-step--completed',
    );
  });
});

describe('EgovProgressTracker on the server platform', () => {
  it('constructs and renders its first frame without browser-only assumptions', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });

    const fixture = TestBed.createComponent(TrackerHost);

    await fixture.whenStable();

    expect(fixture.componentInstance.tracker()).toBeTruthy();
    expect(fixture.componentInstance.tracker().selectedIndex).toBe(0);
  });
});
