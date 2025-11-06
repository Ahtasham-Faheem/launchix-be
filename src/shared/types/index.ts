export type ClerkUser = { userId: string; email?: string; firstName?: string; lastName?: string; };

export enum WebsiteType {
  PERSONAL = "personal",
  BUSINESS = "business",
  ECOMMERCE = "ecommerce",
  EDUCATIONAL = "educational",
  MEDIA = "media",
  NON_PROFIT = "non_profit",
  SAAS = "saas",
  INFORMATIONAL = "informational",
  LANDING = "landing"
}