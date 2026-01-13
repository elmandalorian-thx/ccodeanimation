import React from 'react';
import { Info } from 'lucide-react';

type Platform = 'meta' | 'google' | 'tiktok';
type FieldType = string;

interface FieldInfo {
  charLimit: number;
  tips: string[];
  example: string;
}

interface FieldInfoTooltipProps {
  platform: Platform;
  fieldType: FieldType;
}

// Comprehensive best practices for each field type
const FIELD_BEST_PRACTICES: Record<Platform, Record<string, FieldInfo>> = {
  google: {
    headline: {
      charLimit: 30,
      tips: [
        'Use Title Case for each word',
        'Include primary keyword near the beginning',
        'Avoid punctuation like dashes or exclamation marks',
        'Make it compelling and actionable'
      ],
      example: 'Get 50% Off Premium Software Today'
    },
    longHeadline: {
      charLimit: 90,
      tips: [
        'Use Title Case for each word',
        'Tell a complete story or value proposition',
        'Include specific benefits or unique selling points',
        'Front-load the most important information'
      ],
      example: 'Transform Your Business With Cloud-Based CRM Software - Free Trial Available'
    },
    shortHeadline: {
      charLimit: 60,
      tips: [
        'Use Title Case for each word',
        'Balance between headline (30) and long headline (90)',
        'Include primary benefit and call-to-action',
        'Test different variations for performance'
      ],
      example: 'Cloud CRM Software - Start Your Free Trial Today'
    },
    description: {
      charLimit: 90,
      tips: [
        'Write in complementary pairs (Desc 1 & 2 work together)',
        'Use sentence case, not all caps',
        'Avoid dashes - use proper punctuation',
        'Focus on benefits, not just features'
      ],
      example: 'Streamline your sales process with AI-powered insights. Get real-time analytics and reports.'
    },
    callout: {
      charLimit: 25,
      tips: [
        'Highlight key benefits or features',
        'Be specific and concrete',
        'Use action-oriented language',
        'Test different value propositions'
      ],
      example: 'Free 30-Day Trial'
    },
    keyword: {
      charLimit: 80,
      tips: [
        'Use broad match for discovery',
        'Include 2-4 word phrases',
        'Mix commercial and informational intent',
        'Research competitor keywords'
      ],
      example: 'cloud crm software'
    }
  },
  meta: {
    primaryText: {
      charLimit: 125,
      tips: [
        'MUST start with an emoji (first character)',
        'MUST include a second emoji in the middle',
        'Keep it concise and impactful',
        'Lead with the value proposition or hook'
      ],
      example: '\ud83d\ude80 Transform your sales process \ud83d\udcca with AI-powered CRM. Get 50% off your first month - limited time only!'
    },
    headline: {
      charLimit: 40,
      tips: [
        'MUST include exactly one emoji',
        'Make it attention-grabbing and clear',
        'Use active voice and action words',
        'Test different emotional appeals'
      ],
      example: 'Boost Sales \ud83d\udcc8 by 300% in 30 Days'
    },
    description: {
      charLimit: 30,
      tips: [
        'Do NOT use emojis in descriptions',
        'Provide a short, supplementary benefit',
        'Use sentence case',
        'Keep it concise and clear'
      ],
      example: 'Free trial. No credit card.'
    }
  },
  tiktok: {
    text: {
      charLimit: 100,
      tips: [
        'Use casual, native TikTok style',
        'Include 1-2 relevant hashtags within the limit',
        'Match platform trends and slang when appropriate',
        'Keep it authentic and engaging'
      ],
      example: 'This CRM changed my business \ud83d\ude2d\ud83d\udc4f Try it free #BusinessHacks #CRMTool'
    }
  }
};

export function FieldInfoTooltip({ platform, fieldType }: FieldInfoTooltipProps) {
  const fieldInfo = FIELD_BEST_PRACTICES[platform]?.[fieldType];

  if (!fieldInfo) {
    return null; // Don't render tooltip if no info available
  }

  return (
    <div className="relative inline-block group ml-2">
      <Info className="w-4 h-4 text-muted-foreground cursor-help hover:text-primary transition-colors" />

      {/* Tooltip */}
      <div className="absolute left-0 top-full mt-2 w-80 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-xl">
          {/* Character Limit */}
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-700">
            <span className="text-xs font-semibold text-slate-400">CHARACTER LIMIT:</span>
            <span className="text-sm font-bold text-primary">{fieldInfo.charLimit}</span>
          </div>

          {/* Tips */}
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-slate-400 mb-2">BEST PRACTICES:</h4>
            <ul className="space-y-1.5">
              {fieldInfo.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Example */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 mb-2">EXAMPLE:</h4>
            <div className="bg-slate-900/50 rounded p-2 border border-slate-700">
              <p className="text-xs text-slate-200 italic">{fieldInfo.example}</p>
            </div>
          </div>

          {/* Tooltip Arrow */}
          <div className="absolute -top-2 left-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-slate-700"></div>
        </div>
      </div>
    </div>
  );
}
