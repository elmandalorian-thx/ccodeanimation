import { useState } from 'react';
import { KeywordResearchData } from '../../types';
import { performKeywordResearch } from '../../../services/geminiService';
import { useToolResults } from '../../hooks/useToolResults';
import { generateKeywordResearchCsvContent, generateKeywordResearchExcelCopyContent } from '../../../utils/fileUtils';
import InputGroup from '../InputGroup';
import { DownloadIcon, CopyIcon, CheckIcon } from '../../../components/icons';

export function KeywordResearch() {
  const [seedKeywords, setSeedKeywords] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const { result, isLoading, error, generate } = useToolResults<KeywordResearchData[]>({
    toolType: 'keywords',
    inputData: { seed_keywords: seedKeywords.trim() },
    generateFn: () => performKeywordResearch(seedKeywords),
    enabled: seedKeywords.trim().length > 0,
  });

  const handleSubmit = async () => {
    if (!seedKeywords.trim()) return;
    await generate();
  };

  const handleCopy = () => {
    if (!result) return;
    const text = generateKeywordResearchExcelCopyContent(result);
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    if (!result) return;
    const csvContent = generateKeywordResearchCsvContent(result);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'keyword-research.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Semantic Keyword Research</h2>
        <p className="text-sm text-muted-foreground">
          Enter seed keywords to discover related terms with intent analysis and volume estimates.
        </p>
      </div>

      <InputGroup label="Seed Keywords">
        <textarea
          value={seedKeywords}
          onChange={(e) => setSeedKeywords(e.target.value)}
          placeholder="running shoes, athletic footwear, marathon training"
          rows={4}
          className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </InputGroup>

      <button
        onClick={handleSubmit}
        disabled={isLoading || !seedKeywords.trim()}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Researching...' : 'Research Keywords'}
      </button>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-md text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Keyword Results ({result.length})</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm transition-colors"
              >
                {isCopied ? <CheckIcon /> : <CopyIcon />}
                {isCopied ? 'Copied!' : 'Copy for Excel'}
              </button>
              <button
                onClick={handleDownloadCsv}
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm transition-colors"
              >
                <DownloadIcon />
                Download CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-sm font-medium">Keyword</th>
                  <th className="text-left p-3 text-sm font-medium">Intent</th>
                  <th className="text-left p-3 text-sm font-medium">Volume</th>
                  <th className="text-left p-3 text-sm font-medium">Trend</th>
                  <th className="text-left p-3 text-sm font-medium">Difficulty</th>
                  <th className="text-left p-3 text-sm font-medium">CPC Estimate</th>
                </tr>
              </thead>
              <tbody>
                {result.map((kw, index) => (
                  <tr
                    key={index}
                    className="border-b border-border hover:bg-secondary/50 transition-colors"
                  >
                    <td className="p-3 text-sm font-medium">{kw.keyword}</td>
                    <td className="p-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          kw.intent === 'Commercial'
                            ? 'bg-green-500/20 text-green-400'
                            : kw.intent === 'Informational'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}
                      >
                        {kw.intent}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{kw.volume}</td>
                    <td className="p-3 text-sm">{kw.trend}</td>
                    <td className="p-3 text-sm">{kw.difficulty}</td>
                    <td className="p-3 text-sm">{kw.cpcEstimate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground">
            ✅ Auto-saved to your brand's tool history
          </p>
        </div>
      )}
    </div>
  );
}
