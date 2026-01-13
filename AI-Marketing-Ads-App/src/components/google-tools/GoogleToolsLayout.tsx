import { useState } from 'react';
import { SitelinksGenerator } from './SitelinksGenerator';
import { KeywordResearch } from './KeywordResearch';
import { PageSpeedAnalyzer } from './PageSpeedAnalyzer';
import { SchemaAuditor } from './SchemaAuditor';
import { GeoAnalyzer } from './GeoAnalyzer';
import { CompetitorAnalysis } from './CompetitorAnalysis';

type Tool = 'sitelinks' | 'keywords' | 'pagespeed' | 'schema' | 'geo' | 'competitors';

interface GoogleToolsLayoutProps {
  initialTool?: string;
}

export function GoogleToolsLayout({ initialTool }: GoogleToolsLayoutProps) {
  const activeTool = (initialTool as Tool) || 'sitelinks';

  const tools: Record<Tool, React.ComponentType> = {
    sitelinks: SitelinksGenerator,
    keywords: KeywordResearch,
    pagespeed: PageSpeedAnalyzer,
    schema: SchemaAuditor,
    geo: GeoAnalyzer,
    competitors: CompetitorAnalysis,
  };

  const ActiveComponent = tools[activeTool] || SitelinksGenerator;

  return (
    <div className="animate-in fade-in duration-300">
      <ActiveComponent />
    </div>
  );
}
