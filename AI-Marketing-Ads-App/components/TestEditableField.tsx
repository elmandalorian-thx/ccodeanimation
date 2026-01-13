import { useState } from 'react';
import { EditableField } from './EditableField';
import { generateInitialSuggestions, generateRealTimeSuggestions, type SuggestionContext } from '../services/suggestionService';
import type { Platform, FieldType } from '../services/validationService';

/**
 * Test Page for EditableField Component
 * Demonstrates the interactive editing features with REAL Gemini AI
 */
export default function TestEditableField() {
  // Sample data for different platforms
  const [googleHeadline, setGoogleHeadline] = useState('Shop Premium Outdoor Gear Today');
  const [metaPrimaryText, setMetaPrimaryText] = useState(
    '🏔️ Discover premium outdoor gear built for adventure. Transform your hiking experience with our award-winning backpacks & tents! 🎒'
  );
  const [tiktokText, setTiktokText] = useState(
    'Get ready for adventure season! Premium gear that goes the distance 🏕️'
  );

  // AI suggestions state (now using real Gemini API)
  const [googleSuggestions, setGoogleSuggestions] = useState<string[]>([]);
  const [metaSuggestions, setMetaSuggestions] = useState<string[]>([]);
  const [tiktokSuggestions, setTiktokSuggestions] = useState<string[]>([]);

  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  const [isLoadingTiktok, setIsLoadingTiktok] = useState(false);

  // Campaign context for better suggestions
  const campaignContext = {
    brandName: 'Mountain Gear Co.',
    website: 'https://mountaingear.example.com',
    campaignPurpose: 'Promote premium outdoor equipment for hiking and camping enthusiasts',
    negativeKeywords: 'cheap, budget, low-quality'
  };

  // Real Gemini AI suggestion handler for Google
  const handleRequestGoogleSuggestions = async (currentValue: string) => {
    setIsLoadingGoogle(true);
    setGoogleSuggestions([]);

    try {
      const context: SuggestionContext = {
        originalText: googleHeadline,
        currentText: currentValue,
        fieldType: 'headline' as FieldType,
        platform: 'google' as Platform,
        maxLength: 30,
        campaignContext
      };

      // Use real-time suggestions if user is editing, initial if just clicked
      const suggestions = currentValue === googleHeadline
        ? await generateInitialSuggestions(context)
        : await generateRealTimeSuggestions(context);

      setGoogleSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating Google suggestions:', error);
      setGoogleSuggestions(['Error generating suggestions. Check console.']);
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  // Real Gemini AI suggestion handler for Meta
  const handleRequestMetaSuggestions = async (currentValue: string) => {
    setIsLoadingMeta(true);
    setMetaSuggestions([]);

    try {
      const context: SuggestionContext = {
        originalText: metaPrimaryText,
        currentText: currentValue,
        fieldType: 'primaryText' as FieldType,
        platform: 'meta' as Platform,
        maxLength: 125,
        campaignContext
      };

      const suggestions = currentValue === metaPrimaryText
        ? await generateInitialSuggestions(context)
        : await generateRealTimeSuggestions(context);

      setMetaSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating Meta suggestions:', error);
      setMetaSuggestions(['Error generating suggestions. Check console.']);
    } finally {
      setIsLoadingMeta(false);
    }
  };

  // Real Gemini AI suggestion handler for TikTok
  const handleRequestTiktokSuggestions = async (currentValue: string) => {
    setIsLoadingTiktok(true);
    setTiktokSuggestions([]);

    try {
      const context: SuggestionContext = {
        originalText: tiktokText,
        currentText: currentValue,
        fieldType: 'text' as FieldType,
        platform: 'tiktok' as Platform,
        maxLength: 100,
        campaignContext
      };

      const suggestions = currentValue === tiktokText
        ? await generateInitialSuggestions(context)
        : await generateRealTimeSuggestions(context);

      setTiktokSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating TikTok suggestions:', error);
      setTiktokSuggestions(['Error generating suggestions. Check console.']);
    } finally {
      setIsLoadingTiktok(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-cyan-400">
            Interactive Editing Test Page
          </h1>
          <p className="text-slate-400">
            Click any field below to edit • Watch validation • Get AI suggestions
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-slate-800/50 border border-purple-600/30 rounded-lg p-6 space-y-3">
          <h2 className="text-xl font-bold text-cyan-400">How to Test</h2>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">1.</span>
              <span>
                <strong>Click any field</strong> to enter edit mode - notice the border changes to cyan
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">2.</span>
              <span>
                <strong>Watch the character counter</strong> - it turns yellow near the limit, red when exceeded
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">3.</span>
              <span>
                <strong>Check validation badges</strong> - hover over warnings/errors to see details
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">4.</span>
              <span>
                <strong>Click "Show Suggestions"</strong> - mock AI suggestions will appear after typing
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">5.</span>
              <span>
                <strong>Try breaking rules</strong>:
                <ul className="mt-1 ml-4 space-y-1">
                  <li>• Google headline: exceed 30 chars or add dashes</li>
                  <li>• Meta primary text: remove emojis (needs exactly 2)</li>
                  <li>• TikTok text: go over 100 characters</li>
                </ul>
              </span>
            </li>
          </ul>
        </div>

        {/* Test Fields */}
        <div className="space-y-6">
          {/* Google Headline */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-purple-400">
              Google Ads Headline
              <span className="text-sm text-slate-400 ml-2">
                (Max 30 chars, Title Case, No Dashes)
              </span>
            </h3>
            <EditableField
              value={googleHeadline}
              fieldType="headline"
              platform="google"
              fieldLabel="Headline"
              onSave={newValue => {
                setGoogleHeadline(newValue);
                console.log('Saved Google headline:', newValue);
              }}
              onRequestSuggestions={handleRequestGoogleSuggestions}
              suggestions={googleSuggestions}
              isLoadingSuggestions={isLoadingGoogle}
            />
          </div>

          {/* Meta Primary Text */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-purple-400">
              Meta (Facebook/Instagram) Primary Text
              <span className="text-sm text-slate-400 ml-2">
                (Max 125 chars, Exactly 2 emojis at start & middle)
              </span>
            </h3>
            <EditableField
              value={metaPrimaryText}
              fieldType="primaryText"
              platform="meta"
              fieldLabel="Primary Text"
              onSave={newValue => {
                setMetaPrimaryText(newValue);
                console.log('Saved Meta primary text:', newValue);
              }}
              onRequestSuggestions={handleRequestMetaSuggestions}
              suggestions={metaSuggestions}
              isLoadingSuggestions={isLoadingMeta}
            />
          </div>

          {/* TikTok Text */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-purple-400">
              TikTok Ad Text
              <span className="text-sm text-slate-400 ml-2">
                (Max 100 chars, Min 10 chars)
              </span>
            </h3>
            <EditableField
              value={tiktokText}
              fieldType="text"
              platform="tiktok"
              fieldLabel="Ad Text"
              onSave={newValue => {
                setTiktokText(newValue);
                console.log('Saved TikTok text:', newValue);
              }}
              onRequestSuggestions={handleRequestTiktokSuggestions}
              suggestions={tiktokSuggestions}
              isLoadingSuggestions={isLoadingTiktok}
            />
          </div>
        </div>

        {/* Current Values Display */}
        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 space-y-3">
          <h3 className="text-lg font-semibold text-cyan-400">Current Saved Values</h3>
          <div className="space-y-2 font-mono text-xs">
            <div>
              <span className="text-slate-400">Google Headline:</span>
              <div className="text-green-400 mt-1">{googleHeadline}</div>
            </div>
            <div>
              <span className="text-slate-400">Meta Primary Text:</span>
              <div className="text-green-400 mt-1">{metaPrimaryText}</div>
            </div>
            <div>
              <span className="text-slate-400">TikTok Text:</span>
              <div className="text-green-400 mt-1">{tiktokText}</div>
            </div>
          </div>
        </div>

        {/* Feature Status */}
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 space-y-3">
          <h3 className="text-lg font-semibold text-green-400">✓ Working Features</h3>
          <ul className="space-y-1 text-sm text-green-300">
            <li>✓ Click-to-edit interaction</li>
            <li>✓ Real-time character counting</li>
            <li>✓ Platform-specific validation (Google, Meta, TikTok)</li>
            <li>✓ Color-coded validation badges</li>
            <li>✓ Emoji counting and position validation</li>
            <li>✓ Capitalization validation (Title Case, Sentence Case)</li>
            <li>✓ Auto-expanding textarea</li>
            <li>✓ Save/Discard buttons with state management</li>
            <li>✓ <strong>REAL Gemini AI suggestions!</strong> (2.5 Flash for speed)</li>
            <li>✓ Debounced suggestion requests (500ms delay)</li>
            <li>✓ Suggestion caching (5-minute TTL to save API calls)</li>
            <li>✓ Context-aware suggestions (uses campaign info)</li>
          </ul>
        </div>

        {/* AI Integration Info */}
        <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-6 space-y-3">
          <h3 className="text-lg font-semibold text-cyan-400">🤖 Gemini AI Integration</h3>
          <div className="text-sm text-cyan-300 space-y-2">
            <p><strong>Model:</strong> Gemini 2.5 Flash (fast & cost-effective)</p>
            <p><strong>Caching:</strong> 5-minute TTL to avoid duplicate API calls</p>
            <p><strong>Suggestion Types:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• <strong>Initial:</strong> Click field → 3 alternatives maintaining the message</li>
              <li>• <strong>Real-time:</strong> Type → AI completes/improves your text (debounced 500ms)</li>
            </ul>
            <p><strong>Platform-Aware:</strong> Suggestions follow Google/Meta/TikTok style guides</p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6 space-y-3">
          <h3 className="text-lg font-semibold text-yellow-400">⚠ Not Yet Implemented</h3>
          <ul className="space-y-1 text-sm text-yellow-300">
            <li>⚠ Learning system (needs learningService.ts + IndexedDB)</li>
            <li>⚠ Edit history tracking</li>
            <li>⚠ Integration with AdCopyForm</li>
            <li>⚠ Google Ads preview mockup</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
