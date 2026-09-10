import { Directive } from '@angular/core';

/**
 * ```html
 * <mud-text-input [invalid]="ctrl.invalid">
 *   <span mudLabel>IDNP <mud-icon name="circle-info" /></span>
 *   <mud-inline-message mudHelper hideIcon>13 cifre.</mud-inline-message>
 *   <mud-inline-message mudError variant="error">
 *     IDNP invalid — <a mudLink href="/ajutor">vezi formatul</a>
 *   </mud-inline-message>
 * </mud-text-input>
 * ```
 */
@Directive({ selector: '[mudLabel]' })
export class MudFieldLabel {}

/** Rich helper content; shown below the field unless the error region is active. */
@Directive({ selector: '[mudHelper]' })
export class MudFieldHelper {}

/** Rich error content; shown while the field is invalid, inside the announced (role="alert") wrapper. */
@Directive({ selector: '[mudError]' })
export class MudFieldError {}
