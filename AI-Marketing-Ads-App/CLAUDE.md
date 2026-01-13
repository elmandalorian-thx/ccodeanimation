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
4. **GEO Intelligence Suite** - Generative Engine Optimization analysis with:
   - 6-dimension scoring (Content Depth, Entity Coverage, Q&A, Semantic Richness, Citation Potential)
   - AI Platform visibility tracking (Google SGE, ChatGPT, Perplexity, Bing Copilot, Claude)
   - Entity mapping, content gap analysis, and prioritized action items
   - File upload with guidance for deep analysis
5. **SEO & Schema Intelligence Suite** - Comprehensive SEO toolkit with:
   - Multi-competitor comparison dashboard (up to 5 competitors)
   - Schema markup auditor (validates existing JSON-LD)
   - Schema generator (8 types: LocalBusiness, Product, Organization, Article, FAQPage, Service, MedicalBusiness, Event)
   - Keyword gap and content gap analysis
6. Editable fields with personalized AI suggestions
7. Edit history tracking for ML-based learning
8. Auto-save functionality for tool results

## File Structure
```
/components          - Legacy UI components
/src
  /components        - New component architecture
    /layout          - Homepage, Sidebar, AppShell
    /brands          - BrandCard, BrandForm
    /google-tools    - Individual tool components
    /geo-suite       - GEO Intelligence module (GeoSuite, GeoDashboard, GeoAnalyzer, etc.)
    /seo-suite       - SEO Intelligence module (SeoSuite, CompetitorDashboard, SchemaGenerator, etc.)
    /ui              - Shared UI components (ScoreGauge, ActionItemCard)
  /services          - API & database services
  /stores            - Zustand state management (brandStore, uiStore, cacheStore)
  /types             - TypeScript type definitions (including geo.ts, seo.ts)
  /hooks             - Custom React hooks (useToolResults)
/supabase
  /migrations        - Database migrations (004_geo_seo_tables.sql)
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

### 2026-01-13
- **GEO Intelligence Suite (New Module)**
  - Full GEO analysis with 6-dimension scoring system
  - AI platform visibility tracking for 5 major platforms
  - Entity coverage analysis with type classification
  - Content gap identification with competitor insights
  - Prioritized action items with impact/effort ratings
  - File upload support with guided instructions
  - Dashboard with ScoreGauge visualizations

- **SEO & Schema Intelligence Suite (New Module)**
  - Multi-competitor analysis dashboard (up to 5 competitors)
  - Keyword gap and content gap analysis
  - Technical SEO comparison
  - Schema markup auditor with validation
  - Schema generator supporting 8 types:
    - LocalBusiness, Product, Organization, Article
    - FAQPage, Service, MedicalBusiness, Event
  - Live JSON-LD preview with copy-to-clipboard
  - File upload with step-by-step export guides

- **UI Enhancements**
  - Load Recent Ad Copy section redesigned with neon/gradient styling
  - Cyan glow labels with `drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]`
  - Purple-to-pink gradient buttons with hover scale effects
  - Active state uses cyan-to-purple gradient

- **Shared Components**
  - `ScoreGauge` - Animated circular score display with auto-color coding
  - `ActionItemCard` - Priority-based action items with status tracking

- **Database**
  - Migration: `004_geo_seo_tables.sql`
  - Tables: `geo_analyses`, `competitor_analyses`, `schema_audits`
  - Full RLS policies for user data isolation

- **Navigation**
  - Sidebar updated with GEO Intelligence and SEO Intelligence sections
  - PRO badges with gradient styling for premium modules
  - New icons: Globe, LayoutDashboard, FileCode, Wand2

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
- **UI improvements:**
  - Multi-column responsive grid layout for results (1-4 columns based on screen width)
  - Neon orange character count labels for better visibility
  - Load Ads feature: Shows latest 5 saved ads as quick-load buttons below Generate
  - Save vs Save as New: When editing a loaded ad, shows "Save" (update) and "Save as New" buttons
  - Sidebar active state now properly highlights the current page
- **Brand database enhancements:**
  - Added `social_media_handle` (TEXT) field for brand social handles
  - Added `practitioner_names` (TEXT[]) field for clinic owners/practitioners
  - Migration: `supabase/migrations/003_brand_social_practitioner.sql`
