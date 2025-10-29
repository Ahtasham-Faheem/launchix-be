export interface FontDetails {
  font: string;
  category: 'serif' | 'sans-serif' | 'display' | 'monospace' | 'handwriting';
  weights: string[];
  googleFontsUrl: string;
  fallback: string;
}

export interface TypographyPairing {
  name: string;
  primary: FontDetails;
  secondary: FontDetails;
  useCase: string;
  suitability: string;
  example: {
    heading: string;
    body: string;
  };
}

export interface BrandIdentity {
  vision: string;
  mission: string;
  typography: TypographyPairing[];
  palette: string[];
  errors?: string[];
}

export type BrandIdentityResult = BrandIdentity | { errors: string[] };