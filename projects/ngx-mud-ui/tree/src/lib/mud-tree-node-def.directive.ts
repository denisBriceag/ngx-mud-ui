import { Directive, input } from '@angular/core';
import type { DataSource } from '@angular/cdk/collections';
import type { CdkTreeNodeOutletContext } from '@angular/cdk/tree';
import { CdkTreeNodeDef } from '@angular/cdk/tree';
import type { Observable } from 'rxjs';

/** `<a mud-tree-node *mudTreeNodeDef="let node of nav; when: isGroup">…</a>` */
@Directive({
  selector: '[mudTreeNodeDef]',
  providers: [{ provide: CdkTreeNodeDef, useExisting: MudTreeNodeDef }],
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [{ name: 'when', alias: 'mudTreeNodeDefWhen' }],
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class MudTreeNodeDef<T = any> extends CdkTreeNodeDef<T> {
  /** @description Types `let node` in the template; pass the tree's data (`let node of nav`). Not read at runtime. */
  readonly of = input<readonly T[] | DataSource<T> | Observable<readonly T[]> | null | undefined>(undefined, {
    alias: 'mudTreeNodeDefOf',
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static ngTemplateContextGuard<T>(_dir: MudTreeNodeDef<T>, _ctx: unknown): _ctx is CdkTreeNodeOutletContext<T> {
    return true;
  }
}
