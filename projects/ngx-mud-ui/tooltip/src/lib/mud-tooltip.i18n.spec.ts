import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MUD_LABELS_RO, provideMudLabels } from 'ngx-mud-ui/i18n';
import { MudTooltip } from './mud-tooltip.directive';

@Component({
  imports: [MudTooltip],
  template: `<button mudTooltip="Tip" tooltipVariant="coach" [tooltipCloseLabel]="label()" [tooltipCoachHint]="hint()">T</button>`,
})
class Host {
  readonly label = signal<string | undefined>(undefined);
  readonly hint = signal<string | undefined>(undefined);
}

async function open() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  fixture.debugElement.query(By.directive(MudTooltip)).injector.get(MudTooltip).show();
  await fixture.whenStable();

  return {
    fixture,
    close: () => document.querySelector('.tooltip-close')!.getAttribute('aria-label'),
    hint: () => document.querySelector('.tooltip-hint')!.textContent,
  };
}

describe('MudTooltip i18n', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((e) => (e.innerHTML = '')));

  it('uses the English defaults with no provider', async () => {
    const { close, hint } = await open();

    expect(close()).toBe('Close');
    expect(hint()).toBe('Press Esc to close');
  });

  it('uses the Romanian pack when provided', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const { close, hint } = await open();

    expect(close()).toBe(MUD_LABELS_RO.tooltip!.close);
    expect(hint()).toBe(MUD_LABELS_RO.tooltip!.coachHint);
  });

  it('instance inputs win', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const { fixture, close, hint } = await open();

    fixture.componentInstance.label.set('Mine');
    fixture.componentInstance.hint.set('Hint');
    await fixture.whenStable();
    expect(close()).toBe('Mine');
    expect(hint()).toBe('Hint');
  });
});
