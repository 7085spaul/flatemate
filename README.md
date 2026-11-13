# FlatMate AI – Bengaluru

**Tagline:** Find your flat. Find your flatmate. Feel at home.

FlatMate AI – Bengaluru is a full-stack MVP built with React, Vite, Tailwind CSS, Express, and the `@google/genai` SDK (`gemini-4-hydrogen`) for demonstrating accommodation discovery and explainable roommate matching in Bengaluru.

> **Sample Data Notice:** All property listings, monthly rents, deposits, and roommate profiles in this application are fictional sample data created for demonstration purposes.

## Core Features

1. **Explore Flats (`/flats`)**: Filter sample Bengaluru flats and PGs by monthly budget, neighbourhood (Indiranagar, Koramangala, HSR Layout, Whitefield, BTM Layout, JP Nagar, Bellandur, Malleswaram), accommodation type, and nearby metro station.
2. **Find Flatmates (`/flatmates`)**: Live compatibility scoring across 6 weighted dimensions (Budget Fit, Sleep Schedule, Cleanliness, Work Routine, Food & Habits, and Locality) with a **6-Axis Visual Compatibility Radar** and preference alignment bars.
3. **AI Assistant (`/assistant`)**: Natural-language search powered by Google Gemini (`gemini-4-hydrogen`) through a secure Express endpoint (`POST /api/ai/recommend`), with an automatic, clearly labeled **Demo Mode** fallback when `GEMINI_API_KEY` is unavailable.

## Local Development

```bash
npm install
cp .env.example .env
# Add your GEMINI_API_KEY in .env (optional; Demo Mode works without a key)
npm run dev
```

The server listens on `http://localhost:3000`.

## Production Build & Deployment

1. Build the Vite frontend bundle:
   ```bash
   npm run build
   ```
2. Start the production Express server (serves `dist/` and `/api/*`):
   ```bash
   NODE_ENV=production PORT=3000 npm start
   ```
   *(If deploying on a Node runtime older than Node 22.6 without native TypeScript stripping, run `npx tsx server.ts` as the start command.)*

3. **Environment Variables**:
   - `GEMINI_API_KEY`: Server-side Google Gemini API key (keep secret; never expose via `VITE_*`).
   - `PORT`: Listening port (defaults to `3000`).
