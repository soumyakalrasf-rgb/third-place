# Third Place

## Overview
Third Place is an AI-powered platform that matches compatible people into small groups and generates curated IRL micro-events. Built for serious daters aged 30+ who want to meet people through low-pressure group gatherings.

## Recent Changes
- 2026-02-14: Initial landing page built with hero, how it works, why section, CTA, footer
- 2026-02-14: Multi-step onboarding flow (4 steps) with profile submission to backend
- 2026-02-14: AI matching backend with Claude API (claude-sonnet-4-20250514) and 12 seed profiles
- 2026-02-14: Matching results page showing group members and curated event details
- 2026-02-14: POST /api/match endpoint with Zod validation for request and response
- 2026-02-14: Custom warm color palette (ivory, terracotta, plum, sage green) with Inter + Playfair Display fonts

## Project Architecture
- Frontend: React + Vite + TailwindCSS + shadcn/ui components
- Backend: Express.js with in-memory storage
- AI: Anthropic Claude API (claude-sonnet-4-20250514) for matching
- Routing: wouter
- State/Data: React Query mutations for API calls, controlled local state for multi-step form
- Styling: Warm premium palette with scroll animations (vanilla IntersectionObserver)
- Pages: Landing (/), Onboarding (/onboarding), Matching (/matching?id=X)

## API Endpoints
- POST /api/profiles - Create a new profile (returns profile with generated id)
- GET /api/profiles/:id - Get a profile by ID
- POST /api/match - Match a user with seed profiles via Claude AI (body: {profileId}, returns {group, event})

## Key Files
- server/seedProfiles.ts - 12 diverse SF Bay Area seed profiles
- server/routes.ts - All API routes including AI matching
- client/src/pages/matching.tsx - Match results display page
- client/src/pages/onboarding.tsx - 4-step onboarding form
- client/src/pages/landing.tsx - Landing page

## User Preferences
- Premium, warm, human design aesthetic
- Color palette: warm ivory (#FFFAF5), soft terracotta (#C4704B), deep plum (#4A2040), sage green (#7A8B6F)
- Font: Inter (body), Playfair Display (headings/serif)
- Subtle scroll animations
