
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
