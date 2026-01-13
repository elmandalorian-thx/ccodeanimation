# AI Marketing Ads App - Claude Instructions

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v3.4.19, Framer Motion
- **State**: Zustand
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API (gemini-2.5-flash)
- **Icons**: lucide-react

## Key Dependencies
- @google/genai ^1.27.0
- @supabase/supabase-js ^2.89.0
- zustand ^5.0.9
- framer-motion ^12.23.26
- lucide-react ^0.562.0

## Development Focus
1. Keep code simple and minimal
2. Use existing patterns from codebase
3. Prioritize performance (lazy loading, memoization)
4. Maintain type safety (no `any` types)
5. Follow existing component structure

## Common Tasks
- Ad copy generation with Gemini API
- Supabase CRUD operations for brands, ad copies, tool results
- EditableField components with double-click edit
- Google Tools (Sitelinks, Keywords, PageSpeed, etc.)
- Personalized AI suggestions based on edit history

## File Structure
- `/components` - Reusable UI components
- `/src/components` - New component architecture
- `/src/services` - API & database services
- `/src/stores` - Zustand state management
- `/src/types` - TypeScript type definitions
- `/src/hooks` - Custom React hooks
