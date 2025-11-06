/* =====================================================================
   Gemini 2.5 Flash (Google AI Studio) Integration
   - Multi-API-key rotation
   - Short, concise responses
   - No Cloud TTS
   ===================================================================== */

import { Type } from "@google/genai";
import {
  SelectedSpice,
  OracleJudgement,
  Challenge,
  Flavor,
} from "../types";

/* ======================== CONFIG: Add your keys ======================== */
const GEMINI_API_KEYS = [
  "AIzaSyDX3UPwaM11izKZyevMMzggJ6l0ug1MhLo",
  "AIzaSyBoz8WhcxsU-i239Oz3Syx0MshAhuTTNfI",
  "AIzaSyBHbPU7FYxN_4i-3MGZ7cCQgIAPPRzJqq4",
  "AIzaSyDrrM9MTkFjs7BChVkU4SxyZnf1Xu5Xhhs",
  "AIzaSyANGG0wzP0ITzPhqsxrdLl_lUMnYYipp1c",
  "AIzaSyD3TipoUWjPPoPPYBMDtqI2u3gpkL4rjAY",
  "AIzaSyB1hONrY0VZGR7GnqiObwV5o2Sbj5KEABc",
  "AIzaSyBwzVuPWWQnFu8YHdywXdhRFNSzwHne3FU",
  "AIzaSyBdCYps0Q2RdhQNC3uZ0By_OhmG6n-ojAI",
  "AIzaSyAi9t0GQT3xG3BGeea0dcdPc5WhvV5u1HY",
  "AIzaSyA_3Hm5RNM18wwGOq0yYNIxzl4gt_Xjbaw",
  "AIzaSyAu7b7qTB8UK_s6zV4DeE2bbYr0ACxyHbs",
  "AIzaSyBabAY1FFEWcNMs0p4KE_lQb4jo1ttq2CM",
  "AIzaSyCS6BelDTp-2z5ijR0ty9YAPggMR5ZTkaY",
];
/* ====================================================================== */

if (!GEMINI_API_KEYS || GEMINI_API_KEYS.length === 0) {
  console.warn("⚠️ No Gemini API keys found in geminiService.ts!");
}

/* ==================== Persistent key index ==================== */
const STORAGE_KEY = "spice_jadoo_gemini_key_index";

function loadKeyIndex(): number {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (!v) return 0;
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n >= 0 ? n % GEMINI_API_KEYS.length : 0;
  } catch {
    return 0;
  }
}

function saveKeyIndex(i: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(i % GEMINI_API_KEYS.length));
  } catch {}
}

let currentKeyIndex = loadKeyIndex();

function getCurrentKey(): string {
  if (GEMINI_API_KEYS.length === 0) return "";
  return GEMINI_API_KEYS[currentKeyIndex % GEMINI_API_KEYS.length];
}

function rotateKeyPersist() {
  if (GEMINI_API_KEYS.length === 0) return;
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
  saveKeyIndex(currentKeyIndex);
  console.warn(`🔁 Switched to Gemini API key #${currentKeyIndex + 1}`);
}

/* ===================== Helper: call Gemini REST ===================== */
async function callGemini(
  pathSuffix: string,
  body: any,
  apiKey: string
): Promise<Response> {
  const url = `https://generativelanguage.googleapis.com/v1/${pathSuffix}`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });
}

/* ===================== Oracle / Challenge Schemas ===================== */
const ORACLE_SYSTEM_INSTRUCTION = `You are 'The Oracle of Flavors,' an ancient, poetic connoisseur of Indian cuisine. Respond concisely, with grandeur. Always 100% VEGAN.`;

const judgeDishSchema = {
  type: Type.OBJECT,
  properties: {
    dishName: { type: Type.STRING },
    description: { type: Type.STRING },
    score: { type: Type.NUMBER },
    feedback: { type: Type.STRING },
  },
  required: ["dishName", "description", "score", "feedback"],
};

const generateChallengeSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    base: { type: Type.STRING },
    targetProfile: {
      type: Type.OBJECT,
      properties: {
        [Flavor.HEAT]: { type: Type.INTEGER },
        [Flavor.EARTHY]: { type: Type.INTEGER },
        [Flavor.SWEET]: { type: Type.INTEGER },
        [Flavor.TANGY]: { type: Type.INTEGER },
        [Flavor.AROMATIC]: { type: Type.INTEGER },
      },
      required: Object.values(Flavor),
    },
  },
  required: ["title", "description", "base", "targetProfile"],
};

/* ===================== Core Gemini text generator ===================== */
export async function generateAIResponse(prompt: string): Promise<string> {
  if (!prompt) return "";

  const finalPrompt = `${prompt}\n\nPlease respond briefly — one concise paragraph (under 60 words).`;

  for (let attempt = 0; attempt < GEMINI_API_KEYS.length; attempt++) {
    const apiKey = getCurrentKey();
    try {
      const body = {
        contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
        generationConfig: {
          temperature: 0.9,
          topP: 0.9,
          maxOutputTokens: 100,
        },
      };

      const resp = await callGemini(
        "models/gemini-2.5-flash:generateContent",
        body,
        apiKey
      );

      if (resp.ok) {
        const json = await resp.json();
        const text =
          json?.candidates?.[0]?.content?.parts?.[0]?.text ??
          json?.candidates?.[0]?.content?.parts?.[0]?.markdown ??
          "";
        return String(text).trim();
      }

      if (resp.status === 429) {
        console.warn("Gemini: rate limit hit — rotating key");
        rotateKeyPersist();
        continue;
      }

      const errText = await resp.text().catch(() => "");
      console.error("Gemini text error:", resp.status, errText);
      rotateKeyPersist();
    } catch (err) {
      console.error("Gemini exception:", err);
      rotateKeyPersist();
    }
  }

  throw new Error("All Gemini API keys failed for text generation.");
}

/* ===================== Oracle Judgement ===================== */
export const getJudgementFromOracle = async (
  challenge: Challenge,
  spices: SelectedSpice[]
): Promise<OracleJudgement> => {
  const spiceList = spices.map((s) => `- ${s.name}: ${s.quantity} part(s)`).join("\n");
  const prompt = `A vegan culinary creation arrives. Concept: '${challenge.title} - ${challenge.description}'. Base: '${challenge.base}'. Spices:\n${spiceList}\n\nProvide divine judgment as JSON (dishName, description, score, feedback). Keep it short.`;

  for (let attempt = 0; attempt < GEMINI_API_KEYS.length; attempt++) {
    const apiKey = getCurrentKey();
    try {
      const body = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 150 },
      };

      const resp = await callGemini(
        "models/gemini-2.5-flash:generateContent",
        body,
        apiKey
      );

      if (resp.ok) {
        const json = await resp.json();
        const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        try {
          return JSON.parse(rawText.trim()) as OracleJudgement;
        } catch {
          const maybeJson = rawText.substring(rawText.indexOf("{"), rawText.lastIndexOf("}") + 1);
          return JSON.parse(maybeJson) as OracleJudgement;
        }
      }

      if (resp.status === 429) {
        rotateKeyPersist();
        continue;
      }

      const errText = await resp.text().catch(() => "");
      console.error("Oracle text error:", resp.status, errText);
      rotateKeyPersist();
    } catch (err) {
      console.error("Oracle exception:", err);
      rotateKeyPersist();
    }
  }

  return {
    dishName: "The Muddled Concoction",
    description: "Fallback: Oracle could not interpret your creation.",
    score: 2.1,
    feedback: "An error occurred. Please try again later.",
  };
};

/* ===================== Challenge Generator ===================== */
export const generateChallenge = async (region: string): Promise<Challenge> => {
  const prompt = `Generate a new 100% VEGAN cooking challenge from ${region} India. Reply as JSON: title, description, base, and targetProfile (heat, earthy, sweet, tangy, aromatic). Keep description short.`;

  for (let attempt = 0; attempt < GEMINI_API_KEYS.length; attempt++) {
    const apiKey = getCurrentKey();
    try {
      const body = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 150 },
      };

      const resp = await callGemini(
        "models/gemini-2.5-flash:generateContent",
        body,
        apiKey
      );

      if (resp.ok) {
        const json = await resp.json();
        const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        try {
          const parsed = JSON.parse(rawText.trim());
          return { ...parsed, id: Date.now(), region } as Challenge;
        } catch {
          const maybeJson = rawText.substring(rawText.indexOf("{"), rawText.lastIndexOf("}") + 1);
          const parsed2 = JSON.parse(maybeJson);
          return { ...parsed2, id: Date.now(), region } as Challenge;
        }
      }

      if (resp.status === 429) {
        rotateKeyPersist();
        continue;
      }

      const errText = await resp.text().catch(() => "");
      console.error("Challenge error:", resp.status, errText);
      rotateKeyPersist();
    } catch (err) {
      console.error("Challenge exception:", err);
      rotateKeyPersist();
    }
  }

  return {
    id: Date.now(),
    region,
    title: "A Simple Lentil Dahl",
    description: "Fallback: create a soothing, earthy dahl with warm spices.",
    base: "lentils and water",
    targetProfile: {
      [Flavor.HEAT]: 15,
      [Flavor.EARTHY]: 60,
      [Flavor.SWEET]: 10,
      [Flavor.TANGY]: 5,
      [Flavor.AROMATIC]: 40,
    },
  };
};
