import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import type { OnDestroy, TemplateRef } from '@angular/core';
import { injectMudLabels, _mudText } from 'ngx-mud-ui/i18n';
import type { MudToastVariant } from './mud-toast-config';
import type { MudToastEntry } from './mud-toast-entry';
import { MudToastTimer } from './mud-toast-timer';

const ASSERTIVE: ReadonlySet<MudToastVariant> = new Set<MudToastVariant>(['warning', 'error']);

const ANIMATION_TIMEOUT_MS = 600;

@Component({
  selector: 'mud-toast-item',
  imports: [NgComponentOutlet, NgTemplateOutlet],
  template: `
    <div class="mud-toast__main">
      <span class="mud-toast__icon" aria-hidden="true">
        @if (iconTemplate(); as tpl) {
          <ng-container *ngTemplateOutlet="tpl; context: ctx()" />
        } @else {
          @switch (entry().config.variant) {
            @case ('warning') {
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false">
                <path
                  fill="currentColor"
                  fill-rule="evenodd"
                  d="M10.276 3.972c.773-1.314 2.675-1.314 3.448 0L21.976 18c.784 1.333-.178 3.014-1.724 3.014H3.748c-1.546 0-2.508-1.68-1.723-3.014zM12 10.014a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1m-1.25 6a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0"
                  clip-rule="evenodd"
                />
              </svg>
            }
            @case ('success') {
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false">
                <path
                  fill="currentColor"
                  fill-rule="evenodd"
                  d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2m3.58 7.975a.75.75 0 0 0-1.16-.95l-3.976 4.859L9.03 12.47a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.11-.055z"
                  clip-rule="evenodd"
                />
              </svg>
            }
            @case ('error') {
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false">
                <path
                  fill="currentColor"
                  fill-rule="evenodd"
                  d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2m-1 9c0-.55.5-1 1-1s1 .448 1 1v5a1 1 0 1 1-2 0zm1-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2"
                  clip-rule="evenodd"
                />
              </svg>
            }
            @default {
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false">
                <path
                  fill="currentColor"
                  fill-rule="evenodd"
                  d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2m-2 9a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-4a1 1 0 0 1-1-1m2-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2"
                  clip-rule="evenodd"
                />
              </svg>
            }
          }
        }
      </span>

      <div
        class="mud-toast__content"
        [attr.role]="live() ? liveRole() : null"
        [attr.aria-live]="live() ? livePoliteness() : null"
        [attr.aria-atomic]="live() ? 'true' : null"
      >
        @if (entry().componentType; as component) {
          <ng-container *ngComponentOutlet="component; injector: entry().componentInjector!" />
        } @else {
          <div class="mud-toast__heading">
            @if (titleTemplate(); as tpl) {
              <div class="mud-toast__title"><ng-container *ngTemplateOutlet="tpl; context: ctx()" /></div>
            } @else if (titleText(); as text) {
              <p class="mud-toast__title">{{ text }}</p>
            }

            @if (messageTemplate(); as tpl) {
              <div class="mud-toast__body"><ng-container *ngTemplateOutlet="tpl; context: ctx()" /></div>
            } @else if (hasMessage()) {
              <p class="mud-toast__body">{{ messageText() }}</p>
            }
          </div>

          @if (entry().data?.actions; as tpl) {
            <div class="mud-toast__actions"><ng-container *ngTemplateOutlet="tpl; context: ctx()" /></div>
          }
        }
      </div>
    </div>

    @if (entry().config.showCloseButton) {
      <button
        type="button"
        class="mud-toast__close"
        [attr.aria-label]="_closeLabel()"
        (click)="close()"
      >
        <span class="mud-toast__close-icon" aria-hidden="true">
          <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" focusable="false">
            <path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </span>
      </button>
    }
  `,
  host: {
    class: 'mud-toast',
    '[class.mud-toast--info]': 'entry().config.variant === "info"',
    '[class.mud-toast--warning]': 'entry().config.variant === "warning"',
    '[class.mud-toast--success]': 'entry().config.variant === "success"',
    '[class.mud-toast--error]': 'entry().config.variant === "error"',
    '[class.mud-toast--has-title]': 'hasTitle()',
    '[class.mud-toast--stacked]': 'stacked()',
    '[class.mud-toast--leaving]': 'entry().leaving()',
    '[attr.data-toast-id]': 'entry().id',
    '(pointerenter)': 'onHoverStart()',
    '(pointerleave)': 'onHoverEnd()',
    '(focusin)': 'onFocusIn()',
    '(focusout)': 'onFocusOut()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudToastItem implements OnDestroy {
  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _labels = injectMudLabels();

  protected readonly _closeLabel = computed(() => _mudText(this.entry().config.closeLabel, this._labels().toast.close));

  readonly entry = input.required<MudToastEntry>();

  // Type locator, not a ref string, so a renamed exportAs can't silently yield `undefined`.
  private readonly _outlet = viewChild(NgComponentOutlet);
  private _timer: MudToastTimer | null = null;
  private _hovering = false;
  private _focused = false;

  readonly iconTemplate = computed(() => this.entry().data?.icon ?? null);

  readonly live = computed(() => !this.entry().config.announcementMessage);
  readonly liveRole = computed(() => (ASSERTIVE.has(this.entry().config.variant) ? 'alert' : 'status'));
  readonly livePoliteness = computed(() => (ASSERTIVE.has(this.entry().config.variant) ? 'assertive' : 'polite'));

  readonly hasTitle = computed(() => {
    const title = this.entry().data?.title;

    return typeof title === 'string' ? title.trim().length > 0 : !!title;
  });

  readonly hasMessage = computed(() => {
    const message = this.entry().data?.message;

    return typeof message === 'string' ? message.trim().length > 0 : !!message;
  });

  /** More than one row (title, message, actions) or custom content: icon and close align to the top. */
  readonly stacked = computed(
    () =>
      !!this.entry().componentType ||
      [this.hasTitle(), this.hasMessage(), !!this.entry().data?.actions].filter(Boolean).length > 1,
  );

  readonly titleTemplate = computed(() => this._asTemplate(this.entry().data?.title));
  readonly titleText = computed(() => this._asText(this.entry().data?.title));
  readonly messageTemplate = computed(() => this._asTemplate(this.entry().data?.message));
  readonly messageText = computed(() => this._asText(this.entry().data?.message) ?? '');

  /** Projected templates can dismiss their own toast: `let-ref` then `ref.dismiss()`. */
  readonly ctx = computed(() => ({ $implicit: this.entry().ref }));

  constructor() {
    effect((onCleanup) => {
      const entry = this.entry();

      this._timer?.destroy();
      this._timer = new MudToastTimer(entry.config.duration, () => entry.ref.dismiss('timeout'));
      this._timer.start();

      onCleanup(() => {
        this._timer?.destroy();
        this._timer = null;
      });
    });

    // The service owns the ref and is the only writer of ref.instance.
    effect(() => {
      const instance = this._outlet()?.componentInstance;

      if (instance) this.entry().onComponentRendered?.(instance);
    });
  }

  /** @description Resolves once the enter animation has finished, or at once if there is none. */
  async playEnter(): Promise<void> {
    await this._settleAnimations();
  }

  /** @description Runs the exit animation, resolving immediately when there is none. */
  async playExit(): Promise<void> {
    await this._settleAnimations();
  }

  // No running animation (reduced motion, no CSS) must not strand a queue slot. Finished animations are
  // filtered: the `fill: both` enter stays in getAnimations() and would end the race early.
  private async _settleAnimations(): Promise<void> {
    const el = this._host.nativeElement;
    const animations = (typeof el.getAnimations === 'function' ? el.getAnimations({ subtree: true }) : []).filter(
      (animation) => animation.playState !== 'finished',
    );

    if (animations.length === 0) return;

    await Promise.race([
      Promise.allSettled(animations.map((animation) => animation.finished)),
      new Promise((resolve) => setTimeout(resolve, ANIMATION_TIMEOUT_MS)),
    ]);
  }

  /** @description Dismisses via the close button. */
  close(): void {
    this.entry().ref.dismiss('close-button');
  }

  onHoverStart(): void {
    if (!this.entry().config.pauseOnHover || this._hovering) return;

    this._hovering = true;
    this._timer?.pause();
  }

  onHoverEnd(): void {
    if (!this._hovering) return;

    this._hovering = false;
    this._timer?.resume();
  }

  // Unconditional: dismissing a toast that owns focus destroys the user's focus target.
  onFocusIn(): void {
    if (this._focused) return;

    this._focused = true;
    this._timer?.pause();
  }

  onFocusOut(): void {
    if (!this._focused) return;

    this._focused = false;
    this._timer?.resume();
  }

  ngOnDestroy(): void {
    this._timer?.destroy();
  }

  private _asTemplate(value: string | TemplateRef<unknown> | undefined): TemplateRef<unknown> | null {
    return value && typeof value !== 'string' ? value : null;
  }

  private _asText(value: string | TemplateRef<unknown> | undefined): string | null {
    const text = typeof value === 'string' ? value.trim() : '';

    return text.length > 0 ? text : null;
  }
}
