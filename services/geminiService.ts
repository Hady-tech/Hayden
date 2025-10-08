
import { GoogleGenAI, Type } from "@google/genai";
import { SummaryData } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const summarySchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.ARRAY,
      description: "A concise summary of the lecture, presented as 5-10 bullet points.",
      items: { type: Type.STRING }
    },
    key_terms: {
      type: Type.ARRAY,
      description: "A list of key terms and their definitions from the lecture.",
      items: { type: Type.STRING }
    },
    action_items: {
      type: Type.ARRAY,
      description: "A list of action items or tasks mentioned in the lecture.",
      items: { type: Type.STRING }
    }
  },
  required: ["summary", "key_terms", "action_items"]
};


export const summarizeTranscript = async (transcript: string): Promise<SummaryData> => {
  const model = "gemini-2.5-flash";
  const systemInstruction = `You are an expert academic assistant. Your task is to create concise, exam-ready notes from lecture transcripts. 
  - Keep formulas and technical notation verbatim. 
  - Do not add any introductory or concluding remarks. 
  - Focus on extracting the key information into short, clear bullet points.
  - Generate three sections: "Summary", "Key Terms & Definitions", and "Action Items".`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `Here is the lecture transcript:\n\n---\n${transcript}\n---`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: summarySchema,
      },
    });

    const jsonText = response.text.trim();
    // It's good practice to parse and validate, even if the model is told to return JSON.
    const parsed = JSON.parse(jsonText);
    
    // Ensure all required fields are arrays
    const validatedData: SummaryData = {
        summary: Array.isArray(parsed.summary) ? parsed.summary : [],
        key_terms: Array.isArray(parsed.key_terms) ? parsed.key_terms : [],
        action_items: Array.isArray(parsed.action_items) ? parsed.action_items : [],
    };

    return validatedData;

  } catch (error) {
    console.error("Error summarizing transcript with Gemini:", error);
    throw new Error("Failed to generate summary from the transcript.");
  }
};

export const translateTranscript = async (transcript: string, language: string): Promise<string> => {
    const model = "gemini-2.5-flash";
    const systemInstruction = `You are a highly skilled translator. Translate the following text into ${language}. 
    - Translate accurately, preserving the original meaning and tone.
    - Do not add any extra commentary or explanation.
    - Return only the translated text.`;

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: transcript,
        config: {
          systemInstruction: systemInstruction
        }
      });
      return response.text;
    } catch (error) {
      console.error(`Error translating transcript to ${language}:`, error);
      throw new Error(`Failed to translate transcript.`);
    }
};
