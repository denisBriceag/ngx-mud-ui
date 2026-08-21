export { MudSearchInput } from './lib/mud-search-input.component';
export type {
  MudSearchInputShape,
  MudSearchInputSize,
  MudSearchInputVariant,
} from './lib/mud-search-input.component';

import { MudSearchInput } from './lib/mud-search-input.component';
import { MudInputError, MudInputHelper, MudInputLabel } from 'ngx-mud-ui/input';

export const MUD_SEARCH_INPUT = [MudSearchInput, MudInputLabel, MudInputHelper, MudInputError] as const;
