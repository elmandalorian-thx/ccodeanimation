/**
 * Suggestion Service
 * Generates AI-powered alternative suggestions for ad copy fields using Gemini API
 */

import { GoogleGenAI, Type } from "@google/genai";
import { AdCopyInput } from '../types';
import { Platform, FieldType } from './validationService';

// Cache for suggestions to avoid duplicate API calls
interface CacheEntry {
  suggestions: string[];
  timestamp: number;
}

const suggestionCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Context needed to generate relevant suggestions
 */
export interface SuggestionContext {
  originalText: string;
  currentText?: string; // For real-time suggestions (what user is currently typing)
  fieldType: FieldType;
  platform: Platform;
  maxLength: number;
  campaignContext?: Partial<AdCopyInput>; // Brand info, campaign purpose, etc.
}

/**
 * Generate cache key for deduplication
 */
function getCacheKey(context: SuggestionContext, isRealTime: boolean): string {
  const text = isRealTime ? context.currentText : context.originalText;
  return `${context.platform}-${context.fieldType}-${text}-${isRealTime}`;
}

/**
 * Check if cached suggestions are still valid
 */
function getCachedSuggestions(cacheKey: string): string[] | null {
  const cached = suggestionCache.get(cacheKey);

  if (!cached) return null;

  // Check if cache is still valid (within TTL)
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    suggestionCache.delete(cacheKey);
    return null;
  }

  return cached.suggestions;
}

/**
 * Store suggestions in cache
 */
function cacheSuggestions(cacheKey: string, suggestions: string[]): void {
  suggestionCache.set(cacheKey, {
    suggestions,
    timestamp: Date.now()
  });
}

/**
 * Get platform-specific style guidance
 */
function getPlatformStyleGuide(platform: Platform, fieldType: FieldType): string {
  const guides: Record<Platform, Record<string, string>> = {
    google: {
      headline: 'Use Title Case. Be clear and direct. No dashes. Focus on benefits or offers.',
      longHeadline: 'Use Title Case. Can be more descriptive. Highlight unique value proposition.',
      shortHeadline: 'Use Title Case. Ultra-concise. One powerful benefit or offer.',
      description: 'Start with capital letter. Focus on supporting details and CTAs.',
      callout: 'Short benefit phrases. Title Case. No punctuation.',
      keyword: 'Natural phrases users would search for.'
    },
    meta: {
      primaryText: 'Start with emoji. Place second emoji in middle. Conversational and engaging tone.',
      headline: 'Include exactly one emoji. Attention-grabbing. Clear value.',
      description: 'No emojis. Short benefit or CTA. Complements the headline.'
    },
    tiktok: {
      text: 'Casual, authentic tone. Can use emojis naturally. Hook attention quickly.'
    }
  };

  return guides[platform]?.[fieldType] || 'Clear, engaging copy that drives action.';
}

/**
 * Generate initial suggestions when user clicks to edit a field
 */
export async function generateInitialSuggestions(
  context: SuggestionContext
): Promise<string[]> {
  // Check cache first
  const cacheKey = getCacheKey(context, false);
  const cached = getCachedSuggestions(cacheKey);
  if (cached) {
    return cached;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const styleGuide = getPlatformStyleGuide(context.platform, context.fieldType);

  const prompt = `You are an expert ${context.platform} ads copywriter.

**Current ${context.fieldType}:**
"${context.originalText}"

**Your task:** Generate 3 alternative versions that:
1. Maintain the core message and intent
2. Stay within ${context.maxLength} characters
3. Follow ${context.platform} platform style: ${styleGuide}
4. Improve engagement, clarity, or persuasiveness
${context.campaignContext ? `

**Campaign Context:**
- Brand: ${context.campaignContext.brandName || 'N/A'}
- Purpose: ${context.campaignContext.campaignPurpose || 'N/A'}
- Avoid: ${context.campaignContext.negativeKeywords || 'N/A'}` : ''}

**Requirements:**
- Each alternative should be meaningfully different (not just minor word swaps)
- Maintain professional quality
- Consider different angles: emotional appeal, urgency, clarity, or benefit-focused

Return ONLY a JSON array of 3 strings, no other text.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Fast and cost-effective for suggestions
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const suggestions = JSON.parse(response.text) as string[];

    // Cache the results
    cacheSuggestions(cacheKey, suggestions);

    return suggestions.slice(0, 3); // Ensure exactly 3 suggestions
  } catch (error: any) {
    console.error('Error generating initial suggestions:', error);
    throw new Error(`Failed to generate suggestions: ${error.message}`);
  }
}

/**
 * Generate real-time suggestions as user types
 * Optimized for speed - uses lighter prompts and aggressive caching
 */
export async function generateRealTimeSuggestions(
  context: SuggestionContext
): Promise<string[]> {
  // Don't generate suggestions for very short text
  if (!context.currentText || context.currentText.length < 5) {
    return [];
  }

  // Check cache first
  const cacheKey = getCacheKey(context, true);
  const cached = getCachedSuggestions(cacheKey);
  if (cached) {
    return cached;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const styleGuide = getPlatformStyleGuide(context.platform, context.fieldType);

  const prompt = `You are a ${context.platform} ads copywriter. Complete/improve this ${context.fieldType}:

"${context.currentText}"

Generate 3 completions/improvements that:
- Stay within ${context.maxLength} characters
- Follow style: ${styleGuide}
- Build on what's already typed

Return JSON array of 3 strings.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const suggestions = JSON.parse(response.text) as string[];

    // Cache the results
    cacheSuggestions(cacheKey, suggestions);

    return suggestions.slice(0, 3);
  } catch (error: any) {
    console.error('Error generating real-time suggestions:', error);
    // Return empty array on error for real-time (non-blocking)
    return [];
  }
}

/**
 * Clear the suggestion cache (useful for testing or memory management)
 */
export function clearSuggestionCache(): void {
  suggestionCache.clear();
}

/**
 * Get cache statistics (for debugging)
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: suggestionCache.size,
    keys: Array.from(suggestionCache.keys())
  };
}
