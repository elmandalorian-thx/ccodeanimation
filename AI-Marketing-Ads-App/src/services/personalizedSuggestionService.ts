import { GoogleGenAI, Type } from "@google/genai";
import { Platform, FieldType } from '../types/database';
import { fetchEditHistory, getEditCount } from './editHistoryService';
import { supabase } from './supabaseClient';

const MIN_EDITS_FOR_PERSONALIZATION = 5;

interface SuggestionContext {
  brand_id: string;
  platform: Platform;
  field_type: FieldType;
  current_text: string;
  max_length: number;
}

/**
 * Generate 3 personalized suggestions based on user's edit history
 * Falls back to generic suggestions if user has < 5 edits
 */
export async function generatePersonalizedSuggestions(
  context: SuggestionContext
): Promise<string[]> {
  // Check cache first
  const cached = await getCachedSuggestions(context);
  if (cached) {
    return cached;
  }

  // Check edit count
  const editCount = await getEditCount({
    brand_id: context.brand_id,
    platform: context.platform,
    field_type: context.field_type,
  });

  let suggestions: string[];

  if (editCount >= MIN_EDITS_FOR_PERSONALIZATION) {
    // User has enough history for personalized suggestions
    suggestions = await generateFromEditPatterns(context);
  } else {
    // Fallback to generic suggestions
    suggestions = await generateGenericSuggestions(context);
  }

  // Cache the suggestions (5 min TTL)
  await cacheSuggestions(context, suggestions);

  return suggestions;
}

/**
 * Generate suggestions based on user's edit patterns
 */
async function generateFromEditPatterns(
  context: SuggestionContext
): Promise<string[]> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY environment variable is not set.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Fetch recent edits
  const editHistory = await fetchEditHistory({
    brand_id: context.brand_id,
    platform: context.platform,
    field_type: context.field_type,
    limit: 10,
  });

  // Build learning prompt
  const learningPrompt = `
You are learning from this user's editing patterns for ${context.platform} ${context.field_type}.

**Past Edits (Original → User's Edit):**
${editHistory.map((h, i) => `
${i + 1}. Original: "${h.original_value}"
   User Changed To: "${h.edited_value}"
`).join('\n')}

**Current Text:**
"${context.current_text}"

**Task:** Generate 3 alternative suggestions that match this user's personal style and preferences.

**Analysis Instructions:**
1. Analyze the patterns in the user's edits:
   - **Tone:** Are they more formal or casual? Do they use contractions? Do they prefer direct or subtle language?
   - **Length:** Do they prefer shorter or longer copy? Count average character length of their edits.
   - **Word Choices:** What vocabulary do they favor? Technical vs. simple? Power words vs. descriptive?
   - **Emoji Usage:** How do they use emojis (if at all)? Placement patterns? Frequency?
   - **Capitalization:** Title case, sentence case, or ALL CAPS for emphasis?
   - **Punctuation:** Exclamation marks, question marks, ellipses... what patterns emerge?

2. Generate 3 variations that:
   - Match the tone and style the user gravitates towards
   - Use similar vocabulary patterns
   - Follow the same emoji usage patterns (if applicable for ${context.platform})
   - Stay under ${context.max_length} characters
   - Convey the same core message as the current text
   - Each suggestion should be distinctly different but all match the user's style

**Output Format:** Return ONLY a JSON array of 3 strings. No explanation, no markdown, just the array.

Example: ["First suggestion here", "Second suggestion here", "Third suggestion here"]
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: learningPrompt }] },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  const suggestions = JSON.parse(response.text);

  // Validate and trim suggestions
  return suggestions
    .slice(0, 3)
    .map((s: string) => s.slice(0, context.max_length));
}

/**
 * Generate generic suggestions when user doesn't have enough history
 */
async function generateGenericSuggestions(
  context: SuggestionContext
): Promise<string[]> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY environment variable is not set.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const genericPrompt = `
Generate 3 alternative variations of this ${context.platform} ad copy ${context.field_type}.

**Current Text:**
"${context.current_text}"

**Platform-Specific Rules:**
${getPlatformRules(context.platform, context.field_type)}

**Requirements:**
- Generate 3 distinctly different variations
- Each must be under ${context.max_length} characters
- Maintain the core message
- Use best practices for ${context.platform} advertising
- Return ONLY a JSON array of 3 strings

Example: ["First variation", "Second variation", "Third variation"]
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: genericPrompt }] },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  const suggestions = JSON.parse(response.text);

  return suggestions
    .slice(0, 3)
    .map((s: string) => s.slice(0, context.max_length));
}

/**
 * Get platform-specific rules for ad copy
 */
function getPlatformRules(platform: Platform, fieldType: FieldType): string {
  const rules: Record<Platform, Record<string, string>> = {
    meta: {
      primaryText: "Start with an emoji. Include a second emoji in the middle. Around 125 characters. Engaging and direct.",
      headline: "Include exactly one emoji. Around 40 characters. Attention-grabbing.",
      description: "No emojis. Around 30 characters. Supplementary benefit.",
    },
    google: {
      headline: "Max 30 characters. Capitalize each word. No emojis.",
      longHeadline: "Max 90 characters. Capitalize each word. No emojis.",
      shortHeadline: "Max 60 characters. Capitalize each word. No emojis.",
      description: "Max 90 characters. Complement other descriptions. No emojis. No dashes.",
      callout: "Max 25 characters. Brief feature or benefit.",
    },
    tiktok: {
      default: "Max 100 characters. Casual, authentic tone. Can use emojis sparingly.",
    },
  };

  return rules[platform]?.[fieldType] || rules[platform]?.default || "Follow platform best practices.";
}

/**
 * Check if suggestions are cached (5 min TTL)
 */
async function getCachedSuggestions(
  context: SuggestionContext
): Promise<string[] | null> {
  const { data, error } = await supabase
    .from('suggestion_cache')
    .select('suggestions, expires_at')
    .eq('brand_id', context.brand_id)
    .eq('platform', context.platform)
    .eq('field_type', context.field_type)
    .eq('original_text', context.current_text)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return null;
  }

  return data[0].suggestions as string[];
}

/**
 * Cache suggestions in database
 */
async function cacheSuggestions(
  context: SuggestionContext,
  suggestions: string[]
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 5);

  const { error } = await supabase
    .from('suggestion_cache')
    .insert([
      {
        brand_id: context.brand_id,
        platform: context.platform,
        field_type: context.field_type,
        original_text: context.current_text,
        suggestions,
        expires_at: expiresAt.toISOString(),
      },
    ]);

  if (error) {
    console.error('Error caching suggestions:', error);
    // Don't throw - caching is non-critical
  }
}

/**
 * Cleanup expired suggestions from cache
 */
export async function cleanupExpiredSuggestions(): Promise<void> {
  const { error } = await supabase
    .from('suggestion_cache')
    .delete()
    .lt('expires_at', new Date().toISOString());

  if (error) {
    console.error('Error cleaning up expired suggestions:', error);
  }
}
