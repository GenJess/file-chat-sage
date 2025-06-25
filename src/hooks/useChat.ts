
import { useState } from "react";
import { ChatMessage } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { ELEVEN_LABS_API } from "@/constants/api";

export const useChat = (apiKey: string, knowledgeBaseId: string = "") => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "system",
      content: "Hello! I'm ready to help you chat with your documents. Upload some files to get started, then ask me questions about them!"
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMessageSubmit = async (message: string) => {
    if (isProcessing) {
      toast({
        title: "Processing",
        description: "Please wait while we process your previous message.",
      });
      return;
    }

    if (!knowledgeBaseId) {
      toast({
        title: "No Knowledge Base",
        description: "Please upload some documents first to create a knowledge base.",
        variant: "destructive"
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
      // Use the knowledge base chat endpoint
      const response = await fetch(`${ELEVEN_LABS_API}/knowledge-bases/${knowledgeBaseId}/conversation`, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: message,
          conversation_history: messages.slice(-10).map(msg => ({
            role: msg.role === "assistant" ? "agent" : msg.role,
            message: msg.content
          }))
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.answer || result.text || "I received your message but couldn't generate a response."
        }
      ]);
    } catch (error) {
      console.error("Message error:", error);
      toast({
        title: "Message Error",
        description: "Failed to get a response from the AI. Please check your API key and try again.",
        variant: "destructive"
      });
      
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: "system",
          content: "Failed to get a response from the AI. Please try again or check if your documents were uploaded successfully."
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const addSystemMessage = (content: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "system",
        content
      }
    ]);
  };

  return {
    messages,
    isProcessing,
    handleMessageSubmit,
    addSystemMessage
  };
};
