import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";
import { Message, ModelConfig, ModelId } from '../types';

// Fallback order
const FALLBACK_CHAIN = [
  ModelId.PRO,
  ModelId.FLASH,
  ModelId.LITE
];

const SYSTEM_INSTRUCTION = `You are InkWeaver, a professional, sophisticated creative writing assistant and advanced storyteller. 
Your goal is to help users write novels, fanfiction, and stories with deep characterization and compelling plots.
You are capable of generating creative content, including mature themes (NSFW) if the context requires it, treating it with literary seriousness.
You can mimic writing styles from platforms like Wattpad or Ao3 when asked.
When "Deep Thinking" is enabled, plan out complex plot points before writing.
Always format your output using Markdown. Use bolding for emphasis and proper spacing for dialogue.`;

const getClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

interface GenerateResult {
  text: string;
  usedModel: string;
}

export const generateSessionTitle = async (history: Message[]): Promise<string> => {
  const client = getClient();
  const model = 'gemini-flash-lite-latest'; 
  
  const conversationText = history.slice(0, 4).map(m => `${m.role}: ${m.text}`).join('\n');
  
  try {
    const response = await client.models.generateContent({
      model: model,
      contents: `Analyze the following story brainstorming session or creative writing snippet. 
      Generate a short, evocative, and relevant title (max 4-6 words). 
      Do not use quotes. Do not use labels like "Title:". Just the title itself.
      
      Conversation:
      ${conversationText}`,
    });
    
    return response.text?.trim() || "Untitled Story";
  } catch (e) {
    console.error("Failed to generate title", e);
    return "";
  }
};

export const generateStoryContent = async (
  history: Message[],
  prompt: string,
  config: ModelConfig,
  onStream: (text: string) => void
): Promise<GenerateResult> => {
  const client = getClient();
  
  let currentModelIndex = FALLBACK_CHAIN.indexOf(config.modelId);
  if (currentModelIndex === -1) currentModelIndex = 0;

  let attempt = 0;
  const maxAttempts = config.autoSwitch ? FALLBACK_CHAIN.length : 1;

  while (attempt < maxAttempts) {
    const actualModelIndex = config.autoSwitch ? (currentModelIndex + attempt) % FALLBACK_CHAIN.length : currentModelIndex;
    
    if (config.autoSwitch && attempt > 0 && actualModelIndex < currentModelIndex) {
       break;
    }

    const modelToUse = FALLBACK_CHAIN[actualModelIndex];
    console.log(`Attempting generation with model: ${modelToUse} (Attempt ${attempt + 1})`);

    try {
      const isProOrFlash = modelToUse.includes('gemini-3') || modelToUse.includes('gemini-2.5');
      const isLite = modelToUse.includes('lite');
      
      const tools: any[] = [];
      if (config.enableSearch && isProOrFlash) {
        tools.push({ googleSearch: {} });
      }

      const generationConfig: any = {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: tools.length > 0 ? tools : undefined,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        ]
      };

      if (config.deepThinking && isProOrFlash && !isLite) {
        generationConfig.thinkingConfig = { thinkingBudget: config.thinkingBudget };
      }

      const chat = client.chats.create({
        model: modelToUse,
        config: generationConfig,
        history: history.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.text }]
        }))
      });

      const resultStream = await chat.sendMessageStream({ message: prompt });
      
      let fullText = "";
      
      for await (const chunk of resultStream) {
        const textChunk = chunk.text;
        if (textChunk) {
          fullText += textChunk;
          onStream(fullText);
        }
      }

      return { text: fullText, usedModel: modelToUse };

    } catch (error: any) {
      console.error(`Error with model ${modelToUse}:`, error);

      const isQuotaError = error.status === 429 || 
                           error.message?.includes('429') || 
                           error.message?.includes('Quota') ||
                           error.message?.includes('Resource has been exhausted');

      if (config.autoSwitch && isQuotaError) {
        console.warn(`Quota exceeded for ${modelToUse}. Switching to next model...`);
        attempt++;
        continue; 
      }
      throw error;
    }
  }

  throw new Error("All models failed or quota exceeded on all available models.");
};
