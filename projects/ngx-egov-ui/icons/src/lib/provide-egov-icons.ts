import { inject, makeEnvironmentProviders, provideEnvironmentInitializer } from '@angular/core';
import type { EnvironmentProviders } from '@angular/core';
import { EgovIconRegistry } from './egov-icon-registry.service';
import type { EgovIcon } from './types';

export function provideEgovIcons(icons: EgovIcon[]): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => inject(EgovIconRegistry).register(icons)),
  ]);
}
