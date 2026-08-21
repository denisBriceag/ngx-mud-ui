export type MudIconScale = 12 | 16 | 20 | 24;
export type MudIconVariant = 'outlined' | 'filled';

export interface MudIconGeometry {
  viewBox: string;
  body: string;
}

export interface MudIcon {
  name: string;
  variants: Partial<Record<MudIconVariant, Partial<Record<MudIconScale, MudIconGeometry>>>>;
}
