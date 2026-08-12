import { Service } from '@angular/core';
import type { EgovIcon } from './types';

@Service()
export class EgovIconRegistry {
  private readonly _icons = new Map<string, EgovIcon>();

  register(icons: EgovIcon[]): void {
    for (const icon of icons) {
      this._icons.set(icon.name, icon);
    }
  }

  get(name: string): EgovIcon | undefined {
    return this._icons.get(name);
  }
}
