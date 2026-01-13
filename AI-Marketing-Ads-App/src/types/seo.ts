// SEO & Schema Intelligence Types

export interface CompetitorAnalysis {
  id: string;
  brandId: string;
  brandUrl: string;
  competitors: Competitor[];
  scores: {
    brand: number;
    competitors: Record<string, number>;
  };
  gaps: {
    keywords: KeywordGap[];
    content: ContentGap[];
    technical: TechnicalGap[];
  };
  actionItems: SeoActionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Competitor {
  url: string;
  name: string;
  seoScore: number;
  strengths: string[];
  weaknesses: string[];
  keyMetrics: {
    domainAuthority: number;
    organicKeywords: number;
    estimatedTraffic: string;
    topPages: string[];
  };
}

export interface KeywordGap {
  keyword: string;
  searchVolume: string;
  brandRank: number | null;
  competitorRanks: Record<string, number>;
  opportunity: 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface ContentGap {
  topic: string;
  brandCoverage: 'full' | 'partial' | 'none';
  competitorCoverage: Record<string, 'full' | 'partial' | 'none'>;
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface TechnicalGap {
  issue: string;
  category: 'speed' | 'mobile' | 'security' | 'indexing' | 'structured-data';
  brandStatus: 'pass' | 'warning' | 'fail';
  competitorStatus: Record<string, 'pass' | 'warning' | 'fail'>;
  recommendation: string;
}

export interface SeoActionItem {
  id: string;
  priority: 1 | 2 | 3 | 4 | 5;
  category: 'content' | 'technical' | 'keywords' | 'backlinks';
  action: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  details: string;
}

// Schema Types
export interface SchemaAudit {
  id: string;
  brandId: string;
  url: string;
  existingSchemas: ExistingSchema[];
  missingSchemas: MissingSchema[];
  improvements: SchemaImprovement[];
  generatedSchemas: GeneratedSchema[];
  createdAt: string;
}

export interface ExistingSchema {
  type: string;
  valid: boolean;
  issues: string[];
  jsonLd: Record<string, unknown>;
}

export interface MissingSchema {
  type: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  template: Record<string, unknown>;
}

export interface SchemaImprovement {
  schemaType: string;
  field: string;
  currentValue: string | null;
  recommendedValue: string;
  reason: string;
}

export interface GeneratedSchema {
  type: string;
  name: string;
  jsonLd: Record<string, unknown>;
  validationStatus: 'valid' | 'warning' | 'error';
  validationMessages: string[];
}

export type SchemaType =
  | 'LocalBusiness'
  | 'Product'
  | 'Organization'
  | 'Article'
  | 'FAQPage'
  | 'Service'
  | 'MedicalBusiness'
  | 'Event'
  | 'Person'
  | 'WebPage';
