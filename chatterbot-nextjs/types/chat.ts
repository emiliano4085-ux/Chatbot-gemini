// types/chat.ts
export type Role = 'user' | 'model' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date | string;
}

export interface ModelConfig {
  modelName: string;
  systemInstruction: string;
  temperature: number;
  maxOutputTokens: number;
  topP: number;
  topK: number;
}

export interface ChatRequestBody {
  messages: Array<{
    role: 'user' | 'model';
    content: string;
  }>;
  config: ModelConfig;
  apiKey?: string;
}

export interface UsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

export interface ChatThread {
  id: string;
  title: string;
  updatedAt: string;
  messages: Message[];
  config: ModelConfig;
}
