// services/geminiService.ts
// Fully updated Gemini TTS + API key rotation logic
// Works on Cloudflare Pages with Google AI Studio API (no backend)

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

/**
 * Rotate API keys automatically
 */
function getNextApiKey() {
  const key = GEMINI_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
  return key;
}

/**
 * Generate audio via Google AI Studio (Gemini)
 * - Uses Gemini 1.5 Flash TTS
 * - Includes Indian-English accent & speed boost
 */
export async function textToSpeech(text: string) {
  if (!text || text.trim() === "") return;

  let response;
  let apiKey = getNextApiKey();

  for (let attempt = 0; attempt < GEMINI_API_KEYS.length; attempt++) {
    try {
      response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `You are a voice model. Read this text with a natural Indian-English accent and slightly faster speaking speed: "${text}"`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "audio/mp3",
              voice: "en-IN",
              speakingRate: 1.25, // increase speed slightly
            },
          }),
        }
      );

      if (response.ok) break;
      if (response.status === 429) {
        console.warn(`Quota reached for key ${apiKey}, switching...`);
        apiKey = getNextApiKey();
        continue;
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      console.error(`Gemini TTS error (key: ${apiKey})`, error);
      apiKey = getNextApiKey();
    }
  }

  if (!response?.ok) throw new Error("All Gemini API keys failed.");

  const data = await response.json();
  const audioBase64 = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioBase64) throw new Error("No audio returned from Gemini.");

  const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
  audio.play().catch((e) => console.warn("Audio playback failed:", e));
}

/**
 * Example text generation (normal Gemini text response)
 * This still uses the same rotating API keys
 */
export async function generateAIResponse(prompt: string): Promise<string> {
  let response;
  let apiKey = getNextApiKey();

  for (let attempt = 0; attempt < GEMINI_API_KEYS.length; attempt++) {
    try {
      response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          }),
        }
      );

      if (response.ok) break;
      if (response.status === 429) {
        apiKey = getNextApiKey();
        continue;
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      console.error(`Gemini text generation failed (key: ${apiKey})`, error);
      apiKey = getNextApiKey();
    }
  }

  if (!response?.ok) throw new Error("All Gemini API keys failed for text.");

  const result = await response.json();
  return result?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
}
