import { Brand } from '../types/database';
import { fetchEditHistory } from './editHistoryService';

// Industry-specific emoji mappings
const INDUSTRY_EMOJI_MAP: Record<string, string[]> = {
  tech: ['💻', '⚡', '🚀', '💡', '🔧', '⚙️', '📱', '🖥️'],
  software: ['💻', '⚡', '🚀', '💡', '📊', '🎯', '✨', '🔥'],
  food: ['🍕', '🍔', '☕', '🍰', '🥗', '🍜', '🍝', '🥘'],
  restaurant: ['🍽️', '👨‍🍳', '🍴', '🥘', '☕', '🍕', '🥗', '🍜'],
  fitness: ['💪', '🏋️', '🏃', '⚡', '🔥', '💯', '🎯', '👟'],
  health: ['❤️', '🏥', '💊', '🧘', '🩺', '🌿', '💚', '✨'],
  finance: ['💰', '💳', '📈', '💵', '🏦', '💎', '💸', '📊'],
  banking: ['🏦', '💳', '💰', '📈', '💵', '🔐', '💎', '📊'],
  education: ['📚', '🎓', '✏️', '🧠', '📖', '🎯', '👨‍🎓', '💡'],
  travel: ['✈️', '🌍', '🏖️', '🗺️', '🎒', '🏨', '🌴', '🧳'],
  ecommerce: ['🛍️', '🛒', '💳', '📦', '🎁', '⚡', '🚀', '💯'],
  shopping: ['🛍️', '🛒', '💳', '🎁', '👗', '👟', '💄', '⚡'],
  beauty: ['💄', '💅', '✨', '💎', '🌸', '🦋', '👑', '💖'],
  fashion: ['👗', '👠', '👜', '✨', '💎', '🌟', '👑', '💖'],
  automotive: ['🚗', '🏎️', '🔧', '⚡', '🛞', '🔑', '🚙', '🏁'],
  realestate: ['🏠', '🏡', '🔑', '🏘️', '🏢', '📍', '✨', '💰'],
  marketing: ['📣', '📈', '🎯', '💡', '✨', '🚀', '📊', '💻'],
  consulting: ['💼', '📊', '🎯', '💡', '📈', '🚀', '✨', '🤝'],
  saas: ['💻', '☁️', '🚀', '⚡', '📊', '💡', '🎯', '✨'],
  gaming: ['🎮', '🕹️', '🎯', '🏆', '⚡', '🔥', '💯', '🎨'],
  music: ['🎵', '🎶', '🎸', '🎤', '🎧', '🎹', '🎼', '🔊'],
  sports: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏆', '🥇', '💪'],
  medical: ['🏥', '⚕️', '💊', '🩺', '❤️', '🧬', '💉', '🔬'],
  dental: ['🦷', '😁', '✨', '💎', '🏥', '❤️', '👨‍⚕️', '💯'],
  pet: ['🐶', '🐱', '🐾', '❤️', '🦴', '🐕', '😺', '✨'],
  home: ['🏠', '🏡', '🛋️', '🛏️', '🪴', '🕯️', '✨', '💡'],
  baby: ['👶', '🍼', '👣', '🧸', '❤️', '✨', '💕', '🎈'],
  wedding: ['💍', '👰', '🤵', '💐', '💒', '❤️', '✨', '💖']
};

// Keywords to detect industry from brand name or website
const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  tech: ['tech', 'software', 'digital', 'cloud', 'ai', 'app', 'platform', 'innovation'],
  software: ['software', 'saas', 'app', 'platform', 'solution', 'system', 'tool'],
  food: ['food', 'restaurant', 'cafe', 'kitchen', 'cook', 'eat', 'meal', 'dining'],
  restaurant: ['restaurant', 'bistro', 'cafe', 'grill', 'kitchen', 'dining', 'eatery'],
  fitness: ['fit', 'gym', 'workout', 'train', 'exercise', 'wellness', 'athlete'],
  health: ['health', 'wellness', 'medical', 'care', 'clinic', 'hospital', 'therapy'],
  finance: ['finance', 'invest', 'money', 'capital', 'fund', 'wealth', 'financial'],
  banking: ['bank', 'credit', 'loan', 'mortgage', 'savings', 'account'],
  education: ['education', 'learn', 'school', 'academy', 'course', 'training', 'teach'],
  travel: ['travel', 'tour', 'vacation', 'hotel', 'trip', 'adventure', 'journey'],
  ecommerce: ['shop', 'store', 'retail', 'ecommerce', 'marketplace', 'buy', 'sell'],
  shopping: ['shop', 'boutique', 'store', 'retail', 'mall'],
  beauty: ['beauty', 'cosmetic', 'makeup', 'skin', 'salon', 'spa', 'glow'],
  fashion: ['fashion', 'style', 'clothing', 'apparel', 'wear', 'boutique', 'designer'],
  automotive: ['auto', 'car', 'vehicle', 'motor', 'drive', 'automotive'],
  realestate: ['real estate', 'property', 'home', 'house', 'realty', 'realtor'],
  marketing: ['marketing', 'advertis', 'promo', 'brand', 'agency', 'media'],
  consulting: ['consult', 'advisory', 'strategy', 'business', 'management'],
  saas: ['saas', 'cloud', 'subscription', 'platform', 'service'],
  gaming: ['game', 'gaming', 'play', 'esports', 'gamer'],
  music: ['music', 'audio', 'sound', 'record', 'studio', 'concert'],
  sports: ['sport', 'athletic', 'team', 'league', 'tournament'],
  medical: ['medical', 'clinic', 'doctor', 'physician', 'healthcare'],
  dental: ['dental', 'dentist', 'teeth', 'smile', 'orthodont'],
  pet: ['pet', 'dog', 'cat', 'animal', 'veterinary', 'vet'],
  home: ['home', 'interior', 'decor', 'furniture', 'living'],
  baby: ['baby', 'infant', 'child', 'kids', 'parenting'],
  wedding: ['wedding', 'bride', 'marry', 'ceremony', 'bridal']
};

// Extract emojis from text using Unicode regex
function extractEmojis(text: string): string[] {
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
  const matches = text.match(emojiRegex);
  return matches || [];
}

// Detect industry from brand info
function detectIndustry(brand: Brand): string | null {
  const searchText = `${brand.name} ${brand.website || ''} ${brand.brand_guidelines?.negativeTerms?.join(' ') || ''}`.toLowerCase();

  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (keywords.some(keyword => searchText.includes(keyword))) {
      return industry;
    }
  }

  return null;
}

// Get brand-aware emoji suggestions
export async function getBrandEmojiSuggestions(brand: Brand): Promise<string[]> {
  const suggestions: string[] = [];

  // 1. Get industry-based emojis (3 emojis)
  const industry = detectIndustry(brand);
  if (industry && INDUSTRY_EMOJI_MAP[industry]) {
    const industryEmojis = INDUSTRY_EMOJI_MAP[industry].slice(0, 3);
    suggestions.push(...industryEmojis);
  }

  // 2. Get recently used emojis from edit history (3 emojis)
  try {
    const editHistory = await fetchEditHistory(brand.id, 50); // Get last 50 edits
    const recentEmojis: string[] = [];
    const emojiCount: Record<string, number> = {};

    // Extract and count emojis from edit history
    editHistory.forEach(edit => {
      const emojis = extractEmojis(edit.edited_value);
      emojis.forEach(emoji => {
        emojiCount[emoji] = (emojiCount[emoji] || 0) + 1;
      });
    });

    // Sort by frequency and get top 3
    const sortedEmojis = Object.entries(emojiCount)
      .sort(([, a], [, b]) => b - a)
      .map(([emoji]) => emoji)
      .slice(0, 3);

    recentEmojis.push(...sortedEmojis);

    // Add to suggestions if we have recent emojis
    if (recentEmojis.length > 0) {
      suggestions.push(...recentEmojis);
    }
  } catch (error) {
    console.error('Error fetching edit history for emoji suggestions:', error);
  }

  // 3. If we don't have 6 suggestions yet, fill with generic popular emojis
  const fallbackEmojis = ['✨', '🔥', '💪', '🚀', '💯', '⚡'];
  while (suggestions.length < 6) {
    const nextFallback = fallbackEmojis.find(emoji => !suggestions.includes(emoji));
    if (nextFallback) {
      suggestions.push(nextFallback);
    } else {
      break;
    }
  }

  // Remove duplicates and limit to 6
  return [...new Set(suggestions)].slice(0, 6);
}
