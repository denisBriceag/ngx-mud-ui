import type { MudBreadcrumbItem } from './mud-breadcrumb-item.directive';

/**
 * Shared by the overflow panel's mirrored links and the mobile back link: both
 * are stand-ins for a crumb that lives elsewhere in the DOM, so a plain click
 * has to be replayed on the original element.
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
