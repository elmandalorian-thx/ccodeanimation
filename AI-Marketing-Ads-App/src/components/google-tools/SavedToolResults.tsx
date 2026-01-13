import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBrandStore } from '../../stores/brandStore';
import { fetchToolResults, deleteToolResult } from '../../services/toolResultService';
import { ToolResult, ToolType } from '../../types/database';
import { ToolResultCard, TOOL_METADATA } from './ToolResultCard';
import { LoadingSpinner } from '../../../components/icons';
import { Archive, Filter } from 'lucide-react';

interface SavedToolResultsProps {
  initialFilter?: ToolType;
}

export function SavedToolResults({ initialFilter }: SavedToolResultsProps) {
  const { selectedBrand } = useBrandStore();
  const [results, setResults] = useState<ToolResult[]>([]);
  const [filterType, setFilterType] = useState<ToolType | 'all'>(initialFilter || 'all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all results for brand
  useEffect(() => {
    if (!selectedBrand) return;

    setLoading(true);
    setError(null);

    fetchToolResults(
      selectedBrand.id,
      filterType === 'all' ? undefined : filterType
    )
      .then(setResults)
      .catch((err) => {
        console.error('Failed to fetch tool results:', err);
        setError('Failed to load saved results. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [selectedBrand, filterType]);

  // Handle delete result
  const handleDeleteResult = async (resultId: string) => {
    try {
      await deleteToolResult(resultId);
      setResults((prev) => prev.filter((r) => r.id !== resultId));
    } catch (err) {
      console.error('Failed to delete result:', err);
      setError('Failed to delete result. Please try again.');
    }
  };

  // Handle view result - for now, just show alert (will be implemented later)
  const handleViewResult = (result: ToolResult) => {
    // TODO: Navigate to specific tool with loaded result
    alert(`View functionality coming soon! Result ID: ${result.id}`);
  };

  if (!selectedBrand) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No brand selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Archive className="w-6 h-6" />
            Saved Tool Results
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {results.length} result{results.length !== 1 ? 's' : ''} saved
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-md transition-colors font-medium ${
            filterType === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary hover:bg-secondary/80'
          }`}
        >
          All
        </button>
        {Object.entries(TOOL_METADATA).map(([key, meta]) => {
          const Icon = meta.icon;
          return (
            <button
              key={key}
              onClick={() => setFilterType(key as ToolType)}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors font-medium ${
                filterType === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              {meta.name}
            </button>
          );
        })}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-md text-destructive">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : results.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12">
          <div className="mb-4">
            <Archive className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {filterType === 'all' ? 'No saved results yet' : `No ${TOOL_METADATA[filterType as ToolType]?.name} results`}
          </h3>
          <p className="text-muted-foreground mb-6">
            Generate results using Google Tools to see them here
          </p>
        </div>
      ) : (
        /* Results Grid */
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {results.map((result) => (
            <ToolResultCard
              key={result.id}
              result={result}
              onView={() => handleViewResult(result)}
              onDelete={() => handleDeleteResult(result.id)}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
