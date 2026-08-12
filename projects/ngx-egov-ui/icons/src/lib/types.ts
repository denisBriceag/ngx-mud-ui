export type EgovIconScale = 12 | 16 | 20 | 24;
export type EgovIconVariant = 'outlined' | 'filled';

export interface EgovIconGeometry {
  viewBox: string;
  body: string;
}

export interface EgovIcon {
  name: string;
  variants: Partial<Record<EgovIconVariant, Partial<Record<EgovIconScale, EgovIconGeometry>>>>;
}
