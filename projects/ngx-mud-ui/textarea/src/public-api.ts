export { MudTextarea } from './lib/mud-textarea.component';
export type { MudTextareaResize, MudTextareaSize, MudTextareaVariant } from './lib/mud-textarea.component';

import { MudTextarea } from './lib/mud-textarea.component';
import { MudInputError, MudInputHelper, MudInputLabel } from 'ngx-mud-ui/input';

export const MUD_TEXTAREA = [MudTextarea, MudInputLabel, MudInputHelper, MudInputError] as const;
