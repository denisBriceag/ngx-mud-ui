import { Directive, ElementRef, inject } from '@angular/core';

import type { MudMegaMenuTriggerHandle } from './mud-mega-menu.types';

/**
 * ```html
 * <header mudMegaMenuOrigin>…nav buttons…</header>
 * ```
 */
@Directive({ selector: '[mudMegaMenuOrigin]' })
export class MudMegaMenuOrigin {
  /** @docs-private Measured for the panel width; the panel sits flush under it. */
  readonly _element = inject<ElementRef<HTMLElement>>(ElementRef);

  /** @docs-private The one open descendant trigger; opening another closes it. */
  _openTrigger: MudMegaMenuTriggerHandle | null = null;
}
