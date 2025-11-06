// /services/geminiService.ts
// Complete working code for Gemini 2.5 Flash with key rotation and safe error handling

// 🧩 1️⃣ Your Google AI Studio API keys here
// --- Multi-API key rotation ---
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
  // ...add more keys here
];

let currentKeyIndex = 0;
export function getNextApiKey() {
  const key = GEMINI_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
  return key;
}


// 🧩 2️⃣ Model + Endpoint
const GEMINI_MODEL = "models/gemini-2.5-flash";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/";

/**
 * Generate a short Gemini response with automatic API key rotation.
 * @param prompt User input or question
 * @returns Short paragraph response
 */
export async function generateGeminiResponse(prompt: string): Promise<string> {
  for (let i = 0; i < API_KEYS.length; i++) {
    const key = API_KEYS[i];
    const url = `${GEMINI_API_URL}${GEMINI_MODEL}:generateContent`;

    const body = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                prompt +
                "\n\nGive a short, natural paragraph response (under 60 words). No bullet points or essays.",
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.8,
        topP: 0.9,
        maxOutputTokens: 100,
      },
    };

    try {
      const res = await fetch(`${url}?key=${key}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.warn(`❌ Key ${i + 1} failed with status ${res.status}`);
        if ([429, 403, 500].includes(res.status)) continue;

        const errText = await res.text();
        console.error("Error body:", errText);
        continue;
      }

      let data: any;
      try {
        data = await res.json();
      } catch (e) {
        console.error("❌ Invalid JSON from Gemini:", e);
        continue;
      }

      const output =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "⚠️ No valid text generated.";

      console.log(`✅ Using key ${i + 1} succeeded.`);
      return output;
    } catch (err) {
      console.error(`⚠️ Request failed with key ${i + 1}:`, err);
      continue;
    }
  }

  return "All Gemini API keys exhausted or unavailable.";
}

export async function generateGeminiChallenge() {
  const prompt = `
  You are an AI chef creating a short and fun cooking challenge for the player.
  Respond in **one short paragraph** describing the dish and the twist.
  Keep it creative, Indian-themed, and under 50 words.
  `;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${getNextApiKey()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      }),
    });

    const data = await res.json();
    const output = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Chef’s hat fell off! Try again!";
    return output;
  } catch (error) {
    console.error("Error generating Gemini challenge:", error);
    return "The kitchen spirits are silent... try again!";
  }
}

