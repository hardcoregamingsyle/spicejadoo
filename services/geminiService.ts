// services/geminiService.ts
// --- Google Gemini + Cloud TTS Integration with Multi-Key Rotation and Memory ---

import { GoogleGenAI, Type } from "@google/genai";
import { SelectedSpice, OracleJudgement, Challenge, Flavor } from "../types";

// 🧠 Store unlimited keys here
const API_KEYS = [
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
  // ... add as many as you like
];

// Retrieve last used key index from localStorage
let currentKeyIndex =
  parseInt(localStorage.getItem("currentKeyIndex") || "0", 10) %
  API_KEYS.length;

// Initialize Gemini client
let ai = new GoogleGenAI({ apiKey: API_KEYS[currentKeyIndex] });

// Rotate key if one hits rate limit
function rotateKey() {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  localStorage.setItem("currentKeyIndex", currentKeyIndex.toString());
  console.warn(`🔁 Switched to API key #${currentKeyIndex + 1}`);
  ai = new GoogleGenAI({ apiKey: API_KEYS[currentKeyIndex] });
}

// --- Cloud TTS (uses same Google API key) ---
// --- Gemini Native TTS (uses same GoogleGenAI keys) ---
async function speakText(text: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: currentApiKey() });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro-preview-tts",
      contents: text,
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "en-IN-Neural2-C", // Indian accent; try others like en-IN-Neural2-D
            },
          },
          speakingRate: 1.25, // faster
          pitch: -0.5,
        },
      },
    });

    // extract base64 audio data
    const audioData =
      response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) throw new Error("No audio data in Gemini response");

    // convert base64 → blob → play
    const byteString = atob(audioData);
    const buffer = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      buffer[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([buffer], { type: "audio/mp3" });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
  } catch (error) {
    console.warn("🎙 Gemini TTS failed, using fallback:", error);
    // fallback browser TTS
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-IN";
    utter.rate = 1.25;
    utter.pitch = 0.9;
    speechSynthesis.speak(utter);
  }
}

    const data = await ttsResponse.json();
    if (data.error) throw new Error(data.error.message);
    if (!data.audioContent) throw new Error("TTS returned no audio");

    // Decode and play MP3
    const audioBytes = atob(data.audioContent);
    const buffer = new Uint8Array(audioBytes.length);
    for (let i = 0; i < audioBytes.length; i++) buffer[i] = audioBytes.charCodeAt(i);
    const blob = new Blob([buffer], { type: "audio/mp3" });
    const url = URL.createObjectURL(blob);

    const audio = new Audio(url);
    audio.play();
    catch (error) {
    console.warn("🎙 Cloud TTS failed, using fallback voice:", error);
    // fallback to browser voice
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.25;
      utter.pitch = 0.9;
      utter.lang = "en-IN";
      speechSynthesis.speak(utter);
    } catch (err) {
      console.error("TTS Fallback failed:", err);
    }
  }
}

// --- Core Oracle Logic ---

const ORACLE_SYSTEM_INSTRUCTION =
  "You are 'The Oracle of Flavors,' an ancient, wise, and poetic connoisseur of Indian cuisine. You speak with grandeur and authority. Your purpose is to judge CULINARY CREATIONS submitted to you, which are ALWAYS 100% VEGAN. Always respond with a JSON object that matches the provided schema.";

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

// --- Oracle’s Judgement ---
export const getJudgementFromOracle = async (
  challenge: Challenge,
  spices: SelectedSpice[]
): Promise<OracleJudgement> => {
  const spiceList = spices.map((s) => `- ${s.name}: ${s.quantity} part(s)`).join("\n");
  const prompt = `A new vegan culinary creation has been brought before you. The dish is based on '${challenge.title} - ${challenge.description}'. The base ingredients are: '${challenge.base}'. The creator has used:\n${spiceList}\n\nGive your divine judgment.`;

  for (let i = 0; i < API_KEYS.length; i++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: ORACLE_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: judgeDishSchema,
        },
      });

      const result = JSON.parse(response.text.trim());
      // 🎙 Speak Oracle’s poetic output
      speakText(`${result.description}. ${result.feedback}`);
      return result;
    } catch (error: any) {
      if (
        error.message?.includes("quota") ||
        error.message?.includes("429") ||
        error.message?.includes("limit")
      ) {
        rotateKey();
        continue;
      }
      console.error("Error getting judgement from Oracle:", error);
    }
  }

  // fallback response
  return {
    dishName: "The Muddled Concoction",
    description:
      "The ether was disturbed, and the Oracle could not get a clear vision of your dish.",
    score: 2.1,
    feedback:
      "An error occurred while consulting the Oracle. Perhaps the cosmic energies are not aligned.",
  };
};

// --- Generate Culinary Challenge ---
export const generateChallenge = async (region: string): Promise<Challenge> => {
  const prompt = `Generate a unique, vegan cooking challenge from ${region} India.`;

  for (let i = 0; i < API_KEYS.length; i++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are a creative game designer specializing in vegan Indian cuisine. Respond in JSON only.",
          responseMimeType: "application/json",
          responseSchema: generateChallengeSchema,
        },
      });

      const result = JSON.parse(response.text.trim());
      speakText(`Your new challenge is ${result.title}. ${result.description}`);
      return { ...result, id: Date.now(), region };
    } catch (error: any) {
      if (
        error.message?.includes("quota") ||
        error.message?.includes("429") ||
        error.message?.includes("limit")
      ) {
        rotateKey();
        continue;
      }
      console.error("Error generating challenge:", error);
    }
  }

  // fallback
  return {
    id: Date.now(),
    region,
    title: "A Simple Lentil Dahl",
    description:
      "Fallback challenge — the Oracle whispers: create a soothing and heartwarming dahl.",
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
