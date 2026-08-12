import { Service } from '@angular/core';
import type { EgovIcon } from './types';

@Service()
export class EgovIconRegistry {
  private readonly icons = new Map<string, EgovIcon>();

  register(icons: EgovIcon[]): void {
    for (const icon of icons) {
      this.icons.set(icon.name, icon);
    }
  }

  get(name: string): EgovIcon | undefined {
    return this.icons.get(name);
  }
}
