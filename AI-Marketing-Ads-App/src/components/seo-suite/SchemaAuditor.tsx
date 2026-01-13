import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, XCircle, AlertTriangle, FileCode } from 'lucide-react';
import { useBrandStore } from '../../stores/brandStore';

interface SchemaResult {
  type: string;
  valid: boolean;
  issues: string[];
}

interface MissingSchema {
  type: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
}

export function SchemaAuditor() {
  const { selectedBrand } = useBrandStore();
  const [url, setUrl] = useState(selectedBrand?.website || '');
  const [isAuditing, setIsAuditing] = useState(false);
  const [results, setResults] = useState<{
    existing: SchemaResult[];
    missing: MissingSchema[];
    score: number;
  } | null>(null);

  const handleAudit = async () => {
    if (!url.trim()) return;

    setIsAuditing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockResults = {
      existing: [
        { type: 'Organization', valid: true, issues: [] },
        { type: 'WebSite', valid: true, issues: ['Missing potentialAction for search'] },
        { type: 'LocalBusiness', valid: false, issues: ['Missing required field: address', 'Invalid phone format'] },
      ],
      missing: [
        { type: 'FAQPage', importance: 'critical' as const, reason: 'Your site has FAQ content that should be marked up' },
        { type: 'Service', importance: 'high' as const, reason: 'Service pages would benefit from Service schema' },
        { type: 'BreadcrumbList', importance: 'medium' as const, reason: 'Helps search engines understand site structure' },
        { type: 'Article', importance: 'medium' as const, reason: 'Blog posts should use Article schema' },
      ],
      score: 58
    };

    setResults(mockResults);
    setIsAuditing(false);
  };

  const importanceColors = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-gradient-to-br from-slate-800/50 to-purple-900/20 rounded-xl p-6 border border-purple-500/30">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileCode className="w-5 h-5 text-purple-400" />
          Schema Markup Auditor
        </h2>

        <div>
          <label htmlFor="audit-url" className="block text-sm font-medium text-cyan-400 mb-1">
            Website URL to Audit
          </label>
          <input
            id="audit-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-200"
          />
        </div>

        <motion.button
          onClick={handleAudit}
          disabled={isAuditing || !url.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            w-full mt-4 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2
            ${isAuditing
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25'
            }
          `}
        >
          {isAuditing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full"
              />
              Auditing Schema...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Audit Schema Markup
            </>
          )}
        </motion.button>
      </div>

      {/* Results */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Score */}
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700 text-center">
            <p className="text-sm text-muted-foreground mb-2">Schema Health Score</p>
            <p className={`text-5xl font-bold ${
              results.score >= 80 ? 'text-green-400' :
              results.score >= 60 ? 'text-yellow-400' :
              results.score >= 40 ? 'text-orange-400' :
              'text-red-400'
            }`}>
              {results.score}%
            </p>
          </div>

          {/* Existing Schemas */}
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4">Existing Schema Markup</h3>
            <div className="space-y-3">
              {results.existing.map((schema, i) => (
                <div key={i} className={`p-4 rounded-lg border ${
                  schema.valid && schema.issues.length === 0
                    ? 'bg-green-500/10 border-green-500/30'
                    : schema.valid
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {schema.valid && schema.issues.length === 0 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : schema.valid ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="font-medium">{schema.type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      schema.valid ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {schema.valid ? 'Valid' : 'Invalid'}
                    </span>
                  </div>
                  {schema.issues.length > 0 && (
                    <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                      {schema.issues.map((issue, j) => (
                        <li key={j}>- {issue}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Missing Schemas */}
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4">Recommended Schema Markup</h3>
            <div className="space-y-3">
              {results.missing.map((schema, i) => (
                <div key={i} className={`p-4 rounded-lg border ${importanceColors[schema.importance]}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{schema.type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded uppercase font-semibold ${importanceColors[schema.importance]}`}>
                      {schema.importance}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{schema.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
