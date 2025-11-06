import { GoogleGenAI, Type } from "@google/genai";
import {
  SelectedSpice,
  OracleJudgement,
  Challenge,
  Flavor,
} from "../types";

// ======== 🔐 MULTI-API KEY SETUP =========
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
  // ...add up to 20+ keys here
];

let currentKeyIndex = 0;
function currentApiKey() {
  return API_KEYS[currentKeyIndex];
}

function rotateKey() {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  console.warn(`⚠️ Switched to API key #${currentKeyIndex + 1}`);
}

// ========================================

const ORACLE_SYSTEM_INSTRUCTION = `
You are 'The Oracle of Flavors,' an ancient, wise, and poetic connoisseur of Indian cuisine.
You speak with grandeur and authority. Your purpose is to judge CULINARY CREATIONS submitted to you,
which are ALWAYS 100% VEGAN. Always respond with a JSON object that matches the provided schema.
`;

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

// ====== 🧠 ORACLE FUNCTION ======
export const getJudgementFromOracle = async (
  challenge: Challenge,
  spices: SelectedSpice[]
): Promise<OracleJudgement> => {
  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    try {
      const ai = new GoogleGenAI({ apiKey: currentApiKey() });
      const spiceList = spices
        .map((s) => `- ${s.name}: ${s.quantity} part(s)`)
        .join("\n");

      const prompt = `A new vegan culinary creation has been brought before you. The dish is based on the concept: '${challenge.title} - ${challenge.description}'. The base ingredients are: '${challenge.base}'. The creator has used the following divine spices:\n${spiceList}\n\nBased on this combination, please provide your divine judgment. Be creative, dramatic, and insightful. The dishName should be unique and sound legendary.`;

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
      return result as OracleJudgement;
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

  return {
    dishName: "The Muddled Concoction",
    description:
      "The ether was disturbed, and the Oracle could not get a clear vision of your dish.",
    score: 2.1,
    feedback: "Please try again later — the cosmic energies misaligned.",
  };
};

// ====== 🍛 CHALLENGE GENERATOR ======
export const generateChallenge = async (
  region: string
): Promise<Challenge> => {
  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    try {
      const ai = new GoogleGenAI({ apiKey: currentApiKey() });
      const prompt = `Generate a new, unique, and interesting cooking challenge based on a 100% VEGAN dish from ${region} India.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are a creative game designer specializing in vegan Indian dishes. Always respond with valid JSON.",
          responseMimeType: "application/json",
          responseSchema: generateChallengeSchema,
        },
      });

      const result = JSON.parse(response.text.trim());
      return {
        ...result,
        id: Date.now(),
        region: region,
      } as Challenge;
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

  // fallback challenge
  return {
    id: 1,
    region: "Fallback",
    title: "A Simple Lentil Dahl",
    description:
      "The API failed to respond, so let's make a classic comforting dish.",
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

// ====== 🗣 GEMINI TTS FUNCTION ======
export async function speakText(text: string) {
  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
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
                voiceName: "en-IN-Neural2-C",
              },
            },
            speakingRate: 1.25,
            pitch: -0.5,
          },
        },
      });

      const audioData =
        response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!audioData) throw new Error("No audio data in Gemini response");

      const byteString = atob(audioData);
      const buffer = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        buffer[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([buffer], { type: "audio/mp3" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();

      return; // stop after success
    } catch (error: any) {
      if (
        error.message?.includes("quota") ||
        error.message?.includes("429") ||
        error.message?.includes("limit")
      ) {
        rotateKey();
        continue;
      }
      console.warn("🎙 Gemini TTS failed, using fallback:", error);
      break;
    }
  }

  // browser fallback
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-IN";
  utter.rate = 1.25;
  utter.pitch = 0.9;
  speechSynthesis.speak(utter);
}

