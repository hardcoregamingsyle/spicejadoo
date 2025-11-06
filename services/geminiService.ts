// services/geminiService.ts
/* Full, self-contained Gemini text + TTS service with multi-key rotation and persistence.
   Works client-side (Cloudflare Pages). Replace the GEMINI_API_KEYS array with your keys.
*/

import { Type } from "@google/genai";
import {
  SelectedSpice,
  OracleJudgement,
  Challenge,
  Flavor,
} from "../types";

/* ======================== CONFIG: Put your keys here ======================== */
const GEMINI_API_KEYS = [
  /* Replace these placeholders with your real keys (as many as you want) */ 
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
/* ========================================================================== */

/* Safety check */
if (!GEMINI_API_KEYS || GEMINI_API_KEYS.length === 0) {
  console.warn(
    "No Gemini API keys found in services/geminiService.ts. Add keys to GEMINI_API_KEYS."
  );
}

/* ========== Persistent key index (stored in localStorage) ========== */
const STORAGE_KEY = "spice_jadoo_gemini_key_index";

function loadKeyIndex(): number {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (!v) return 0;
    const n = parseInt(v, 10);
    if (Number.isFinite(n) && n >= 0) return n % GEMINI_API_KEYS.length;
    return 0;
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

/* ====================== Helper: call Gemini REST ====================== */
/**
 * Generic call to Gemini REST generateContent endpoint.
 * - pathSuffix: model and method e.g. "models/gemini-1.5-flash-latest:generateContent"
 * - body: JSON body for the API call
 * - apiKey: x-goog-api-key header to use
 */
async function callGemini(
  pathSuffix: string,
  body: any,
  apiKey: string
): Promise<Response> {
  const url = `https://generativelanguage.googleapis.com/v1beta/${pathSuffix}`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });
}

/* ====================== Schemas & prompts ====================== */
const ORACLE_SYSTEM_INSTRUCTION = `You are 'The Oracle of Flavors,' an ancient, wise, and poetic connoisseur of Indian cuisine. You speak with grandeur and authority. Your purpose is to judge CULINARY CREATIONS submitted to you, which are ALWAYS 100% VEGAN. Always respond with a JSON object that matches the provided schema.`;

const judgeDishSchema = {
  type: Type.OBJECT,
  properties: {
    dishName: { type: Type.STRING, description: "Name for the dish." },
    description: { type: Type.STRING, description: "Poetic description." },
    score: { type: Type.NUMBER, description: "Score out of 10." },
    feedback: { type: Type.STRING, description: "Constructive feedback." },
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

/* ====================== Text generation helper ====================== */
/**
 * Generate text using Gemini text model (returns string).
 * Rotates keys automatically on quota/429 errors.
 */
export async function generateAIResponse(prompt: string): Promise<string> {
  if (!prompt) return "";

  // We'll attempt each key until success or all fail
  for (let attempt = 0; attempt < Math.max(1, GEMINI_API_KEYS.length); attempt++) {
    const apiKey = getCurrentKey();
    try {
      const body = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      };

      // model endpoint (text)
      const resp = await callGemini(
        "models/gemini-1.5-flash-latest:generateContent",
        body,
        apiKey
      );

      if (resp.ok) {
        const json = await resp.json();
        const text =
          json?.candidates?.[0]?.content?.parts?.[0]?.text ??
          json?.candidates?.[0]?.content?.parts?.[0]?.markdown ??
          "";
        return String(text);
      }

      // Handle rate limit -> rotate and retry
      if (resp.status === 429) {
        console.warn("Gemini text: key hit limit (429), rotating key");
        rotateKeyPersist();
        continue;
      }

      // Other non-ok -> try next key
      const errText = await resp.text().catch(() => "");
      console.error("Gemini text error:", resp.status, errText);
      rotateKeyPersist();
    } catch (err) {
      console.error("Gemini text exception:", err);
      rotateKeyPersist();
    }
  }

  throw new Error("All Gemini API keys failed for text generation.");
}

/* ====================== Oracle: getJudgementFromOracle ====================== */
export const getJudgementFromOracle = async (
  challenge: Challenge,
  spices: SelectedSpice[]
): Promise<OracleJudgement> => {
  const spiceList = spices.map((s) => `- ${s.name}: ${s.quantity} part(s)`).join("\n");
  const prompt = `A new vegan culinary creation arrives. Concept: '${challenge.title} - ${challenge.description}'. Base: '${challenge.base}'. Spices:\n${spiceList}\n\nProvide your divine judgment as JSON (dishName, description, score, feedback).`;

  // Try rotating keys until success
  for (let attempt = 0; attempt < Math.max(1, GEMINI_API_KEYS.length); attempt++) {
    const apiKey = getCurrentKey();
    try {
      const body = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        // We request JSON but Gemini may not enforce schema; using responseMimeType is not standard in REST,
        // so we rely on model to return JSON-like text. (SDK-based schema enforcement isn't used here.)
      };

      const resp = await callGemini(
        "models/gemini-1.5-flash-latest:generateContent",
        body,
        apiKey
      );

      if (resp.ok) {
        const json = await resp.json();
        const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        // Try to parse JSON from rawText
        try {
          const parsed = JSON.parse(rawText.trim());
          return parsed as OracleJudgement;
        } catch (parseErr) {
          // If parsing fails, attempt to extract JSON substring
          const maybeJson = rawText.substring(rawText.indexOf("{"), rawText.lastIndexOf("}") + 1);
          try {
            const parsed2 = JSON.parse(maybeJson);
            return parsed2 as OracleJudgement;
          } catch {
            console.warn("Oracle: could not parse JSON from model output, returning fallback");
            break; // go to fallback below
          }
        }
      }

      if (resp.status === 429) {
        console.warn("Oracle: key hit limit (429), rotating");
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

  // Fallback judgement
  return {
    dishName: "The Muddled Concoction",
    description:
      "The ether was disturbed, and the Oracle could not get a clear vision of your dish.",
    score: 2.1,
    feedback:
      "An error occurred while consulting the Oracle. Please try again later.",
  };
};

/* ====================== Challenge generator ====================== */
export const generateChallenge = async (region: string): Promise<Challenge> => {
  const prompt = `Generate a new, unique, 100% VEGAN cooking challenge from ${region} India. Provide a JSON object with: title, description, base, targetProfile (heat, earthy, sweet, tangy, aromatic).`;

  for (let attempt = 0; attempt < Math.max(1, GEMINI_API_KEYS.length); attempt++) {
    const apiKey = getCurrentKey();
    try {
      const body = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      };

      const resp = await callGemini(
        "models/gemini-1.5-flash-latest:generateContent",
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
          try {
            const parsed2 = JSON.parse(maybeJson);
            return { ...parsed2, id: Date.now(), region } as Challenge;
          } catch {
            console.warn("Challenge: parsing failed, trying next key");
            rotateKeyPersist();
            continue;
          }
        }
      }

      if (resp.status === 429) {
        rotateKeyPersist();
        continue;
      }

      const errText = await resp.text().catch(() => "");
      console.error("Challenge generation error:", resp.status, errText);
      rotateKeyPersist();
    } catch (err) {
      console.error("Challenge exception:", err);
      rotateKeyPersist();
    }
  }

  // fallback
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

/* ====================== Gemini-native TTS ====================== */
/**
 * Use Gemini model that can return audio. We call the same generateContent endpoint
 * but request audio by setting responseMimeType -> audio/mp3 via generationConfig.
 *
 * Note: Gemini REST output shape for audio may vary; we attempt the common structures:
 * data.candidates[0].content.parts[0].inlineData.data (base64)
 */
export async function textToSpeech(text: string) {
  if (!text || text.trim() === "") return;

  // Try all keys
  for (let attempt = 0; attempt < Math.max(1, GEMINI_API_KEYS.length); attempt++) {
    const apiKey = getCurrentKey();
    try {
      const body = {
        contents: [{ role: "user", parts: [{ text }] }],
        generationConfig: {
          responseMimeType: "audio/mp3",
          // voice hint (gemini may or may not respect)
          voice: "en-IN",
          speakingRate: 1.25,
        },
      };

      // Use model endpoint that supports audio generation
      const resp = await callGemini(
        "models/gemini-1.5-flash-latest:generateContent",
        body,
        apiKey
      );

      if (resp.ok) {
        const json = await resp.json();
        // Common path: candidates[0].content.parts[0].inlineData.data
        const audioBase64 =
          json?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ??
          json?.candidates?.[0]?.content?.parts?.[0]?.audio ??
          null;

        if (!audioBase64) {
          // Not returned as expected — try alternate places
          console.warn("TTS: no base64 audio found in Gemini response; falling back to browser TTS");
          break;
        }

        // Play base64 audio
        const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
        await audio.play().catch((e) => {
          console.warn("Audio.play() error:", e);
        });
        return;
      }

      if (resp.status === 429) {
        console.warn("TTS: key hit limit (429) — rotating");
        rotateKeyPersist();
        continue;
      }

      const errText = await resp.text().catch(() => "");
      console.error("TTS error:", resp.status, errText);
      rotateKeyPersist();
    } catch (err) {
      console.error("TTS exception:", err);
      rotateKeyPersist();
    }
  }

  // Final fallback: browser speech synthesis
  try {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-IN";
    utter.rate = 1.25;
    utter.pitch = 0.9;
    // Prefer en-IN voice if available
    const voices = speechSynthesis.getVoices();
    utter.voice =
      voices.find((v) => v.lang.toLowerCase().includes("en-in")) || voices[0] || null;
    speechSynthesis.speak(utter);
  } catch (err) {
    console.warn("Browser TTS fallback failed:", err);
  }
}
