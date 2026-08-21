export { MudInput } from './lib/mud-input.component';
export type { MudInputSize, MudInputType, MudInputVariant } from './lib/mud-input.component';
export { MudInputError, MudInputHelper, MudInputLabel } from './lib/mud-input-slots';

import { MudInput } from './lib/mud-input.component';
import { MudInputError, MudInputHelper, MudInputLabel } from './lib/mud-input-slots';

/** Everything needed to compose a mud-input with rich label/helper/error content. */
export const MUD_INPUT = [MudInput, MudInputLabel, MudInputHelper, MudInputError] as const;
