# AI Marketing Ads App

## Project Overview
React 19 + TypeScript + Vite web application for generating AI-powered marketing ad copy using Google Gemini API and Supabase database.

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v3.4.19, Framer Motion
- **State**: Zustand
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API (gemini-2.5-flash)
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

## Environment Variables
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GEMINI_API_KEY=your_gemini_key
```
