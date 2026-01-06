export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
  thoughtProcess?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: number;
  modelConfig: ModelConfig;
}

export enum ModelId {
  PRO = 'gemini-3-pro-preview',
  FLASH = 'gemini-3-flash-preview',
  LITE = 'gemini-flash-lite-latest',
}

export interface ModelConfig {
  modelId: ModelId;
  autoSwitch: boolean;
  deepThinking: boolean;
  thinkingBudget: number;
  enableSearch: boolean;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  appearance: string;
  personality: string;
  backstory: string;
  goals: string;
  relationships: string;
}

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  modelId: ModelId.PRO,
  autoSwitch: true,
  deepThinking: false,
  thinkingBudget: 2048,
  enableSearch: false,
};
