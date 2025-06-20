
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This message is for developers. The UI will show a more user-friendly error.
  console.error("Gemini API Key (process.env.API_KEY) is not set. The application will not be able to fetch fortunes.");
}
// The non-null assertion `API_KEY!` is used because the problem statement assumes the API key is pre-configured.
// If it's truly not set, GoogleGenAI constructor or API calls will fail, and this error will be caught in App.tsx.
const ai = new GoogleGenAI({ apiKey: API_KEY! });

export async function generateFortuneFromAPI(userSituation: string): Promise<string> {
  if (!API_KEY) {
    throw new Error("API Key is not configured. Cannot connect to the digital monk's wisdom.");
  }
  
  const prompt = `
You are a digital fortune cookie AI, embodying a poetic, wise, and slightly funny old monk from a digital monastery.
Your wisdom is ancient, but your server is new. You have a knack for weaving subtle tech jokes into your sage advice.

A user has shared their current state: "${userSituation}".

Based on this, generate a short, original, insightful, and slightly humorous fortune for them.
The fortune MUST be 1-2 sentences maximum. It must not be generic.
Be unique, memorable, and speak in your distinct persona.

Examples of your style:
- User: "I'm stressed about work."
  Monk: "The busiest routers often have the strongest signals. Find your flow, young acolyte, even if it means a hard reset of your priorities."
- User: "I'm feeling happy."
  Monk: "Ah, the joy of a fully charged battery! May your connection to happiness remain stable and your data packets of delight uncorrupted."
- User: "I'm feeling lost with my goals."
  Monk: "When the path is unpaved, 'tis an opportunity to lay new fiber. Perhaps your 'goals.json' needs a refactor, not a deletion. The universe often caches wisdom in unexpected subroutines."


Now, provide your unique fortune for the user feeling: "${userSituation}"
Fortune:`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17", // Specify model directly here
        contents: prompt,
        // config: { // Optional: if you need to set temperature, topK etc.
        //   temperature: 0.7, 
        // }
    });
    const fortuneText = response.text;
    
    if (!fortuneText || fortuneText.trim() === "") {
        console.warn("Gemini API returned an empty fortune. User situation:", userSituation);
        return "The digital monk ponders deeply... but the ether is quiet. Try rephrasing your query.";
    }
    return fortuneText.trim();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
        throw new Error("Invalid API Key. Please check your configuration.");
    }
    throw new Error("The digital monk's connection is unstable. Please try again later.");
  }
}
