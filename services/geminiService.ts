/* Full Gemini 2.5 Flash + TTS service with multi-key rotation and persistent index.
   Drop this file into /services/geminiService.ts
   Works fully client-side on Cloudflare Pages.
*/

import { Type } from "@google/genai";
import { SelectedSpice, OracleJudgement, Challenge, Flavor } from "../types";

/* ======================== CONFIG ======================== */
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
  // ... add as many as you want (20+ works fine)
];

const STORAGE_KEY = "spice_jadoo_gemini_key_index";
/* ======================================================== */

function loadKeyIndex(): number {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (!v) return 0;
    const n = parseInt(v, 10);
    if (Number.isFinite(n) && n >= 0) return n % GEMINI_API_KEYS.length;
  } catch {}
  return 0;
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

/* --------------------- REST caller --------------------- */
async function callGemini(path: string, body: any, apiKey: string): Promise<Response> {
  const url = `https://generativelanguage.googleapis.com/v1beta/${path}`;
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(body),
  });
}

/* --------------------- Text generation --------------------- */
export async function generateAIResponse(prompt: string): Promise<string> {
  if (!prompt) return "";
  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const apiKey = getCurrentKey();
    try {
      const body = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
      const resp = await callGemini("models/gemini-2.5-flash:generateContent", body, apiKey);

      if (resp.ok) {
        const json = await resp.json();
        const txt =
          json?.candidates?.[0]?.content?.parts?.[0]?.text ??
          json?.candidates?.[0]?.content?.parts?.[0]?.markdown ??
          "";
        return String(txt);
      }

      if (resp.status === 429) rotateKeyPersist();
      else rotateKeyPersist();
    } catch {
      rotateKeyPersist();
    }
  }
  throw new Error("All Gemini API keys failed for text generation.");
}

/* --------------------- Oracle judgement --------------------- */
export const getJudgementFromOracle = async (
  challenge: Challenge,
  spices: SelectedSpice[]
): Promise<OracleJudgement> => {
  const spiceList = spices.map((s) => `- ${s.name}: ${s.quantity} part(s)`).join("\n");
  const prompt = `A new vegan culinary creation arrives. Concept: '${challenge.title} - ${challenge.description}'. Base: '${challenge.base}'. Spices:\n${spiceList}\n\nProvide your divine judgment as JSON (dishName, description, score, feedback).`;

  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const apiKey = getCurrentKey();
    try {
      const body = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
      const resp = await callGemini("models/gemini-2.5-flash:generateContent", body, apiKey);

      if (resp.ok) {
        const json = await resp.json();
        const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        try {
          const parsed = JSON.parse(raw.trim());

          // 🔊 Speak the result
          try {
            const speech = `${parsed.description}. ${parsed.feedback}`;
            await textToSpeech(speech);
          } catch (e) {
            console.warn("TTS failed:", e);
          }

          return parsed as OracleJudgement;
        } catch {}
      }
      if (resp.status === 429) rotateKeyPersist();
      else rotateKeyPersist();
    } catch {
      rotateKeyPersist();
    }
  }

  return {
    dishName: "The Muddled Concoction",
    description:
      "The ether was disturbed, and the Oracle could not get a clear vision of your dish.",
    score: 2.1,
    feedback: "An error occurred while consulting the Oracle. Please try again later.",
  };
};

/* --------------------- Challenge generator --------------------- */
export const generateChallenge = async (region: string): Promise<Challenge> => {
  const prompt = `Generate a new, unique, 100% VEGAN cooking challenge from ${region} India. Provide a JSON object with: title, description, base, targetProfile (heat, earthy, sweet, tangy, aromatic).`;

  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const apiKey = getCurrentKey();
    try {
      const body = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
      const resp = await callGemini("models/gemini-2.5-flash:generateContent", body, apiKey);

      if (resp.ok) {
        const json = await resp.json();
        const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        try {
          const parsed = JSON.parse(raw.trim());

          // 🔊 Speak the new challenge
          try {
            const speech = `Your challenge: ${parsed.title}. ${parsed.description}`;
            await textToSpeech(speech);
          } catch (e) {
            console.warn("TTS failed:", e);
          }

          return { ...parsed, id: Date.now(), region } as Challenge;
        } catch {}
      }
      if (resp.status === 429) rotateKeyPersist();
      else rotateKeyPersist();
    } catch {
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

/* --------------------- Gemini-native TTS --------------------- */
export async function textToSpeech(text: string) {
  if (!text?.trim()) return;
  console.log("🎤 TTS requested:", text);

  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const apiKey = getCurrentKey();
    try {
      const body = {
        contents: [{ role: "user", parts: [{ text }] }],
        generationConfig: {
          responseMimeType: "audio/mp3",
          voice: "en-IN",       // Indian English accent
          speakingRate: 1.25,
          pitch: -1.0,
        },
      };

      const resp = await callGemini(
        "models/gemini-2.5-flash-tts:generateContent",
        body,
        apiKey
      );

      if (resp.ok) {
        const json = await resp.json();
        const audioBase64 =
          json?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ??
          json?.candidates?.[0]?.content?.parts?.[0]?.audio ??
          null;

        if (audioBase64) {
          const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
          await audio.play().catch((e) => console.warn("Audio play error:", e));
          console.log("✅ Played TTS audio");
          return;
        } else {
          console.warn("No audio returned from Gemini TTS");
        }
      } else {
        if (resp.status === 429) rotateKeyPersist();
        else rotateKeyPersist();
      }
    } catch (err) {
      console.error("TTS exception:", err);
      rotateKeyPersist();
    }
  }

  // Browser fallback
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-IN";
    u.rate = 1.25;
    u.pitch = 0.9;
    const voices = speechSynthesis.getVoices();
    u.voice = voices.find((v) => v.lang.toLowerCase().includes("en-in")) || voices[0] || null;
    speechSynthesis.speak(u);
  } catch (err) {
    console.warn("Browser TTS fallback failed:", err);
  }
}
