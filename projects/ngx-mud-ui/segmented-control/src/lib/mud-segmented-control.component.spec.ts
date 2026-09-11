import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { MudSegment, MudSegmentedControl } from './mud-segmented-control.component';
import type { MudSegmentedControlChange } from './mud-segmented-control.component';

@Component({
  imports: [MudSegmentedControl, MudSegment],
  template: `
    <mud-segmented-control
      [(value)]="value"
      [disabled]="groupDisabled()"
      [fullWidth]="fullWidth()"
      aria-label="View"
      (selectionChange)="changes.push($event)"
      (touch)="touches = touches + 1"
    >
      @if (showList()) {
        <button mud-segment value="list">List</button>
      }
      <button mud-segment value="grid" [disabled]="gridDisabled()">Grid</button>
      <button mud-segment value="map">Map</button>
    </mud-segmented-control>
  `,
})
class Host {
  readonly value = signal<string | undefined>('list');
  readonly groupDisabled = signal(false);
  readonly fullWidth = signal(false);
  readonly gridDisabled = signal(false);
  readonly showList = signal(true);
  readonly changes: MudSegmentedControlChange<string>[] = [];
  touches = 0;
}

@Component({
  imports: [MudSegmentedControl, MudSegment],
  template: `
    <mud-segmented-control [(value)]="value" aria-label="With icon">
      <button mud-segment value="alpha">
        <svg viewBox="0 0 16 16" aria-hidden="true"></svg>
        Alpha
      </button>
      <button mud-segment value="beta">Beta</button>
    </mud-segmented-control>
  `,
})
class IconHost {
  readonly value = signal<string | undefined>('alpha');
}

@Component({
  imports: [MudSegmentedControl, MudSegment],
  template: `
    <mud-segmented-control [(value)]="value" aria-label="Dynamic">
      @for (option of options(); track option) {
        <button mud-segment [value]="option">{{ option }}</button>
      }
    </mud-segmented-control>
  `,
})
class DynamicHost {
  readonly options = signal(['a', 'b', 'c']);
  readonly value = signal<string | undefined>('a');
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const host = fixture.componentInstance;
  const group = fixture.nativeElement.querySelector('mud-segmented-control') as HTMLElement;
  const buttons = () =>
    Array.from(
      fixture.nativeElement.querySelectorAll('button[mud-segment]'),
    ) as HTMLButtonElement[];

  return { fixture, host, group, buttons };
}

function keydown(target: HTMLElement, key: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('MudSegmentedControl', () => {
  it('renders a radiogroup of radio buttons with the design-system classes', async () => {
    const { group, buttons } = await render();

    expect(group.getAttribute('role')).toBe('radiogroup');
    expect(group.getAttribute('aria-label')).toBe('View');
    expect(group.classList.contains('segmented-control')).toBe(true);

    const all = buttons();

    expect(all.length).toBe(3);

    for (const button of all) {
      expect(button.getAttribute('role')).toBe('radio');
      expect(button.getAttribute('type')).toBe('button');
      expect(button.classList.contains('segment-item')).toBe(true);
    }
  });

  it('reflects the bound value as aria-checked and is-selected', async () => {
    const { buttons } = await render();

    const [list, grid, map] = buttons();

    expect(list.getAttribute('aria-checked')).toBe('true');
    expect(list.classList.contains('is-selected')).toBe(true);
    expect(grid.getAttribute('aria-checked')).toBe('false');
    expect(grid.classList.contains('is-selected')).toBe(false);
    expect(map.getAttribute('aria-checked')).toBe('false');
  });

  it('selects a segment on click, updating the model and emitting change', async () => {
    const { fixture, host, buttons } = await render();

    buttons()[1].click();
    await fixture.whenStable();

    expect(host.value()).toBe('grid');
    expect(buttons()[1].getAttribute('aria-checked')).toBe('true');
    expect(host.changes.length).toBe(1);
    expect(host.changes[0].value).toBe('grid');
    expect(host.changes[0].segment.value()).toBe('grid');
  });

  it('does not emit change for the initial value', async () => {
    const { host } = await render();

    expect(host.changes.length).toBe(0);
  });

  it('gives the selected segment the only tab stop (roving tabindex)', async () => {
    const { fixture, host, buttons } = await render();

    expect(buttons().map((b) => b.tabIndex)).toEqual([0, -1, -1]);

    host.value.set('map');
    await fixture.whenStable();

    expect(buttons().map((b) => b.tabIndex)).toEqual([-1, -1, 0]);
  });

  it('falls back to the first enabled segment as tab stop when nothing is selected', async () => {
    const { fixture, host, buttons } = await render();

    host.value.set(undefined);
    await fixture.whenStable();

    expect(buttons().map((b) => b.tabIndex)).toEqual([0, -1, -1]);
  });

  it('ArrowRight selects and focuses the next enabled segment, skipping disabled ones', async () => {
    const { fixture, host, buttons } = await render();

    host.gridDisabled.set(true);
    await fixture.whenStable();

    keydown(buttons()[0], 'ArrowRight');
    await fixture.whenStable();

    expect(host.value()).toBe('map');
    expect(document.activeElement).toBe(buttons()[2]);
  });

  it('ArrowRight wraps from the last to the first enabled segment', async () => {
    const { fixture, host, buttons } = await render();

    host.value.set('map');
    await fixture.whenStable();

    keydown(buttons()[2], 'ArrowRight');
    await fixture.whenStable();

    expect(host.value()).toBe('list');
  });

  it('ArrowLeft and ArrowUp select the previous enabled segment, wrapping backwards', async () => {
    const { fixture, host, buttons } = await render();

    keydown(buttons()[0], 'ArrowLeft');
    await fixture.whenStable();

    expect(host.value()).toBe('map');

    keydown(buttons()[2], 'ArrowUp');
    await fixture.whenStable();

    expect(host.value()).toBe('grid');
  });

  it('Home and End jump to the first and last enabled segments', async () => {
    const { fixture, host, buttons } = await render();

    host.value.set('grid');
    await fixture.whenStable();

    keydown(buttons()[1], 'End');
    await fixture.whenStable();

    expect(host.value()).toBe('map');

    keydown(buttons()[2], 'Home');
    await fixture.whenStable();

    expect(host.value()).toBe('list');
  });

  it('disables every segment button when the group is disabled', async () => {
    const { fixture, host, buttons } = await render();

    host.groupDisabled.set(true);
    await fixture.whenStable();

    expect(buttons().every((b) => b.disabled)).toBe(true);
  });

  it('keeps the selection when the whole group is disabled', async () => {
    const { fixture, host, buttons } = await render();

    host.value.set('grid');
    await fixture.whenStable();
    host.groupDisabled.set(true);
    await fixture.whenStable();

    expect(host.value()).toBe('grid');
    expect(buttons()[1].getAttribute('aria-checked')).toBe('true');
  });

  it('does not select a disabled segment on click', async () => {
    const { fixture, host, buttons } = await render();

    host.gridDisabled.set(true);
    await fixture.whenStable();

    buttons()[1].click();
    await fixture.whenStable();

    expect(host.value()).toBe('list');
    expect(host.changes.length).toBe(0);
  });

  it('self-heals to the closest enabled segment when the selected segment is removed', async () => {
    const { fixture, host } = await render();

    host.showList.set(false);
    await fixture.whenStable();

    expect(host.value()).toBe('grid');
  });

  it('self-heals to the closest enabled segment when the selected segment becomes disabled', async () => {
    const { fixture, host } = await render();

    host.value.set('grid');
    await fixture.whenStable();
    host.gridDisabled.set(true);
    await fixture.whenStable();

    expect(host.value()).toBe('list');
  });

  it('projects a leading icon before the truncating label span', async () => {
    const fixture = TestBed.createComponent(IconHost);

    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('button[mud-segment]') as HTMLButtonElement;
    const label = button.querySelector('.segment-label');

    expect(button.querySelector('svg')).toBeTruthy();
    expect(label).toBeTruthy();
    expect(label!.textContent).toContain('Alpha');
    expect(label!.querySelector('svg')).toBeNull();
  });

  it('adds the full-width modifier class when fullWidth is set', async () => {
    const { fixture, host, group } = await render();

    expect(group.classList.contains('segmented-control--full-width')).toBe(false);

    host.fullWidth.set(true);
    await fixture.whenStable();

    expect(group.classList.contains('segmented-control--full-width')).toBe(true);
  });

  it('renders segments whose values arrive via bindings (@for) without NG0950', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      const fixture = TestBed.createComponent(DynamicHost);

      await fixture.whenStable();
      const buttons = Array.from(
        fixture.nativeElement.querySelectorAll('button[mud-segment]'),
      ) as HTMLButtonElement[];

      expect(buttons.length).toBe(3);
      expect(buttons[0].getAttribute('aria-checked')).toBe('true');

      fixture.componentInstance.options.set(['x', 'a', 'y']);
      await fixture.whenStable();

      expect(fixture.componentInstance.value()).toBe('a');
      expect(error.mock.calls.filter(([first]) => String(first).includes('NG0950'))).toEqual([]);
    } finally {
      error.mockRestore();
    }
  });

  it('still selects via keyboard on non-browser platforms without touching focus', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });

    const { fixture, host, buttons } = await render();

    keydown(buttons()[0], 'ArrowRight');
    await fixture.whenStable();

    expect(host.value()).toBe('grid');
    expect(document.activeElement).toBe(document.body);
  });
});

describe('MudSegmentedControl size and forms integration', () => {
  it('maps size small to the sm modifier class', async () => {
    const fixture = TestBed.createComponent(SizedHost);

    await fixture.whenStable();
    const group = fixture.nativeElement.querySelector('mud-segmented-control') as HTMLElement;

    expect(group.classList.contains('segmented-control--sm')).toBe(true);
  });

  it('works as a form control: writeValue, user changes, and disabling', async () => {
    const fixture = TestBed.createComponent(FormHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const group = fixture.nativeElement.querySelector('mud-segmented-control') as HTMLElement;
    const buttons = Array.from(group.querySelectorAll('button')) as HTMLButtonElement[];

    expect(buttons[0].getAttribute('aria-checked')).toBe('true');

    buttons[1].click();
    await fixture.whenStable();
    expect(host.control.value).toBe('grid');

    host.control.setValue('list');
    await fixture.whenStable();
    expect(buttons[0].getAttribute('aria-checked')).toBe('true');

    host.control.disable();
    await fixture.whenStable();
    expect(group.classList.contains('segmented-control--disabled')).toBe(true);
    expect(buttons[1].disabled).toBe(true);

    host.control.enable();
    host.control.reset('grid');
    await fixture.whenStable();
    expect(buttons[1].getAttribute('aria-checked')).toBe('true');
  });

  it('emits touch only when focus leaves the group entirely', async () => {
    const { fixture, host, buttons } = await render();
    const [first, second] = buttons();

    first.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: second }));
    await fixture.whenStable();
    expect(host.touches).toBe(0);

    first.dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }),
    );
    await fixture.whenStable();
    expect(host.touches).toBe(1);
  });

  it('works as a signal-forms control: value round-trips through the model', async () => {
    const fixture = TestBed.createComponent(SignalHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button[mud-segment]'),
    ) as HTMLButtonElement[];

    expect(buttons[0].getAttribute('aria-checked')).toBe('true');

    buttons[1].click();
    await fixture.whenStable();
    expect(host.model().view).toBe('grid');

    host.model.set({ view: 'list' });
    await fixture.whenStable();
    expect(buttons[0].getAttribute('aria-checked')).toBe('true');
  });

  it("exercises the signal-forms field's own validation state", async () => {
    const fixture = TestBed.createComponent(SignalHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;

    host.model.set({ view: '' });
    await fixture.whenStable();
    expect(host.form.view().errors().length).toBeGreaterThan(0);

    host.model.set({ view: 'grid' });
    await fixture.whenStable();
    expect(host.form.view().errors().length).toBe(0);
  });

  it('marks the control touched on blur', async () => {
    const fixture = TestBed.createComponent(FormHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(host.control.touched).toBe(false);

    button.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    await fixture.whenStable();
    expect(host.control.touched).toBe(true);
  });
});

@Component({
  imports: [MudSegmentedControl, MudSegment],
  template: `
    <mud-segmented-control value="list" size="small" aria-label="View">
      <button mud-segment value="list">List</button>
      <button mud-segment value="grid">Grid</button>
    </mud-segmented-control>
  `,
})
class SizedHost {}

@Component({
  imports: [MudSegmentedControl, MudSegment, ReactiveFormsModule],
  template: `
    <mud-segmented-control [formControl]="control" aria-label="View">
      <button mud-segment value="list">List</button>
      <button mud-segment value="grid">Grid</button>
    </mud-segmented-control>
  `,
})
class FormHost {
  readonly control = new FormControl<string | null>('list');
}

@Component({
  imports: [MudSegmentedControl, MudSegment, FormField],
  template: `
    <mud-segmented-control [formField]="form.view" aria-label="View">
      <button mud-segment value="list">List</button>
      <button mud-segment value="grid">Grid</button>
    </mud-segmented-control>
  `,
})
class SignalHost {
  readonly model = signal({ view: 'list' });
  readonly form = form(this.model, (path) => {
    required(path.view, { message: 'Choose a view.' });
  });
}
