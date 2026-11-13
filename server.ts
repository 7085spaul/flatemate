import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { SAMPLE_PROPERTIES, SAMPLE_ROOMMATES } from './src/data/sampleData.ts';
import { runDemoRecommender } from './src/utils/compatibility.ts';
import type { AIRecommendationResponse } from './src/types/housing.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

function hasValidGeminiKey(): boolean {
  const key = process.env.GEMINI_API_KEY?.trim();
  return Boolean(key && key !== 'MY_GEMINI_API_KEY' && key.length > 12);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      geminiConfigured: hasValidGeminiKey(),
      model: 'gemini-4-hydrogen',
    });
  });

  app.post('/api/ai/recommend', async (req, res) => {
    const query = typeof req.body?.query === 'string' ? req.body.query.trim() : '';
    const requestedMode = req.body?.mode === 'demo' ? 'demo' : 'auto';

    if (!query || query.length < 3) {
      res.status(400).json({ error: 'Please describe what kind of flat or flatmate you are looking for.' });
      return;
    }

    if (query.length > 800) {
      res.status(400).json({ error: 'Please keep your description under 800 characters.' });
      return;
    }

    if (requestedMode === 'demo' || !hasValidGeminiKey()) {
      const demoResult = runDemoRecommender(query);
      if (requestedMode !== 'demo' && !hasValidGeminiKey()) {
        demoResult.fallbackReason = 'Gemini API key is not configured on the server — running Demo Mode.';
      }
      res.json(demoResult);
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const datasetContext = {
        properties: SAMPLE_PROPERTIES.map((p) => ({
          id: p.id,
          title: p.title,
          locality: p.locality,
          type: p.accommodationType,
          monthlyRentINR: p.monthlyRent,
          nearestMetro: p.nearestMetro,
          metroDistance: p.metroDistanceText,
          commuteHubs: p.commuteHubs,
          amenities: p.amenities,
          notes: p.houseNotes,
        })),
        roommates: SAMPLE_ROOMMATES.map((r) => ({
          id: r.id,
          name: r.name,
          occupation: r.occupation,
          preferredAreas: r.preferredAreas,
          budgetRangeINR: [r.budgetMin, r.budgetMax],
          sleepSchedule: r.sleepSchedule,
          cleanlinessOutOf5: r.cleanliness,
          workMode: r.workMode,
          diet: r.diet,
          smoking: r.smoking,
          socialVibe: r.socialVibe,
        })),
      };

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `User accommodation request in Bengaluru:\n"${query}"\n\nAvailable Sample Dataset:\n${JSON.stringify(datasetContext)}`,
        config: {
          systemInstruction:
            'You are FlatMate AI, a helpful housing advisor for Bengaluru. Recommend 2 to 3 properties and 1 to 2 roommates strictly from the provided sample dataset IDs. Never invent new properties, prices, or availability. Explain clearly why each recommendation fits the user query (budget, metro/commute, lifestyle). Keep tone warm, concise, and practical.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: '2-sentence personalized overview explaining the matches.',
              },
              budgetNote: {
                type: Type.STRING,
                description: '1 concise tip on how their budget aligns with Bengaluru localities.',
              },
              metroTip: {
                type: Type.STRING,
                description: '1 concise Bengaluru metro or commute insight relevant to their prompt.',
              },
              recommendedFlats: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    matchHighlights: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                },
              },
              recommendedRoommates: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    reason: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      const validFlatIds = new Set(SAMPLE_PROPERTIES.map((p) => p.id));
      const validRoommateIds = new Set(SAMPLE_ROOMMATES.map((r) => r.id));

      const recommendedFlats = Array.isArray(parsed.recommendedFlats)
        ? parsed.recommendedFlats.filter((f: { id?: string }) => f.id && validFlatIds.has(f.id)).slice(0, 3)
        : [];
      const recommendedRoommates = Array.isArray(parsed.recommendedRoommates)
        ? parsed.recommendedRoommates.filter((r: { id?: string }) => r.id && validRoommateIds.has(r.id)).slice(0, 2)
        : [];

      if (recommendedFlats.length === 0) {
        const fallback = runDemoRecommender(query);
        fallback.fallbackReason = 'Switched to Demo Recommender because Gemini returned no matching dataset IDs.';
        res.json(fallback);
        return;
      }

      const payload: AIRecommendationResponse = {
        mode: 'gemini',
        modelUsed: 'gemini-4-hydrogen',
        summary: parsed.summary || 'Here are the closest matches from our Bengaluru sample dataset.',
        budgetNote: parsed.budgetNote || 'Sample rents range from ₹9,500 to ₹22,000/month.',
        metroTip: parsed.metroTip || 'Consider proximity to Purple or Green Line Metro stations.',
        recommendedFlats,
        recommendedRoommates,
      };

      res.json(payload);
    } catch (err) {
      console.error('Gemini API error, falling back to demo mode:', err);
      const demoFallback = runDemoRecommender(query);
      demoFallback.fallbackReason =
        'Gemini API could not be reached right now — showing Demo Mode recommendations from the sample dataset.';
      res.json(demoFallback);
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FlatMate AI server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
