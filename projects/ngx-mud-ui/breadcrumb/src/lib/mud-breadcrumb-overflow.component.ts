import type { OverlayRef } from '@angular/cdk/overlay';
import { Overlay } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import type { OnDestroy, TemplateRef } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { forwardCrumbClick } from './forward-crumb-click';
import type { MudBreadcrumbItem } from './mud-breadcrumb-item.directive';
import { _MudMenuStyles, MudStyleLoader } from 'ngx-mud-ui/core';
import { injectMudLabels, _mudText } from 'ngx-mud-ui/i18n';
import { _MudBreadcrumbStyles } from './mud-breadcrumb-styles.component';

let nextUniqueId = 0;

/** The `…` disclosure that reveals the collapsed crumbs. Created by MudBreadcrumb. */
@Component({
  selector: 'mud-breadcrumb-overflow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mud-breadcrumb__overflow', role: 'listitem' },
  template: `
    <button
      type="button"
      class="mud-breadcrumb__overflow-trigger"
      [attr.aria-label]="_label()"
      [attr.aria-expanded]="_open()"
      [attr.aria-controls]="_open() ? panelId : null"
      (click)="toggle()"
    >
      &hellip;
    </button>

    <ng-template #panel>
      <!-- The ul itself is never focused: focus always lives on one of its link/button
           children, which is what the roving arrow-key navigation moves between. -->
      <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -->
      <ul class="menu mud-breadcrumb__panel" [id]="panelId" (keydown)="_onKeydown($event)">
        @for (crumb of items(); track crumb) {
          <li class="mud-breadcrumb__panel-row">
            @if (crumb.href(); as href) {
              <a
                class="menu__item mud-breadcrumb__panel-item"
                [attr.href]="href"
                (click)="_forward($event, crumb)"
                ><span class="menu__label">{{ crumb.text() }}</span></a
              >
            } @else {
              <button
                type="button"
                class="menu__item mud-breadcrumb__panel-item"
                (click)="_forward($event, crumb)"
              >
                <span class="menu__label">{{ crumb.text() }}</span>
              </button>
            }
          </li>
        }
      </ul>
    </ng-template>
  `,
})
export class MudBreadcrumbOverflow implements OnDestroy {
  private readonly _overlay = inject(Overlay);
  private readonly _viewContainerRef = inject(ViewContainerRef);
  private readonly _element: HTMLElement = inject(ElementRef).nativeElement;
  private readonly _panel = viewChild.required<TemplateRef<unknown>>('panel');
  private _overlayRef: OverlayRef | null = null;

  /** @description Crumbs the container collapsed out of the trail. */
  readonly items = input<readonly MudBreadcrumbItem[]>([]);
  /** @description Accessible name for the trigger. */
  readonly label = input<string | undefined>(undefined);

  private readonly _labels = injectMudLabels();

  protected readonly _label = computed(() => _mudText(this.label(), this._labels().breadcrumb.overflow));

  readonly panelId = `mud-breadcrumb-panel-${String(nextUniqueId++)}`;

  protected readonly _open = signal(false);

  constructor() {
    const styles = inject(MudStyleLoader);

    styles.load(_MudBreadcrumbStyles);
    styles.load(_MudMenuStyles);
  }

  ngOnDestroy(): void {
    this._dispose();
  }

  toggle(): void {
    if (this._open()) {
      this.close(true);

      return;
    }

    this._attach();
  }

  /** Closes the panel; restoreFocus pulls focus back to the `…` trigger. */
  close(restoreFocus: boolean): void {
    if (!this._open()) return;

    this._dispose();
    this._open.set(false);

    if (restoreFocus) this._triggerElement()?.focus();
  }

  private _attach(): void {
    const overlayRef = this._overlay.create({
      positionStrategy: this._overlay
        .position()
        .flexibleConnectedTo(this._triggerElement() ?? this._element)
        .withPositions([
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
        ]),
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
    });

    overlayRef.attach(new TemplatePortal(this._panel(), this._viewContainerRef));
    overlayRef.outsidePointerEvents().subscribe((event) => {
      if (this._triggerElement()?.contains(event.target as Node)) return;

      this.close(false);
    });

    this._overlayRef = overlayRef;
    this._open.set(true);
    this._links()[0]?.focus();
  }

  private _dispose(): void {
    this._overlayRef?.dispose();
    this._overlayRef = null;
  }

  private _triggerElement(): HTMLButtonElement | null {
    return this._element.querySelector<HTMLButtonElement>('.mud-breadcrumb__overflow-trigger');
  }

  private _links(): HTMLElement[] {
    const panel = this._overlayRef?.overlayElement;

    return panel ? [...panel.querySelectorAll<HTMLElement>('.mud-breadcrumb__panel-item')] : [];
  }

  protected _onKeydown(event: KeyboardEvent): void {
    const links = this._links();
    const index = links.indexOf(document.activeElement as HTMLElement);

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.close(true);

        return;
      case 'ArrowDown':
        event.preventDefault();
        links[(index + 1) % links.length]?.focus();

        return;
      case 'ArrowUp':
        event.preventDefault();
        links[index <= 0 ? links.length - 1 : index - 1]?.focus();

        return;
      case 'Home':
        event.preventDefault();
        links[0]?.focus();

        return;
      case 'End':
        event.preventDefault();
        links[links.length - 1]?.focus();

        return;
      case 'Tab':
        this.close(true);

        return;
      default:
        return;
    }
  }

  protected _forward(event: MouseEvent, crumb: MudBreadcrumbItem): void {
    forwardCrumbClick(event, crumb, () => this.close(false));
  }
}
