
import { GoogleGenAI, Type } from '@google/genai';
import { SelectedSpice, OracleJudgement, Challenge, Flavor, FlavorProfile } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ORACLE_SYSTEM_INSTRUCTION = "You are 'The Oracle of Flavors,' an ancient, wise, and poetic connoisseur of Indian cuisine. You speak with grandeur and authority. Your purpose is to judge CULINARY CREATIONS submitted to you, which are ALWAYS 100% VEGAN. Always respond with a JSON object that matches the provided schema.";

const judgeDishSchema = {
  type: Type.OBJECT,
  properties: {
    dishName: { type: Type.STRING, description: "A creative, evocative name for the dish based on its ingredients and concept." },
    description: { type: Type.STRING, description: "A poetic and vivid description of the dish's flavor profile and aroma, as if you are tasting it." },
    score: { type: Type.NUMBER, description: "A numerical score out of 10 (e.g., 8.5) based on the balance and suitability of the spices for the dish concept." },
    feedback: { type: Type.STRING, description: "Constructive feedback on how the dish could be improved or what makes it exceptional. Be specific about the spice interactions." },
  },
  required: ["dishName", "description", "score", "feedback"],
};

const generateChallengeSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "The authentic name of a popular, 100% vegan dish from the specified Indian region." },
    description: { type: Type.STRING, description: "A creative and engaging scenario or request for the dish. E.g., 'A light, refreshing version for a summer festival' or 'A rich, comforting version for a cold, rainy evening'." },
    base: { type: Type.STRING, description: "The primary vegan base ingredients for the dish, e.g., 'Red lentils and coconut milk' or 'Okra and chickpea flour'." },
    targetProfile: {
      type: Type.OBJECT,
      properties: {
        [Flavor.HEAT]: { type: Type.INTEGER, description: "Target heat level from 0 to 100" },
        [Flavor.EARTHY]: { type: Type.INTEGER, description: "Target earthy level from 0 to 100" },
        [Flavor.SWEET]: { type: Type.INTEGER, description: "Target sweet level from 0 to 100" },
        [Flavor.TANGY]: { type: Type.INTEGER, description: "Target tangy level from 0 to 100" },
        [Flavor.AROMATIC]: { type: Type.INTEGER, description: "Target aromatic level from 0 to 100" },
      },
      required: Object.values(Flavor),
    },
  },
  required: ["title", "description", "base", "targetProfile"],
};


export const getJudgementFromOracle = async (challenge: Challenge, spices: SelectedSpice[]): Promise<OracleJudgement> => {
  try {
    const spiceList = spices.map(s => `- ${s.name}: ${s.quantity} part(s)`).join('\n');
    const prompt = `A new vegan culinary creation has been brought before you. The dish is based on the concept: '${challenge.title} - ${challenge.description}'. The base ingredients are: '${challenge.base}'. The creator has used the following divine spices:\n${spiceList}\n\nBased on this combination, please provide your divine judgment. Be creative, dramatic, and insightful. The dishName should be unique and sound legendary.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: ORACLE_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: judgeDishSchema,
      },
    });

    const result = JSON.parse(response.text.trim());
    return result as OracleJudgement;
  } catch (error) {
    console.error("Error getting judgement from Oracle:", error);
    return {
      dishName: "The Muddled Concoction",
      description: "The ether was disturbed, and the Oracle could not get a clear vision of your dish. The flavors are chaotic and unbalanced.",
      score: 2.1,
      feedback: "An error occurred while consulting the Oracle. Perhaps the cosmic energies are not aligned. Please try your offering again."
    };
  }
};

export const generateChallenge = async (region: string): Promise<Challenge> => {
    try {
        const prompt = `Generate a new, unique, and interesting cooking challenge based on a 100% VEGAN dish from ${region} India. The challenge should feel fresh and not be a simple, standard recipe description.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are a creative game designer specializing in culinary games. Your task is to generate unique, 100% VEGAN Indian cooking challenges. Ensure the target flavor profiles are balanced and make sense for the dish described. Always respond with a JSON object matching the schema.",
                responseMimeType: "application/json",
                responseSchema: generateChallengeSchema,
            }
        });

        const result = JSON.parse(response.text.trim());
        
        // Add fields not generated by the model
        return {
            ...result,
            id: Date.now(),
            region: region,
        } as Challenge;

    } catch(error) {
        console.error("Error generating challenge:", error);
        // Provide a fallback challenge on error
        return {
            id: 1,
            region: 'Fallback',
            title: "A Simple Lentil Dahl",
            description: "The API failed to respond, so let's make a classic. Create a soothing and heartwarming dahl. It should be earthy and aromatic, with just a touch of warmth.",
            base: "lentils and water",
            targetProfile: {
              [Flavor.HEAT]: 15,
              [Flavor.EARTHY]: 60,
              [Flavor.SWEET]: 10,
              [Flavor.TANGY]: 5,
              [Flavor.AROMATIC]: 40,
            }
        };
    }
};
