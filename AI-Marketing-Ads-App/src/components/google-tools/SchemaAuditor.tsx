import { useState } from 'react';
import { analyzeSchema } from '../../../services/geminiService';
import { useToolResults } from '../../hooks/useToolResults';
import InputGroup from '../InputGroup';

export function SchemaAuditor() {
  const [url, setUrl] = useState('');

  const { result, isLoading, error, generate } = useToolResults<string>({
    toolType: 'schema',
    inputData: { url: url.trim() },
    generateFn: () => analyzeSchema(url),
    enabled: url.trim().length > 0,
  });

  const handleSubmit = async () => {
    if (!url.trim()) return;
    await generate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Schema Markup Auditor</h2>
        <p className="text-sm text-muted-foreground">
          Identify missing structured data opportunities for better search visibility.
        </p>
      </div>

      <InputGroup label="Website URL">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </InputGroup>

      <button
        onClick={handleSubmit}
        disabled={isLoading || !url.trim()}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Auditing...' : 'Audit Schema'}
      </button>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-md text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Schema Audit Report</h3>
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
