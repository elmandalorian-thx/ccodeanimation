import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, AlertCircle } from 'lucide-react';
import { GeoAnalysis } from '../../types/geo';
import { useBrandStore } from '../../stores/brandStore';
import InputGroup from '../InputGroup';

interface GeoAnalyzerProps {
  onAnalysisComplete: (analysis: GeoAnalysis) => void;
}

export function GeoAnalyzer({ onAnalysisComplete }: GeoAnalyzerProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedBrand } = useBrandStore();

  // Use brand's website as default
  const defaultUrl = selectedBrand?.website || '';

  const handleAnalyze = async () => {
    const targetUrl = url.trim() || defaultUrl;
    if (!targetUrl) return;

    setIsLoading(true);
    setError(null);

    try {
      // For now, generate mock data - will be replaced with actual AI analysis
      const mockAnalysis: GeoAnalysis = {
        id: crypto.randomUUID(),
        brandId: selectedBrand?.id || '',
        url: targetUrl,
        analysisType: 'full',
        scores: {
          overall: Math.floor(Math.random() * 30) + 50,
          contentDepth: Math.floor(Math.random() * 40) + 40,
          entityCoverage: Math.floor(Math.random() * 35) + 45,
          questionAnswer: Math.floor(Math.random() * 30) + 50,
          semanticRichness: Math.floor(Math.random() * 40) + 40,
          citationPotential: Math.floor(Math.random() * 35) + 45,
        },
        entities: [
          { name: selectedBrand?.name || 'Brand', type: 'organization', frequency: 15, context: 'Primary brand mention' },
          { name: 'Product A', type: 'product', frequency: 8, context: 'Main product offering' },
          { name: 'CEO Name', type: 'person', frequency: 3, context: 'Leadership mention' },
        ],
        questionsAnswered: [
          { question: 'What services does the company offer?', answerQuality: 'good', sourceSection: 'Services page', improvement: 'Add more specific details' },
          { question: 'How to contact support?', answerQuality: 'excellent', sourceSection: 'Contact page' },
          { question: 'What are the pricing options?', answerQuality: 'partial', sourceSection: 'Pricing section', improvement: 'Include comparison table' },
        ],
        contentGaps: [
          { topic: 'Customer testimonials', importance: 'high', competitorsCovering: 3, recommendation: 'Add video testimonials section' },
          { topic: 'Industry certifications', importance: 'medium', competitorsCovering: 2, recommendation: 'Highlight certifications prominently' },
        ],
        aiPlatforms: [
          { platform: 'google-sge', visibilityScore: 72, issues: ['Missing FAQ schema'], opportunities: ['Add structured FAQs'] },
          { platform: 'chatgpt', visibilityScore: 65, issues: ['Limited entity coverage'], opportunities: ['Add author bios'] },
          { platform: 'perplexity', visibilityScore: 58, issues: ['Thin content sections'], opportunities: ['Expand service descriptions'] },
          { platform: 'bing-copilot', visibilityScore: 70, issues: ['Missing citations'], opportunities: ['Add source references'] },
          { platform: 'claude', visibilityScore: 68, issues: ['Low semantic richness'], opportunities: ['Add related topic sections'] },
        ],
        actionItems: [
          { id: '1', priority: 1, category: 'content', action: 'Add FAQ schema markup', impact: 'high', effort: 'low', status: 'pending', details: 'Implement FAQ structured data for all service pages' },
          { id: '2', priority: 2, category: 'entity', action: 'Add author bios to blog posts', impact: 'high', effort: 'medium', status: 'pending', details: 'Include expert author information for E-E-A-T signals' },
          { id: '3', priority: 3, category: 'structure', action: 'Create topic clusters', impact: 'medium', effort: 'high', status: 'pending', details: 'Organize content into pillar pages and supporting articles' },
        ],
        uploadedFiles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      onAnalysisComplete(mockAnalysis);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-800/50 to-purple-900/20 rounded-xl p-6 border border-purple-500/30">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          Analyze AI Search Visibility
        </h2>

        <InputGroup label="Website URL to Analyze" htmlFor="geo-url">
          <input
            id="geo-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={defaultUrl || 'https://example.com'}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-slate-200 placeholder-slate-500"
          />
        </InputGroup>

        <motion.button
          onClick={handleAnalyze}
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            w-full mt-4 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2
            ${isLoading
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-lg hover:shadow-cyan-500/25'
            }
          `}
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full"
              />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Run GEO Analysis
            </>
          )}
        </motion.button>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </div>

      {/* Analysis Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Content Depth', desc: 'Measures comprehensiveness and expertise signals' },
          { title: 'Entity Coverage', desc: 'Named entities and linked data potential' },
          { title: 'Citation Potential', desc: 'Likelihood of AI citing this content' },
        ].map((tip, i) => (
          <div key={i} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <h4 className="font-medium text-cyan-400 mb-1">{tip.title}</h4>
            <p className="text-sm text-muted-foreground">{tip.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
