// GEO Analysis Types for AI Search Visibility

export interface GeoUploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface GeoAnalysis {
  id: string;
  brandId: string;
  url: string;
  analysisType: 'full' | 'quick' | 'competitive';
  scores: GeoScores;
  entities: GeoEntity[];
  questionsAnswered: GeoQuestion[];
  contentGaps: GeoContentGap[];
  aiPlatforms: GeoPlatformVisibility[];
  actionItems: GeoActionItem[];
  uploadedFiles: GeoUploadedFile[];
  createdAt: string;
  updatedAt: string;
}

export interface GeoScores {
  overall: number;
  contentDepth: number;
  entityCoverage: number;
  questionAnswer: number;
  semanticRichness: number;
  citationPotential: number;
}

export interface GeoEntity {
  name: string;
  type: 'person' | 'organization' | 'product' | 'location' | 'concept';
  frequency: number;
  context: string;
  linkedDataUrl?: string;
}

export interface GeoQuestion {
  question: string;
  answerQuality: 'excellent' | 'good' | 'partial' | 'missing';
  sourceSection: string;
  improvement?: string;
}

export interface GeoContentGap {
  topic: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  competitorsCovering: number;
  recommendation: string;
  exampleContent?: string;
}

export interface GeoPlatformVisibility {
  platform: 'google-sge' | 'chatgpt' | 'perplexity' | 'bing-copilot' | 'claude';
  visibilityScore: number;
  issues: string[];
  opportunities: string[];
}

export interface GeoActionItem {
  id: string;
  priority: number;
  category: 'content' | 'technical' | 'entity' | 'structure' | 'schema';
  action: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  details: string;
}

// Input for GEO analysis
export interface GeoAnalysisInput {
  url: string;
  analysisType?: 'full' | 'quick' | 'competitive';
  uploadedFiles?: File[];
}
