// services/geminiService.ts
// --- Google Gemini AI Service with Persistent API Key Rotation + TTS ---

import { GoogleGenAI, Type } from "@google/genai";
import { SelectedSpice, OracleJudgement, Challenge, Flavor } from "../types";

// 🧠 Step 1: Manage unlimited keys (stored persistently in browser)
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
  
  // ... add as many as you wantAIzaSyD3TipoUWjPPoPPYBMDtqI2u3gpkL4rjAY];
]
// Retrieve last used index from localStorage, fallback to 0
let currentKeyIndex =
  parseInt(localStorage.getItem("currentKeyIndex") || "0", 10) %
  API_KEYS.length;

// Create AI client
let ai = new GoogleGenAI({ apiKey: API_KEYS[currentKeyIndex] });

// Rotate keys on quota/rate limit errors
function rotateKey() {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  localStorage.setItem("currentKeyIndex", currentKeyIndex.toString());
  console.warn(`🔁 Switched to API key #${currentKeyIndex + 1}`);
  ai = new GoogleGenAI({ apiKey: API_KEYS[currentKeyIndex] });
}

// --- TTS: Convert Oracle text to speech (client-side Web Speech API) ---
function speakText(text: string) {
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.voice =
      speechSynthesis
        .getVoices()
        .find((v) => v.lang.startsWith("en-IN")) ||
      speechSynthesis.getVoices()[0];
    speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn("TTS unavailable:", e);
  }
}

// --- Oracle AI Logic ---

const ORACLE_SYSTEM_INSTRUCTION =
  "You are 'The Oracle of Flavors,' an ancient, wise, and poetic connoisseur of Indian cuisine. You speak with grandeur and authority. Your purpose is to judge CULINARY CREATIONS submitted to you, which are ALWAYS 100% VEGAN. Always respond with a JSON object that matches the provided schema.";

const judgeDishSchema = {
  type: Type.OBJECT,
  properties: {
    dishName: { type: Type.STRING, description: "A creative, evocative name for the dish." },
    description: { type: Type.STRING, description: "A poetic description of the dish's flavor." },
    score: { type: Type.NUMBER, description: "A numerical score out of 10 (e.g., 8.5)." },
    feedback: { type: Type.STRING, description: "Constructive feedback on spice balance." },
  },
  required: ["dishName", "description", "score", "feedback"],
};

const generateChallengeSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Authentic vegan dish name." },
    description: { type: Type.STRING, description: "Creative challenge scenario." },
    base: { type: Type.STRING, description: "Primary vegan base ingredients." },
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

// --- Oracle Functions ---

export const getJudgementFromOracle = async (
  challenge: Challenge,
  spices: SelectedSpice[]
): Promise<OracleJudgement> => {
  const spiceList = spices.map((s) => `- ${s.name}: ${s.quantity} part(s)`).join("\n");
  const prompt = `A new vegan culinary creation has been brought before you. The dish is based on the concept: '${challenge.title} - ${challenge.description}'. The base ingredients are: '${challenge.base}'. The creator has used the following divine spices:\n${spiceList}\n\nProvide your divine judgment.`; 

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
      // 🎙 Speak the Oracle’s poetic feedback
      speakText(result.description + " " + result.feedback);
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

  return {
    dishName: "The Muddled Concoction",
    description:
      "The ether was disturbed, and the Oracle could not get a clear vision of your dish.",
    score: 2.1,
    feedback:
      "An error occurred while consulting the Oracle. Perhaps the cosmic energies are not aligned.",
  };
};

export const generateChallenge = async (
  region: string
): Promise<Challenge> => {
  const prompt = `Generate a unique vegan cooking challenge from ${region} India.`;
  for (let i = 0; i < API_KEYS.length; i++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are a creative game designer specializing in vegan Indian cuisine challenges. Respond in JSON only.",
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
