import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Search, BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useBrandStore } from '../../stores/brandStore';
import { ScoreGauge } from '../ui/ScoreGauge';

interface CompetitorData {
  url: string;
  name: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
}

export function CompetitorDashboard() {
  const { selectedBrand } = useBrandStore();
  const [brandUrl, setBrandUrl] = useState(selectedBrand?.website || '');
  const [competitors, setCompetitors] = useState<string[]>(['', '', '']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<{
    brand: CompetitorData;
    competitors: CompetitorData[];
    gaps: { keyword: string; brandRank: number | null; competitorBest: number; opportunity: string }[];
  } | null>(null);

  const handleAddCompetitor = () => {
    if (competitors.length < 5) {
      setCompetitors([...competitors, '']);
    }
  };

  const handleRemoveCompetitor = (index: number) => {
    setCompetitors(competitors.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    const validCompetitors = competitors.filter(c => c.trim());
    if (!brandUrl.trim() || validCompetitors.length === 0) return;

    setIsAnalyzing(true);

    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 2500));

    const mockResults = {
      brand: {
        url: brandUrl,
        name: selectedBrand?.name || 'Your Brand',
        score: Math.floor(Math.random() * 30) + 55,
        strengths: ['Strong local SEO', 'Good content depth', 'Fast page speed'],
        weaknesses: ['Missing FAQ schema', 'Low backlink count', 'Thin mobile content']
      },
      competitors: validCompetitors.map((url, i) => ({
        url,
        name: `Competitor ${i + 1}`,
        score: Math.floor(Math.random() * 40) + 45,
        strengths: ['Good schema markup', 'High domain authority', 'Active blog'],
        weaknesses: ['Slow mobile speed', 'Poor internal linking']
      })),
      gaps: [
        { keyword: 'best services near me', brandRank: null, competitorBest: 3, opportunity: 'high' },
        { keyword: 'professional help', brandRank: 15, competitorBest: 2, opportunity: 'high' },
        { keyword: 'affordable solutions', brandRank: 8, competitorBest: 5, opportunity: 'medium' },
        { keyword: 'expert consultation', brandRank: 12, competitorBest: 4, opportunity: 'medium' },
        { keyword: 'trusted provider', brandRank: 6, competitorBest: 7, opportunity: 'low' },
      ]
    };

    setResults(mockResults);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-gradient-to-br from-slate-800/50 to-purple-900/20 rounded-xl p-6 border border-purple-500/30">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          Competitor Analysis Setup
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="brand-url" className="block text-sm font-medium text-cyan-400 mb-1">
              Your Website URL
            </label>
            <input
              id="brand-url"
              type="url"
              value={brandUrl}
              onChange={(e) => setBrandUrl(e.target.value)}
              placeholder="https://yourbrand.com"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-200"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Competitor URLs</label>
            {competitors.map((comp, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={comp}
                  onChange={(e) => {
                    const updated = [...competitors];
                    updated[index] = e.target.value;
                    setCompetitors(updated);
                  }}
                  placeholder={`https://competitor${index + 1}.com`}
                  className="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-200"
                />
                {competitors.length > 1 && (
                  <button
                    onClick={() => handleRemoveCompetitor(index)}
                    className="p-2 bg-slate-800 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400 hover:text-red-400" />
                  </button>
                )}
              </div>
            ))}
            {competitors.length < 5 && (
              <button
                onClick={handleAddCompetitor}
                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
              >
                <Plus className="w-4 h-4" />
                Add Competitor
              </button>
            )}
          </div>

          <motion.button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !brandUrl.trim() || !competitors.some(c => c.trim())}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              w-full py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2
              ${isAnalyzing
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25'
              }
            `}
          >
            {isAnalyzing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full"
                />
                Analyzing Competitors...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Analyze Competitors
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Score Comparison */}
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-6">SEO Score Comparison</h3>
            <div className="flex flex-wrap justify-center gap-8">
              <div className="text-center">
                <ScoreGauge score={results.brand.score} label={results.brand.name} size="lg" color="purple" />
                <span className="text-xs text-purple-400 mt-2 block">Your Brand</span>
              </div>
              {results.competitors.map((comp, i) => (
                <div key={i} className="text-center">
                  <ScoreGauge score={comp.score} label={comp.name} size="lg" color="auto" />
                  <span className="text-xs text-muted-foreground mt-2 block">Competitor</span>
                </div>
              ))}
            </div>
          </div>

          {/* Keyword Gaps */}
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4">Keyword Gap Analysis</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-slate-700">
                    <th className="pb-3 pr-4">Keyword</th>
                    <th className="pb-3 pr-4">Your Rank</th>
                    <th className="pb-3 pr-4">Best Competitor</th>
                    <th className="pb-3">Opportunity</th>
                  </tr>
                </thead>
                <tbody>
                  {results.gaps.map((gap, i) => (
                    <tr key={i} className="border-b border-slate-700/50">
                      <td className="py-3 pr-4 font-medium">{gap.keyword}</td>
                      <td className="py-3 pr-4">
                        {gap.brandRank ? (
                          <span className="flex items-center gap-1">
                            #{gap.brandRank}
                            {gap.brandRank < gap.competitorBest ? (
                              <TrendingUp className="w-4 h-4 text-green-400" />
                            ) : gap.brandRank > gap.competitorBest ? (
                              <TrendingDown className="w-4 h-4 text-red-400" />
                            ) : (
                              <Minus className="w-4 h-4 text-slate-400" />
                            )}
                          </span>
                        ) : (
                          <span className="text-red-400">Not ranking</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">#{gap.competitorBest}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          gap.opportunity === 'high' ? 'bg-green-500/20 text-green-400' :
                          gap.opportunity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {gap.opportunity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4 text-green-400">Your Strengths</h3>
              <ul className="space-y-2">
                {results.brand.strengths.map((s, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4 text-red-400">Areas to Improve</h3>
              <ul className="space-y-2">
                {results.brand.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-red-400 rounded-full" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
