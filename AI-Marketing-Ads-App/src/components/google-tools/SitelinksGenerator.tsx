import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Check, X } from 'lucide-react';
import { SitelinkData } from '../../types';
import { generateSitelinks } from '../../../services/geminiService';
import { useToolResults } from '../../hooks/useToolResults';
import { generateSitelinksCsvContent, generateSitelinksExcelCopyContent } from '../../../utils/fileUtils';
import InputGroup from '../InputGroup';
import { DownloadIcon, CopyIcon, CheckIcon, LoadingSpinner } from '../../../components/icons';

export function SitelinksGenerator() {
  const [urls, setUrls] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const urlList = urls.split('\n').map((u) => u.trim()).filter((u) => u);

  const { result, isLoading, error, generate } = useToolResults<SitelinkData[]>({
    toolType: 'sitelinks',
    inputData: { urls: urlList },
    generateFn: () => generateSitelinks(urlList),
    enabled: urlList.length > 0,
  });

  const handleSubmit = async () => {
    if (!urls.trim()) return;
    await generate();
  };

  const handleCopy = () => {
    if (!result) return;
    const text = generateSitelinksExcelCopyContent(result);
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    if (!result) return;
    const csvContent = generateSitelinksCsvContent(result);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sitelinks.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Google Ads Sitelink Generator</h2>
        <p className="text-sm text-muted-foreground">
          Paste your URLs (one per line) to generate optimized sitelinks with descriptions.
        </p>
      </div>

      <InputGroup label="URLs (one per line)">
        <textarea
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder="https://example.com/about&#10;https://example.com/services&#10;https://example.com/contact"
          rows={6}
          className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </InputGroup>

      <button
        onClick={handleSubmit}
        disabled={isLoading || !urls.trim()}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Generating...' : 'Generate Sitelinks'}
      </button>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-md text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Generated Sitelinks</h3>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.map((sitelink, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="group relative cursor-pointer"
              >
                <div className="h-full bg-card border border-border rounded-lg p-6 transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10">
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    {sitelink.status === '200 OK' ? (
                      <div className="flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-red-500 bg-red-500/10 px-2 py-1 rounded-full">
                        <X className="w-3 h-3" />
                        <span>Error</span>
                      </div>
                    )}
                  </div>

                  {/* Link Text */}
                  <h4 className="font-semibold text-lg mb-3 pr-20 group-hover:text-primary transition-colors">
                    {sitelink.linkText}
                  </h4>

                  {/* Descriptions */}
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-muted-foreground">
                      {sitelink.description1}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {sitelink.description2}
                    </p>
                  </div>

                  {/* URL */}
                  <a
                    href={sitelink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-primary hover:underline mt-4 pt-4 border-t border-border"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="truncate">{sitelink.url.replace(/^https?:\/\//, '')}</span>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            ✅ Auto-saved to your brand's tool history
          </p>
        </div>
      )}
    </div>
  );
}
