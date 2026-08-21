import { inject, makeEnvironmentProviders, provideEnvironmentInitializer } from '@angular/core';
import type { EnvironmentProviders } from '@angular/core';
import { MudIconRegistry } from './mud-icon-registry.service';
import type { MudIcon } from './types';

export function provideMudIcons(icons: MudIcon[]): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => inject(MudIconRegistry).register(icons)),
  ]);
}
