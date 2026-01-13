# AI Marketing Ads App

## Project Overview
React 19 + TypeScript + Vite web application for generating AI-powered marketing ad copy using Google Gemini API and Supabase database.

## Deployment

### Live URLs
- **Production**: https://marketing-ads.vercel.app/
- **GitHub Repository**: https://github.com/elmandalorian-thx/Marketing-Ads

### Hosting
- **Platform**: Vercel (auto-deploys from `main` branch)
- **Root Directory**: `AI-Marketing-Ads-App` (configured in Vercel settings)

### Supabase Configuration
For OAuth to work in production, configure in Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: `https://marketing-ads.vercel.app`
- **Redirect URLs**: `https://marketing-ads.vercel.app/**`

### Vercel Environment Variables
Set these in Vercel Project Settings → Environment Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY` (for Google Tools)
- `VITE_ANTHROPIC_API_KEY` (for Ad Copy generation)

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v3.4.19, Framer Motion
- **State**: Zustand
- **Database**: Supabase (PostgreSQL)
- **AI - Ad Copy**: Claude API (claude-sonnet-4-20250514)
- **AI - Google Tools**: Google Gemini API (gemini-2.5-flash) - for search grounding
- **Icons**: lucide-react

## Key Features
1. Brand management (create, edit, select)
2. Multi-platform ad copy generation (Meta, Google, TikTok)
3. Google Tools suite (Sitelinks, Keywords, PageSpeed, Schema, GEO, Competitors)
4. Editable fields with personalized AI suggestions
5. Edit history tracking for ML-based learning
6. Auto-save functionality for tool results

## File Structure
```
/components          - Legacy UI components
/src
  /components        - New component architecture
    /layout          - Homepage, Sidebar, AppShell
    /brands          - BrandCard, BrandForm
    /google-tools    - Individual tool components
  /services          - API & database services
  /stores            - Zustand state management (brandStore, uiStore, cacheStore)
  /types             - TypeScript type definitions
  /hooks             - Custom React hooks (useToolResults)
```

## Development Guidelines
1. Keep code simple and minimal
2. Use existing patterns from codebase
3. Prioritize performance (lazy loading, memoization)
4. Maintain type safety (no \`any\` types)
5. Follow existing component structure

## Common Operations
- Ad copy generation with Gemini API
- Supabase CRUD for brands, ad_copies, tool_results, edit_history
- Double-click edit functionality in EditableField
- Personalized suggestions based on edit patterns (min 5 edits)
- Dual-layer caching (in-memory + database)

## Dependencies
```json
{
  "@google/genai": "^1.27.0",
  "@supabase/supabase-js": "^2.89.0",
  "zustand": "^5.0.9",
  "framer-motion": "^12.23.26",
  "lucide-react": "^0.562.0",
  "react": "^19.2.0",
  "tailwindcss": "^3.4.19"
}
```

## Environment Variables (Local Development)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GEMINI_API_KEY=your_gemini_key
VITE_ANTHROPIC_API_KEY=your_anthropic_key
```

## Changelog

### 2026-01-12
- Initial deployment to GitHub and Vercel
- Configured Supabase OAuth redirect URLs for production
- Set Vercel root directory to `AI-Marketing-Ads-App`
- App live at https://marketing-ads.vercel.app/
- Added retry logic with exponential backoff for API 503 errors (3 retries, 1s/2s/4s delays)
- **Switched ad copy generation from Gemini to Claude** (claude-sonnet-4-20250514) for better quality
- Google Tools still use Gemini for search grounding capabilities
- **Ad copy output improvements:**
  - Strict character limit enforcement via post-processing (truncates if over limit)
  - Google Descriptions now use Title Case (first letter of each word capitalized)
  - Labels show actual character count (e.g., "Headlines #1 (28 chars)" instead of "#1")
