export type ServiceKey =
  | 'WORDPRESS_QUICK_FIX'
  | 'WORDPRESS_CARE'
  | 'CODEFIX_BUSINESS_SITE'
  | 'AGENCY_WHITE_LABEL';

export type ServiceLandingConfig = {
  path: string;
  service: ServiceKey;
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  price: string;
  pricingNote: string;
  cta: string;
  secondaryCta: string;
  heroPoints: string[];
  offerPoints?: string[];
  reassurance?: { title: string; description: string }[];
  ctaMicrocopy?: string;
  stickyCta?: string;
  problemHeading: string;
  problems: { title: string; description: string }[];
  scopeHeading: string;
  scopeIntro: string;
  scope: string[];
  process: { title: string; description: string }[];
  faq: { question: string; answer: string }[];
  contactHeading: string;
  contactCopy: string;
  messagePlaceholder: string;
  pageUrlRequired: boolean;
  demoUrl?: string;
  projectSlugs?: string[];
  companyFieldLabel?: string;
  successMessage?: string;
};

export type ServiceLandingCatalog = Record<string, ServiceLandingConfig>;
