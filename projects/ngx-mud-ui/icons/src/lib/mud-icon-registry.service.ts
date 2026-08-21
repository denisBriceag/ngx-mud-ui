import { Service } from '@angular/core';
import type { MudIcon } from './types';

@Service()
export class MudIconRegistry {
  private readonly _icons = new Map<string, MudIcon>();

  register(icons: MudIcon[]): void {
    for (const icon of icons) {
      this._icons.set(icon.name, icon);
    }
  }

  get(name: string): MudIcon | undefined {
    return this._icons.get(name);
  }
}
