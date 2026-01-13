import { useState, useEffect } from 'react';
import { useBrandStore } from '../stores/brandStore';
import { useCacheStore } from '../stores/cacheStore';
import { ToolType, ToolResult } from '../types/database';
import { saveToolResult, fetchToolResults } from '../services/toolResultService';

interface UseToolResultsOptions<T> {
  toolType: ToolType;
  inputData: Record<string, any>;
  generateFn: () => Promise<T>;
  enabled?: boolean;
}

interface UseToolResultsReturn<T> {
  result: T | null;
  isLoading: boolean;
  error: string | null;
  generate: () => Promise<void>;
  savedResults: ToolResult[];
  loadSavedResult: (resultId: string) => Promise<void>;
}

/**
 * Custom hook for managing tool results with auto-save and caching
 *
 * Caching strategy:
 * 1. Check in-memory cache (5 min TTL)
 * 2. Check database for previous results
 * 3. Call generate function if no cache hit
 * 4. Save to both cache layers
 */
export function useToolResults<T = any>({
  toolType,
  inputData,
  generateFn,
  enabled = true,
}: UseToolResultsOptions<T>): UseToolResultsReturn<T> {
  const { selectedBrand } = useBrandStore();
  const cacheStore = useCacheStore();

  const [result, setResult] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedResults, setSavedResults] = useState<ToolResult[]>([]);

  // Generate cache key from brand ID, tool type, and input data
  const cacheKey = `tool-${selectedBrand?.id}-${toolType}-${JSON.stringify(inputData)}`;

  // Load saved results on mount
  useEffect(() => {
    if (selectedBrand && enabled) {
      loadSavedResults();
    }
  }, [selectedBrand?.id, toolType, enabled]);

  const loadSavedResults = async () => {
    if (!selectedBrand) return;

    try {
      const results = await fetchToolResults(selectedBrand.id, toolType);
      setSavedResults(results);
    } catch (err) {
      console.error('Error loading saved results:', err);
    }
  };

  const generate = async () => {
    if (!selectedBrand || !enabled) {
      console.warn('Cannot generate: No brand selected or hook disabled');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Check in-memory cache first
      const cachedResult = cacheStore.get<T>(cacheKey);
      if (cachedResult) {
        console.log('Cache hit (in-memory):', toolType);
        setResult(cachedResult);
        setIsLoading(false);
        return;
      }

      // 2. Check database for exact match
      const matchingResult = savedResults.find((r) => {
        return JSON.stringify(r.input_data) === JSON.stringify(inputData);
      });

      if (matchingResult) {
        console.log('Cache hit (database):', toolType);
        const dbResult = matchingResult.result_data as T;
        setResult(dbResult);

        // Store in memory cache for next time
        cacheStore.set(cacheKey, dbResult);
        setIsLoading(false);
        return;
      }

      // 3. No cache hit - generate new result
      console.log('Cache miss - generating:', toolType);
      const generatedResult = await generateFn();
      setResult(generatedResult);

      // 4. Auto-save to database
      await saveToolResult({
        brand_id: selectedBrand.id,
        tool_type: toolType,
        input_data: inputData,
        result_data: generatedResult as any,
      });

      // 5. Save to in-memory cache
      cacheStore.set(cacheKey, generatedResult);

      // 6. Refresh saved results list
      await loadSavedResults();

      console.log('Result generated and auto-saved:', toolType);
    } catch (err: any) {
      console.error('Error generating result:', err);
      setError(err.message || 'Failed to generate result');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedResult = async (resultId: string) => {
    const savedResult = savedResults.find((r) => r.id === resultId);
    if (savedResult) {
      const loadedResult = savedResult.result_data as T;
      setResult(loadedResult);

      // Update cache
      cacheStore.set(cacheKey, loadedResult);
    }
  };

  return {
    result,
    isLoading,
    error,
    generate,
    savedResults,
    loadSavedResult,
  };
}
