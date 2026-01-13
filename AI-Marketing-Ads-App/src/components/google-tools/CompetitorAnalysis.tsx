import { useState } from 'react';
import { analyzeCompetitors } from '../../../services/geminiService';
import { useToolResults } from '../../hooks/useToolResults';
import InputGroup from '../InputGroup';

export function CompetitorAnalysis() {
  const [brandUrl, setBrandUrl] = useState('');
  const [competitor1, setCompetitor1] = useState('');
  const [competitor2, setCompetitor2] = useState('');
  const [competitor3, setCompetitor3] = useState('');

  const competitorUrls = [competitor1, competitor2, competitor3]
    .filter((url) => url.trim().length > 0);

  const { result, isLoading, error, generate } = useToolResults<string>({
    toolType: 'competitors',
    inputData: {
      brand_url: brandUrl.trim(),
      competitor_urls: competitorUrls,
    },
    generateFn: () => analyzeCompetitors(brandUrl, competitorUrls),
    enabled: brandUrl.trim().length > 0 && competitorUrls.length > 0,
  });

  const handleSubmit = async () => {
    if (!brandUrl.trim() || competitorUrls.length === 0) return;
    await generate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Competitor Content Gap Analysis</h2>
        <p className="text-sm text-muted-foreground">
          Compare your content against competitors to identify opportunities for AI search visibility.
        </p>
      </div>

      <InputGroup label="Your Website URL">
        <input
          type="url"
          value={brandUrl}
          onChange={(e) => setBrandUrl(e.target.value)}
          placeholder="https://yourbrand.com"
          className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </InputGroup>

      <InputGroup label="Competitor 1 URL">
        <input
          type="url"
          value={competitor1}
          onChange={(e) => setCompetitor1(e.target.value)}
          placeholder="https://competitor1.com"
          className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </InputGroup>

      <InputGroup label="Competitor 2 URL (Optional)">
        <input
          type="url"
          value={competitor2}
          onChange={(e) => setCompetitor2(e.target.value)}
          placeholder="https://competitor2.com"
          className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </InputGroup>

      <InputGroup label="Competitor 3 URL (Optional)">
        <input
          type="url"
          value={competitor3}
          onChange={(e) => setCompetitor3(e.target.value)}
          placeholder="https://competitor3.com"
          className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </InputGroup>

      <button
        onClick={handleSubmit}
        disabled={isLoading || !brandUrl.trim() || competitorUrls.length === 0}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Analyzing...' : 'Analyze Competitors'}
      </button>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-md text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Competitive Analysis Report</h3>
          </div>

          <div className="p-4 bg-card border border-border rounded-md prose prose-sm dark:prose-invert max-w-none">
            <div
              dangerouslySetInnerHTML={{
                __html: result.replace(/\n/g, '<br/>'),
              }}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            ✅ Auto-saved to your brand's tool history
          </p>
        </div>
      )}
    </div>
  );
}
