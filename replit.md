# Third Place

## Overview
Third Place is an AI-powered platform that matches compatible people into small groups and generates curated IRL micro-events. Built for serious daters aged 30+ who want to meet people through low-pressure group gatherings.

## Recent Changes
- 2026-02-14: Initial landing page built with hero, how it works, why section, CTA, footer
- 2026-02-14: Multi-step onboarding flow (4 steps) with profile submission to backend
- 2026-02-14: Matching placeholder page at /matching
- 2026-02-14: POST /api/profiles endpoint with Zod validation
- 2026-02-14: Custom warm color palette (ivory, terracotta, plum, sage green) with Inter + Playfair Display fonts

## Project Architecture
- Frontend: React + Vite + TailwindCSS + shadcn/ui components
- Backend: Express.js with in-memory storage
- Routing: wouter
- State/Data: React Query for mutations, controlled local state for multi-step form
- Styling: Warm premium palette with scroll animations (vanilla IntersectionObserver)
- Pages: Landing (/), Onboarding (/onboarding), Matching (/matching)

## API Endpoints
- POST /api/profiles - Create a new profile (returns profile with generated id)
- GET /api/profiles/:id - Get a profile by ID

## User Preferences
- Premium, warm, human design aesthetic
- Color palette: warm ivory (#FFFAF5), soft terracotta (#C4704B), deep plum (#4A2040), sage green (#7A8B6F)
- Font: Inter (body), Playfair Display (headings/serif)
- Subtle scroll animations
