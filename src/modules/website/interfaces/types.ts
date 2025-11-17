// ========================================
// COMPLETE TYPE DEFINITIONS
// ========================================

/**
 * Main design configuration interface
 */
export interface DesignConfig {
  metadata: MetadataConfig;
  branding: BrandingConfig;
  colorScheme: ColorSchemeConfig;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  sections: SectionConfig[];
  navigation: NavigationConfig;
  footer: FooterConfig;
  seo: SEOConfig;
  animations: AnimationConfig;
  performance?: PerformanceConfig;
}

/**
 * Metadata configuration
 */
export interface MetadataConfig {
  projectName: string;
  industry: string;
  targetAudience: string;
  tone: string;
  primaryCTA: string;
  secondaryCTA: string;
  description?: string;
  author?: string;
}

/**
 * Branding configuration
 */
export interface BrandingConfig {
  businessName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl?: string;
  brandColors?: {
    main: string;
    contrast: string;
  };
}

/**
 * Color scheme configuration
 */
export interface ColorSchemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  backgroundAlt?: string;
  text: string;
  textLight?: string;
  success?: string;
  warning?: string;
  error?: string;
  info?: string;
  white?: string;
  black?: string;
  gray?: {
    100?: string;
    200?: string;
    300?: string;
    400?: string;
    500?: string;
    600?: string;
    700?: string;
    800?: string;
    900?: string;
  };
}

/**
 * Typography configuration
 */
export interface TypographyConfig {
  headingFont: string;
  bodyFont: string;
  monoFont?: string;
  fontWeights: {
    thin?: number;
    light: number;
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
    black?: number;
  };
  fontSizes?: {
    xs?: string;
    sm?: string;
    base?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
    '3xl'?: string;
    '4xl'?: string;
    '5xl'?: string;
  };
  lineHeights?: {
    none?: number;
    tight?: number;
    normal?: number;
    relaxed?: number;
    loose?: number;
  };
}

/**
 * Spacing configuration
 */
export interface SpacingConfig {
  unit: number;
  scale: string[];
  values: number[];
}

/**
 * Section configuration
 */
export interface SectionConfig {
  id: string;
  type: SectionType;
  enabled: boolean;
  layout: string;
  settings: SectionSettings;
  content: Record<string, any>;
}

export type SectionType =
  | 'hero'
  | 'features'
  | 'services'
  | 'about'
  | 'testimonials'
  | 'reviews'
  | 'pricing'
  | 'team'
  | 'gallery'
  | 'showcase'
  | 'portfolio'
  | 'products'
  | 'faq'
  | 'contact'
  | 'cta'
  | 'stats'
  | 'blog'
  | 'generic';

export interface SectionSettings {
  fullHeight?: boolean;
  backgroundType?: 'solid' | 'gradient' | 'image' | 'pattern';
  backgroundImage?: string;
  showTrustBadges?: boolean;
  cardStyle?: 'flat' | 'elevated' | 'outlined' | 'glass';
  columns?: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
  animation?: string;
  padding?: {
    top: string;
    bottom: string;
  };
  [key: string]: any;
}

// ========================================
// NAVIGATION CONFIGURATION
// ========================================

/**
 * Navigation configuration
 */
export interface NavigationConfig {
  position: 'fixed' | 'absolute' | 'sticky' | 'relative';
  transparent: boolean;
  showCTA: boolean;
  mobileBreakpoint?: number;
  scrollThreshold?: number;
  logo?: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  };
  items: NavigationItem[];
  cta?: CTAButton;
  style?: NavigationStyle;
  behavior?: NavigationBehavior;
}

export interface NavigationItem {
  label: string;
  link: string;
  type?: 'link' | 'dropdown' | 'button';
  children?: NavigationItem[];
  icon?: string;
  target?: '_self' | '_blank';
  badge?: string;
  active?: boolean;
}

export interface NavigationStyle {
  height?: {
    mobile: string;
    desktop: string;
  };
  background?: {
    default: string;
    scrolled: string;
  };
  blur?: boolean;
  shadow?: boolean;
  border?: boolean;
}

export interface NavigationBehavior {
  hideOnScroll?: boolean;
  changeOnScroll?: boolean;
  highlightActive?: boolean;
  smoothScroll?: boolean;
  closeOnClick?: boolean;
}

export interface CTAButton {
  text: string;
  link: string;
  style: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
}

// ========================================
// FOOTER CONFIGURATION
// ========================================

/**
 * Footer configuration
 */
export interface FooterConfig {
  layout: '2-column' | '3-column' | '4-column' | '5-column' | 'centered';
  showNewsletter: boolean;
  showSocial: boolean;
  backgroundColor?: string;
  textColor?: string;
  logo?: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  };
  about?: {
    show: boolean;
    title?: string;
    description: string;
    maxWidth?: number;
  };
  columns: FooterColumn[];
  newsletter?: NewsletterConfig;
  social?: SocialLinks;
  bottom?: FooterBottom;
  style?: FooterStyle;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
  width?: number;
}

export interface FooterLink {
  label: string;
  link: string;
  icon?: string;
  target?: '_self' | '_blank';
  rel?: string;
}

export interface NewsletterConfig {
  enabled: boolean;
  title: string;
  description?: string;
  placeholder?: string;
  buttonText: string;
  successMessage?: string;
  errorMessage?: string;
  gdprText?: string;
  provider?: 'mailchimp' | 'sendgrid' | 'custom';
  action?: string;
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  github?: string;
  tiktok?: string;
  pinterest?: string;
  discord?: string;
  [key: string]: string | undefined;
}

export interface FooterBottom {
  show: boolean;
  copyright: string;
  links?: FooterLink[];
  layout?: 'left' | 'center' | 'split';
}

export interface FooterStyle {
  padding?: {
    top: string;
    bottom: string;
  };
  borderTop?: boolean;
  divider?: boolean;
  columnGap?: string;
  rowGap?: string;
}

// ========================================
// SEO CONFIGURATION
// ========================================

/**
 * SEO configuration
 */
export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  author?: string;
  language?: string;
  robots?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
  twitterImage?: string;
  structuredData?: StructuredData[];
  additionalMetaTags?: MetaTag[];
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export interface MetaTag {
  name?: string;
  property?: string;
  content: string;
  httpEquiv?: string;
}

// ========================================
// ANIMATION CONFIGURATION
// ========================================

/**
 * Animation configuration
 */
export interface AnimationConfig {
  enabled: boolean;
  library: 'AOS' | 'GSAP' | 'Framer Motion' | 'custom' | 'none';
  defaults: AnimationDefaults;
  presets?: AnimationPreset[];
  customAnimations?: CustomAnimation[];
}

export interface AnimationDefaults {
  duration: number;
  easing: string;
  once: boolean;
  offset: number;
  delay?: number;
  mirror?: boolean;
  anchorPlacement?: 'top-bottom' | 'top-center' | 'top-top' | 'center-bottom' | 'center-center' | 'center-top' | 'bottom-bottom' | 'bottom-center' | 'bottom-top';
}

export interface AnimationPreset {
  name: string;
  type: AnimationType;
  duration?: number;
  easing?: string;
  delay?: number;
}

export type AnimationType =
  | 'fade'
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'fade-up-right'
  | 'fade-up-left'
  | 'fade-down-right'
  | 'fade-down-left'
  | 'flip-up'
  | 'flip-down'
  | 'flip-left'
  | 'flip-right'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom-in'
  | 'zoom-in-up'
  | 'zoom-in-down'
  | 'zoom-in-left'
  | 'zoom-in-right'
  | 'zoom-out'
  | 'zoom-out-up'
  | 'zoom-out-down'
  | 'zoom-out-left'
  | 'zoom-out-right';

export interface CustomAnimation {
  name: string;
  keyframes: string;
  duration: number;
  easing?: string;
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

// ========================================
// PERFORMANCE CONFIGURATION
// ========================================

/**
 * Performance configuration (optional)
 */
export interface PerformanceConfig {
  lazyLoadImages: boolean;
  minifyOutput: boolean;
  criticalCSS: boolean;
  preloadFonts: boolean;
  inlineCSS?: boolean;
  deferJS?: boolean;
  webpImages?: boolean;
  cdn?: {
    enabled: boolean;
    url?: string;
  };
}

// ========================================
// CONTENT INTERFACES
// ========================================

export interface GeneratedContent {
  headline?: string;
  subheadline?: string;
  description?: string;
  items?: any[];
  sectionTitle?: string;
  sectionSubtitle?: string;
}

export interface ImageAsset {
  type: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  webp?: string;
  placeholder?: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
  image?: ImageAsset;
  link?: string;
}

export interface Testimonial {
  rating: number;
  quote: string;
  author: {
    name: string;
    role: string;
    company: string;
    avatar?: ImageAsset;
  };
  date?: string;
  verified?: boolean;
}

export interface PricingPlan {
  name: string;
  price: number | string;
  period?: 'month' | 'year' | 'once';
  description: string;
  features: string[];
  highlighted?: boolean;
  popular?: boolean;
  cta: {
    text: string;
    link: string;
    style: 'primary' | 'secondary' | 'outline';
  };
  badge?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  avatar: ImageAsset;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    email?: string;
  };
}

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  hours?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface FormField {
  name: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  options?: string[];
  rows?: number;
}

// ========================================
// GENERATION RESULT INTERFACES
// ========================================

export interface GenerationResult {
  html: string;
  url: string;
  filePath: string;
  stats: GenerationStats;
  metadata?: {
    designJSON?: DesignConfig;
    warnings?: string[];
    errors?: string[];
  };
}

export interface GenerationStats {
  duration: number;
  size: number;
  sections: number;
  images?: number;
  tokensUsed?: {
    total: number;
    byStep: {
      design?: number;
      content?: number;
      html?: number;
      css?: number;
      javascript?: number;
    };
  };
  performance?: {
    loadTime?: number;
    pageSpeedScore?: number;
  };
}

// ========================================
// INPUT INTERFACES
// ========================================

export interface WebsiteGenerationInput {
  businessName: string;
  industry: string;
  tagline: string;
  vision?: string;
  mission?: string;
  sections: string[];
  colorScheme: ColorSchemeConfig;
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  userId: string;
  customization?: {
    typography?: TypographyConfig;
    navigation?: NavigationConfig;
    footer?: FooterConfig;
    seo?: SEOConfig;
    animations?: AnimationConfig;
  };
}

// ========================================
// VALIDATION INTERFACES
// ========================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// ========================================
// UTILITY TYPES
// ========================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ========================================
// DEFAULT CONFIGURATIONS
// ========================================

export const DEFAULT_NAVIGATION: NavigationConfig = {
  position: 'fixed',
  transparent: true,
  showCTA: true,
  mobileBreakpoint: 768,
  scrollThreshold: 50,
  items: [],
  style: {
    height: {
      mobile: '70px',
      desktop: '80px',
    },
    background: {
      default: 'rgba(255, 255, 255, 0.95)',
      scrolled: 'rgba(255, 255, 255, 1)',
    },
    blur: true,
    shadow: true,
    border: false,
  },
  behavior: {
    hideOnScroll: false,
    changeOnScroll: true,
    highlightActive: true,
    smoothScroll: true,
    closeOnClick: true,
  },
};

export const DEFAULT_FOOTER: FooterConfig = {
  layout: '4-column',
  showNewsletter: true,
  showSocial: true,
  columns: [],
  newsletter: {
    enabled: true,
    title: 'Subscribe to our newsletter',
    description: 'Get the latest updates and news',
    placeholder: 'Enter your email',
    buttonText: 'Subscribe',
    successMessage: 'Thank you for subscribing!',
    errorMessage: 'Something went wrong. Please try again.',
  },
  social: {},
  bottom: {
    show: true,
    copyright: `© ${new Date().getFullYear()} All rights reserved.`,
    layout: 'split',
  },
  style: {
    padding: {
      top: '64px',
      bottom: '32px',
    },
    borderTop: true,
    divider: false,
    columnGap: '32px',
    rowGap: '48px',
  },
};

export const DEFAULT_SEO: SEOConfig = {
  title: '',
  description: '',
  keywords: [],
  language: 'en',
  robots: 'index, follow',
  ogType: 'website',
  twitterCard: 'summary_large_image',
};

export const DEFAULT_ANIMATIONS: AnimationConfig = {
  enabled: true,
  library: 'AOS',
  defaults: {
    duration: 1000,
    easing: 'ease-out-cubic',
    once: true,
    offset: 120,
    delay: 0,
    mirror: false,
    anchorPlacement: 'top-bottom',
  },
};

// ========================================
// EXAMPLE USAGE
// ========================================

/*
Example: Complete DesignConfig with all interfaces

const exampleConfig: DesignConfig = {
  metadata: {
    projectName: 'TechNova Solutions',
    industry: 'Technology',
    targetAudience: 'B2B SaaS Companies',
    tone: 'Professional, Modern, Innovative',
    primaryCTA: 'Start Free Trial',
    secondaryCTA: 'Schedule Demo',
  },
  
  branding: {
    businessName: 'TechNova Solutions',
    tagline: 'Transform Your Business with AI',
    logoUrl: '/images/logo.png',
  },
  
  colorScheme: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#F59E0B',
    background: '#FFFFFF',
    text: '#1F2937',
  },
  
  typography: {
    headingFont: 'Poppins',
    bodyFont: 'Inter',
    fontWeights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
  },
  
  spacing: {
    unit: 8,
    scale: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'],
    values: [8, 16, 24, 32, 48, 64, 96, 128],
  },
  
  sections: [],
  
  navigation: {
    position: 'fixed',
    transparent: true,
    showCTA: true,
    items: [
      { label: 'Home', link: '#hero' },
      { label: 'Features', link: '#features' },
      { label: 'Pricing', link: '#pricing' },
      { label: 'Contact', link: '#contact' },
    ],
    cta: {
      text: 'Get Started',
      link: '#contact',
      style: 'primary',
    },
  },
  
  footer: {
    layout: '4-column',
    showNewsletter: true,
    showSocial: true,
    columns: [
      {
        title: 'Company',
        links: [
          { label: 'About', link: '#about' },
          { label: 'Careers', link: '#careers' },
        ],
      },
    ],
    social: {
      facebook: 'https://facebook.com/...',
      twitter: 'https://twitter.com/...',
      linkedin: 'https://linkedin.com/...',
    },
  },
  
  seo: {
    title: 'TechNova Solutions - AI-Powered Business Transformation',
    description: 'Transform your business with cutting-edge AI solutions',
    keywords: ['AI', 'SaaS', 'automation'],
  },
  
  animations: {
    enabled: true,
    library: 'AOS',
    defaults: {
      duration: 1000,
      easing: 'ease-out-cubic',
      once: true,
      offset: 120,
    },
  },
};
*/