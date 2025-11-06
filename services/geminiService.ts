// src/services/geminiService.ts

import { Flavor, Challenge, OracleJudgement, SelectedSpice } from "../types";

/* ========== API KEY ROTATION ========== */
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

let currentKeyIndex = 0;
export function getNextApiKey() {
  const key = GEMINI_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
  return key;
}

/* ========== CALL GEMINI API ========== */
async function callGemini(model: string, body: any, apiKey: string): Promise<any> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Gemini error ${resp.status}: ${text}`);
  }

  return resp.json();
}

/* ========== SAFE JSON PARSER ========== */
function safeJsonParse(text: string): any {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch (e) {
    console.warn("Invalid JSON, fallback to text parse:", e);
  }
  return null;
}

/* ========== GENERATE COOKING CHALLENGE ========== */
export async function generateGeminiChallenge(region: string): Promise<Challenge> {
  const apiKey = getNextApiKey();
  const prompt = `Generate a short Indian vegan cooking challenge for region: ${region}.
Keep the description under 50 words.
Return only JSON like this:
{
  "title": "string",
  "description": "string",
  "base": "main ingredient",
  "targetProfile": {
    "Heat": number (0-1000),
    "Earthy": number (0-1000),
    "Sweet": number (0-1000),
    "Tangy": number (0-1000),
    "Aromatic": number (0-10000)
  }
}`;

  const data = await callGemini("gemini-2.0-flash", { contents: [{ parts: [{ text: prompt }] }] }, apiKey);

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  const parsed = safeJsonParse(text);

  return (
    parsed || {
      title: "Mystery Curry",
      description: "A short flavorful curry challenge.",
      base: "Potato",
      targetProfile: { Heat: 50, Earthy: 40, Sweet: 20, Tangy: 30, Aromatic: 60 },
    }
  );
}

/* ========== ORACLE JUDGEMENT ========== */
export async function generateOracleJudgement(
  challenge: Challenge,
  selectedSpices: SelectedSpice[]
): Promise<OracleJudgement> {
  const apiKey = getNextApiKey();

  const prompt = `You are a culinary oracle.
Given a cooking challenge and selected spices, rate how well they match.
Return JSON:
{
  "score": number (0-100),
  "comment": "short single-sentence feedback"
}

Challenge: ${JSON.stringify(challenge)}
Selected Spices: ${JSON.stringify(selectedSpices)}`;

  const data = await callGemini("gemini-2.0-flash", { contents: [{ parts: [{ text: prompt }] }] }, apiKey);

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  const parsed = safeJsonParse(text);

  return (
    parsed || {
      score: 70,
      comment: "A flavorful but slightly unbalanced combination.",
    }
  );
}
