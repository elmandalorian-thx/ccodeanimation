
export interface MetaAdCopy {
  primaryTexts: string[];
  headlines: string[];
  descriptions: string[];
}

export interface GoogleAdCopy {
  headlines: string[];
  longHeadlines: string[];
  shortHeadlines: string[];
  descriptions: string[];
  callouts: string[];
  keywords: string[];
}

export interface TikTokAdCopy {
  texts: string[];
}

export interface AllAdCopy {
  meta?: MetaAdCopy;
  google?: GoogleAdCopy;
  tiktok?: TikTokAdCopy;
}

export interface BrandGuidelines {
  nameFormatting?: string;
  languageRules?: string[];
  negativeTerms?: string[];
}

export interface AdCopyInput {
  brandName: string;
  website: string;
  additionalUrls: string;
  campaignPurpose: string;
  negativeKeywords: string;
  files: File[];
  brandGuidelines?: BrandGuidelines;
  technologiesFeatures?: string;
}

export interface SitelinkData {
  url: string;
  linkText: string;
  description1: string;
  description2: string;
  status: string;
}

export interface PageSpeedReport {
  url: string;
  report: string;
}

export interface KeywordResearchData {
    keyword: string;
    intent: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
    volume: 'Very High' | 'High' | 'Medium' | 'Low';
    trend: 'Rising' | 'Stable' | 'Falling' | 'Seasonal';
    difficulty: 'Hard' | 'Medium' | 'Easy';
    cpcEstimate: string;
}
