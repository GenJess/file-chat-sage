
import { useState } from "react";
import { ChatMessage, ElevenLabsChatResponse } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { ELEVEN_LABS_API } from "@/constants/api";

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice

export const useChat = (apiKey: string) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMessageSubmit = async (message: string) => {
    if (isProcessing) {
      toast({
        title: "Processing",
        description: "Please wait while we process your previous message.",
      });
      return;
    }
    
    // Add user message
    const userMessageId = Date.now().toString();
    setMessages(prev => [
      ...prev,
      {
        id: userMessageId,
        role: "user",
        content: message
      }
    ]);
    
    setIsProcessing(true);
    
    try {
      const response = await fetch(`${ELEVEN_LABS_API}/convai/knowledgebase/chat`, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: message,
          voice_id: DEFAULT_VOICE_ID,
          model_id: "eleven_multilingual_v2"
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ElevenLabsChatResponse = await response.json();
      
      setMessages(prev => [
        ...prev,
        {
          id: result.generation_id || (Date.now() + 1).toString(),
          role: "assistant",
          content: result.text
        }
      ]);
    } catch (error) {
      console.error("Message error:", error);
      toast({
        title: "Message Error",
        description: "Failed to get a response from the AI.",
        variant: "destructive"
      });
      
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "system",
          content: "Failed to get a response from the AI. Please try again."
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    messages,
    isProcessing,
    handleMessageSubmit
  };
};
