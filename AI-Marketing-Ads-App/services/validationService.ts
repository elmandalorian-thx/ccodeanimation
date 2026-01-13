/**
 * Validation Service
 * Platform-specific validation rules for ad copy fields
 */

export interface ValidationRule {
  type: 'maxLength' | 'emoji' | 'capitalization' | 'noDash' | 'minLength';
  params: any;
}

export interface ValidationError {
  field: string;
  rule: string;
  message: string;
  severity: 'error' | 'warning';
}

export type Platform = 'meta' | 'google' | 'tiktok';
export type FieldType =
  | 'primaryText'
  | 'headline'
  | 'description'
  | 'longHeadline'
  | 'shortHeadline'
  | 'callout'
  | 'keyword'
  | 'text';

// Platform-specific validation rules
const PLATFORM_RULES: Record<Platform, Record<string, ValidationRule[]>> = {
  google: {
    headline: [
      { type: 'maxLength', params: 30 },
      { type: 'capitalization', params: 'titleCase' },
      { type: 'noDash', params: true }
    ],
    longHeadline: [
      { type: 'maxLength', params: 90 },
      { type: 'capitalization', params: 'titleCase' }
    ],
    shortHeadline: [
      { type: 'maxLength', params: 60 },
      { type: 'capitalization', params: 'titleCase' }
    ],
    description: [
      { type: 'maxLength', params: 90 },
      { type: 'capitalization', params: 'sentenceCase' }
    ],
    callout: [
      { type: 'maxLength', params: 25 },
      { type: 'capitalization', params: 'titleCase' }
    ],
    keyword: [
      { type: 'maxLength', params: 80 },
      { type: 'minLength', params: 2 }
    ]
  },
  meta: {
    primaryText: [
      { type: 'maxLength', params: 125 },
      { type: 'emoji', params: { count: 2, positions: ['start', 'middle'] } }
    ],
    headline: [
      { type: 'maxLength', params: 40 },
      { type: 'emoji', params: { count: 1, positions: ['anywhere'] } }
    ],
    description: [
      { type: 'maxLength', params: 30 },
      { type: 'emoji', params: { count: 0 } }
    ]
  },
  tiktok: {
    text: [
      { type: 'maxLength', params: 100 },
      { type: 'minLength', params: 10 }
    ]
  }
};

/**
 * Count emojis in text
 */
function countEmojis(text: string): number {
  // Regex to match emoji characters
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const matches = text.match(emojiRegex);
  return matches ? matches.length : 0;
}

/**
 * Get emoji positions in text
 */
function getEmojiPositions(text: string): string[] {
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const positions: string[] = [];
  const matches = [...text.matchAll(emojiRegex)];

  matches.forEach(match => {
    const index = match.index || 0;
    const textLength = text.length;

    if (index === 0) positions.push('start');
    else if (index > textLength * 0.66) positions.push('end');
    else positions.push('middle');
  });

  return positions;
}

/**
 * Check if text is in title case (Each Word Capitalized)
 */
function isTitleCase(text: string): boolean {
  // Skip if text contains numbers or special chars predominantly
  if (/^[0-9%$€£¥]+/.test(text)) return true;

  const words = text.split(/\s+/);
  const capitalizedWords = words.filter(word => {
    // Skip short words like "a", "the", "of" (can be lowercase)
    if (word.length <= 2) return true;
    // Check if first letter is uppercase
    return /^[A-Z]/.test(word);
  });

  // At least 70% of words should start with capital
  return capitalizedWords.length / words.length >= 0.7;
}

/**
 * Check if text is in sentence case (First word capitalized)
 */
function isSentenceCase(text: string): boolean {
  // First character should be uppercase or number
  return /^[A-Z0-9]/.test(text);
}

/**
 * Validate a single field value against platform rules
 */
export function validateField(
  value: string,
  platform: Platform,
  fieldType: FieldType
): ValidationError[] {
  const errors: ValidationError[] = [];
  const rules = PLATFORM_RULES[platform]?.[fieldType] || [];

  for (const rule of rules) {
    switch (rule.type) {
      case 'maxLength': {
        if (value.length > rule.params) {
          errors.push({
            field: fieldType,
            rule: 'maxLength',
            message: `Exceeds max length of ${rule.params} characters (current: ${value.length})`,
            severity: 'error'
          });
        }
        break;
      }

      case 'minLength': {
        if (value.length < rule.params) {
          errors.push({
            field: fieldType,
            rule: 'minLength',
            message: `Below min length of ${rule.params} characters (current: ${value.length})`,
            severity: 'error'
          });
        }
        break;
      }

      case 'emoji': {
        const emojiCount = countEmojis(value);
        const expectedCount = rule.params.count;

        if (emojiCount !== expectedCount) {
          errors.push({
            field: fieldType,
            rule: 'emoji',
            message: `Should contain exactly ${expectedCount} emoji${expectedCount !== 1 ? 's' : ''} (found ${emojiCount})`,
            severity: 'warning'
          });
        }

        // Check emoji positions if specific positions required
        if (rule.params.positions && rule.params.positions[0] !== 'anywhere') {
          const positions = getEmojiPositions(value);
          const expectedPositions = rule.params.positions;

          const hasCorrectPositions = expectedPositions.every((pos: string) =>
            positions.includes(pos)
          );

          if (!hasCorrectPositions && emojiCount > 0) {
            errors.push({
              field: fieldType,
              rule: 'emojiPosition',
              message: `Emoji should be at: ${expectedPositions.join(', ')}`,
              severity: 'warning'
            });
          }
        }
        break;
      }

      case 'capitalization': {
        if (rule.params === 'titleCase' && !isTitleCase(value)) {
          errors.push({
            field: fieldType,
            rule: 'capitalization',
            message: 'Should be in Title Case (Each Word Capitalized)',
            severity: 'warning'
          });
        }

        if (rule.params === 'sentenceCase' && !isSentenceCase(value)) {
          errors.push({
            field: fieldType,
            rule: 'capitalization',
            message: 'Should start with a capital letter',
            severity: 'warning'
          });
        }
        break;
      }

      case 'noDash': {
        if (value.includes('-') && rule.params === true) {
          errors.push({
            field: fieldType,
            rule: 'noDash',
            message: 'Google Headlines should not contain dashes',
            severity: 'warning'
          });
        }
        break;
      }
    }
  }

  return errors;
}

/**
 * Get character count status (for UI color coding)
 */
export function getCharCountStatus(
  currentLength: number,
  maxLength: number
): 'safe' | 'warning' | 'error' {
  const ratio = currentLength / maxLength;

  if (ratio > 1) return 'error';
  if (ratio > 0.9) return 'warning';
  return 'safe';
}

/**
 * Get validation status for a field (summary of all errors)
 */
export function getValidationStatus(errors: ValidationError[]): 'valid' | 'warning' | 'error' {
  if (errors.length === 0) return 'valid';

  const hasError = errors.some(e => e.severity === 'error');
  return hasError ? 'error' : 'warning';
}

/**
 * Get max length for a field type
 */
export function getMaxLength(platform: Platform, fieldType: FieldType): number {
  const rules = PLATFORM_RULES[platform]?.[fieldType] || [];
  const maxLengthRule = rules.find(r => r.type === 'maxLength');
  return maxLengthRule?.params || 1000; // Default high value
}
