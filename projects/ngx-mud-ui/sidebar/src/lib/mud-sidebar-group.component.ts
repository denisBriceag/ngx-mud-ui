import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { MUD_SIDEBAR_GROUP_HOST } from './mud-sidebar-context';

let nextId = 0;

/**
 * ```html
 * <mud-sidebar-group heading="Filtrare împuterniciri după:">…rows…</mud-sidebar-group>
 * ```
 */
@Component({
  selector: 'mud-sidebar-group',
  exportAs: 'mudSidebarGroup',
  template: `
    @if (_divided()) {
      <div class="mud-sidebar-group__divider" aria-hidden="true"></div>
    }
    @if (heading()) {
      <div class="mud-sidebar-group__heading" [id]="_headingId">{{ heading() }}</div>
    }
    <ng-content />
  `,
  host: {
    class: 'mud-sidebar-group',
    role: 'group',
    '[class.mud-sidebar-group--divided]': '_divided()',
    '[attr.aria-labelledby]': 'heading() ? _headingId : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MudSidebarGroup {
  private readonly _sidebar = inject(MUD_SIDEBAR_GROUP_HOST, { optional: true });

  protected readonly _headingId = `mud-sidebar-group-heading-${nextId++}`;

  /** @description Section heading; hidden in the compact rail. */
  readonly heading = input('', { transform: (value: string | undefined) => (value ?? '').trim() });
  /** @description Divider above the group; unset = every group except the first. */
  readonly divider = input<boolean | undefined, unknown>(undefined, {
    transform: (value: unknown) => (value === undefined || value === null ? undefined : booleanAttribute(value)),
  });

  protected readonly _divided = computed(
    () => this.divider() ?? (this._sidebar ? !this._sidebar.isFirstGroup(this) : false),
  );
}
