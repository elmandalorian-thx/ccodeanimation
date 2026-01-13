import { useState, useEffect, useRef } from 'react';
import { ValidationBadge } from './ValidationBadge';
import { validateField, getMaxLength, type Platform, type FieldType } from '../services/validationService';
import { useDebounce } from '../hooks/useDebounce';
import { useBrandStore } from '../src/stores/brandStore';
import { generatePersonalizedSuggestions } from '../src/services/personalizedSuggestionService';
import { trackEdit } from '../src/services/editHistoryService';
import { Check, Copy } from 'lucide-react';
import { EmojiPicker } from './EmojiPicker';

interface EditableFieldProps {
  value: string;
  fieldType: FieldType;
  platform: Platform;
  fieldLabel: string;
  charCount?: number;
  onSave: (newValue: string) => void;
  adCopyId?: string;
  campaignPurpose?: string;
}

/**
 * EditableField Component - Enhanced with ML-based personalized suggestions
 *
 * Features:
 * - **Single Click**: Copy to clipboard with toast notification
 * - **Double Click**: Enter edit mode with AI suggestions
 * - **Personalized AI**: Learns from user's edit patterns (requires 5+ edits)
 * - Real-time validation with character counter
 * - Edit tracking for ML learning
 * - Auto-expanding textarea
 */
export function EditableField({
  value,
  fieldType,
  platform,
  fieldLabel,
  charCount,
  onSave,
  adCopyId,
  campaignPurpose,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [originalValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [usedSuggestion, setUsedSuggestion] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { selectedBrand } = useBrandStore();

  // Debounce current value for real-time suggestions (500ms)
  const debouncedValue = useDebounce(currentValue, 500);

  // Validate current value
  const maxLength = getMaxLength(platform, fieldType);
  const validationErrors = validateField(currentValue, platform, fieldType);
  const hasChanges = currentValue !== originalValue;

  // Auto-focus and select text when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current && isEditing) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [currentValue, isEditing]);

  /**
   * Handle single click - Copy to clipboard
   */
  const handleSingleClick = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  /**
   * Handle double click - Enter edit mode with AI suggestions
   */
  const handleDoubleClick = async () => {
    setIsEditing(true);
    setShowSuggestions(true);
    setUsedSuggestion(false);

    // Request personalized AI suggestions
    if (selectedBrand) {
      await loadPersonalizedSuggestions(currentValue);
    }
  };

  /**
   * Click detection: differentiate single vs double click
   */
  const handleClick = () => {
    if (clickTimer) {
      // Double click detected
      clearTimeout(clickTimer);
      setClickTimer(null);
      handleDoubleClick();
    } else {
      // Potential single click - wait 300ms to confirm
      const timer = setTimeout(() => {
        handleSingleClick();
        setClickTimer(null);
      }, 300);
      setClickTimer(timer);
    }
  };

  /**
   * Load personalized AI suggestions based on user's edit history
   */
  const loadPersonalizedSuggestions = async (text: string) => {
    if (!selectedBrand) return;

    setIsLoadingSuggestions(true);
    try {
      const personalizedSuggestions = await generatePersonalizedSuggestions({
        brand_id: selectedBrand.id,
        platform: platform as any,
        field_type: fieldType as any,
        current_text: text,
        max_length: maxLength,
      });

      setSuggestions(personalizedSuggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  /**
   * Save changes and track edit for ML learning
   */
  const handleSave = async () => {
    // Don't save if there are critical errors
    const hasCriticalErrors = validationErrors.some((e) => e.severity === 'error');
    if (hasCriticalErrors || !hasChanges) {
      return;
    }

    // Track edit in database for ML learning
    if (selectedBrand) {
      try {
        await trackEdit({
          brand_id: selectedBrand.id,
          ad_copy_id: adCopyId,
          platform: platform as any,
          field_type: fieldType as any,
          original_value: originalValue,
          edited_value: currentValue,
          edit_context: {
            campaignPurpose,
          },
          suggestion_used: usedSuggestion,
        });
      } catch (error) {
        console.error('Error tracking edit:', error);
        // Don't block save if tracking fails
      }
    }

    onSave(currentValue);
    setIsEditing(false);
    setShowSuggestions(false);
  };

  const handleDiscard = () => {
    setCurrentValue(originalValue);
    setIsEditing(false);
    setShowSuggestions(false);
    setUsedSuggestion(false);
  };

  const handleUseSuggestion = (suggestion: string) => {
    setCurrentValue(suggestion);
    setShowSuggestions(false);
    setUsedSuggestion(true);
  };

  const handleEmojiSelect = (emoji: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newValue = currentValue.substring(0, start) + emoji + currentValue.substring(end);
      setCurrentValue(newValue);

      // Set cursor position after emoji
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = start + emoji.length;
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  // Read-only view - Click to copy, Double-click to edit
  if (!isEditing) {
    return (
      <div
        className="group relative bg-card border border-border rounded-lg p-4 cursor-pointer hover:bg-accent/50 hover:border-primary transition-all"
        onClick={handleClick}
        title="Click to copy, Double-click to edit"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">
              {fieldLabel}
              {charCount !== undefined && (
                <span className="text-orange-400 font-semibold ml-1">
                  ({charCount} chars)
                </span>
              )}
            </div>
            <div className="text-foreground">{value}</div>
          </div>
          <div className="flex items-center gap-2">
            {isCopied ? (
              <Check className="w-4 h-4 text-green-500 animate-in fade-in" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </div>

        {isCopied && (
          <div className="absolute -top-8 right-0 bg-green-600 text-white text-xs px-2 py-1 rounded animate-in fade-in slide-in-from-bottom-2">
            Copied!
          </div>
        )}
      </div>
    );
  }

  // Edit mode view
  return (
    <div className="bg-card border-2 border-primary rounded-lg p-4 space-y-4 animate-in fade-in">
      {/* Header with label and validation */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">{fieldLabel}</div>
        <ValidationBadge
          errors={validationErrors}
          charCount={{ current: currentValue.length, max: maxLength }}
        />
      </div>

      {/* Textarea for editing with emoji picker */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          className="w-full bg-background text-foreground border border-border rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          rows={2}
          placeholder={`Edit ${fieldLabel.toLowerCase()}...`}
        />

        {/* Emoji Picker Button (positioned in top-right of textarea) */}
        <div className="absolute top-2 right-2">
          <EmojiPicker onSelect={handleEmojiSelect} />
        </div>
      </div>

      {/* AI Suggestions Section */}
      {showSuggestions && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-primary font-medium">
              Personalized AI Suggestions
            </div>
            {isLoadingSuggestions && (
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Learning your style...
              </div>
            )}
          </div>

          {suggestions.length > 0 ? (
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleUseSuggestion(suggestion)}
                  className="w-full text-left bg-secondary hover:bg-secondary/80 border border-border hover:border-primary rounded-lg p-3 text-sm text-foreground hover:text-primary transition-all"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-mono text-xs mt-0.5 font-semibold">
                      {index + 1}
                    </span>
                    <span className="flex-1">{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            !isLoadingSuggestions && (
              <div className="text-xs text-muted-foreground italic p-3 bg-secondary/50 rounded-md">
                {selectedBrand
                  ? 'AI suggestions will appear here as you edit. Keep editing to train your personalized AI!'
                  : 'Select a brand to enable personalized AI suggestions.'}
              </div>
            )
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
        >
          <svg
            className={`w-4 h-4 transition-transform ${
              showSuggestions ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          {showSuggestions ? 'Hide' : 'Show'} AI Suggestions
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleDiscard}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm transition-colors"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={
              !hasChanges || validationErrors.some((e) => e.severity === 'error')
            }
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              !hasChanges || validationErrors.some((e) => e.severity === 'error')
                ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Change indicator */}
      {hasChanges && (
        <div className="text-xs text-yellow-500 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          Unsaved changes
        </div>
      )}

      {/* Edit tracking info */}
      {hasChanges && selectedBrand && (
        <div className="text-xs text-muted-foreground italic">
          💡 Your edits help train personalized AI suggestions
        </div>
      )}
    </div>
  );
}
