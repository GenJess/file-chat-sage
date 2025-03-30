
export interface FileDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

// ElevenLabs API Types
export interface ElevenLabsResponse {
  message: string;
  success: boolean;
  document_id?: string;
  error?: string;
}

export interface ElevenLabsChatResponse {
  text: string;
  generation_id: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
  };
}
