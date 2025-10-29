export const QUEUE_NAMES = {
  BRAND_CREATION: 'brand-creation',
  COLOR_GENERATION: 'color-generation',
  LOGO_GENERATION: 'logo-generation',
  WEBSITE_GENERATION: 'website-generation',
  MOCKUP_GENERATION: 'mockup-generation',
  ASSET_AGGREGATION: 'asset-aggregation',
} as const;

export const JOB_NAMES = {
  CREATE_BRAND: 'create-brand',
  GENERATE_COLORS: 'generate-colors',
  GENERATE_LOGO: 'generate-logo',
  GENERATE_WEBSITE: 'generate-website',
  GENERATE_MOCKUPS: 'generate-mockups',
  AGGREGATE_ASSETS: 'aggregate-assets',
} as const;

export const JOB_PRIORITIES = {
  CRITICAL: 1,
  HIGH: 3,
  NORMAL: 5,
  LOW: 7,
} as const;