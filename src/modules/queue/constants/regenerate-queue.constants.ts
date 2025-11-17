export enum RegenerateJobType {
    WEBSITE_REGENERATE = 'website-regeneration',
    LOGO_PRIMARY_REGENERATE = 'logo-primary-regeneration',
    LOGO_ICON_REGENERATE = 'logo-icon-regeneration',
    TYPOGRAPHY_REGENERATE = 'typography-regeneration',
    COLOR_PALETTE_REGENERATE = 'color-palette-regeneration',
    MISSION_REGENERATE = 'mission-regeneration',
    VISION_REGENERATE = 'vision-regeneration',
    BANNER_LINKEDIN_REGENERATE = 'banner-linkedin-regeneration',
    BANNER_TWITTER_REGENERATE = 'banner-twitter-regeneration',
    BANNER_FACEBOOK_REGENERATE = 'banner-facebook-regeneration',
    BANNER_INSTAGRAM_REGENERATE = 'banner-instagram-regeneration',
}


export const REGENERATE_QUEUE_NAMES = {
    WEBSITE_REGENERATE: 'website-regeneration',
    LOGO_REGENERATE: 'logo-regeneration',
    TYPOGRAPHY_REGENERATE: 'typography-regeneration',
    COLOR_PALETTE_REGENERATE: 'color-palette-regeneration',
    MISSION_REGENERATE: 'mission-regeneration',
    VISION_REGENERATE: 'vision-regeneration',
    BANNER_REGENERATE: 'banner-regeneration',
} as const;

export const REGENERATE_JOB_NAMES = {
    WEBSITE_REGENERATE: 'regenerate-website',
    LOGO_REGENERATE: 'regenerate-logo',
    TYPOGRAPHY_REGENERATE: 'regenerate-typography',
    COLOR_PALETTE_REGENERATE: 'regenerate-color-palette',
    MISSION_REGENERATE: 'regenerate-mission',
    VISION_REGENERATE: 'regenerate-vision',
    BANNER_REGENERATE: 'regenerate-banner',
} as const;
