import type { MudBreadcrumbItem } from './mud-breadcrumb-item.directive';

/**
 * Replays a plain click from a stand-in link on the original crumb.
 *
 * ```ts
 * forwardCrumbClick(event, crumb, () => this.close(false));
 * ```
 */
export function forwardCrumbClick(
  event: MouseEvent,
  crumb: MudBreadcrumbItem,
  beforeForward?: () => void,
): boolean {
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
    return false;
  }

  event.preventDefault();
  beforeForward?.();
  crumb.target().click();

  return true;
}
