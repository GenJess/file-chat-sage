
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User as UserIcon, Settings } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@/types";


interface ChatInterfaceProps {
  user?: User;
  messages?: ChatMessage[];
  onSendMessage?: (message: string) => Promise<void>;
  isReady?: boolean;
}

const ChatInterface = ({ user, messages: externalMessages, onSendMessage: externalOnSendMessage, isReady }: ChatInterfaceProps) => {
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(externalMessages || []);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (externalMessages && externalMessages.length !== localMessages.length) {
      setLocalMessages(externalMessages);
    }
  }, [externalMessages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing || !isReady) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setLocalMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      // Use external onSendMessage if provided
      if (externalOnSendMessage) {
        await externalOnSendMessage(input);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              AI Assistant
            </CardTitle>
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-500" />
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Gemini</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="mistral">Mistral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Messages */}
            <div className="h-96 overflow-y-auto space-y-4 border rounded-lg p-4 bg-gray-50">
{localMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === "user" 
                      ? "bg-blue-600 text-white" 
                      : message.role === "system"
                      ? "bg-gray-600 text-white"
                      : "bg-green-600 text-white"
                  }`}>
                    {message.role === "user" ? (
                      <UserIcon className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div className={`flex-1 max-w-xs md:max-w-md lg:max-w-lg ${
                    message.role === "user" ? "text-right" : ""
                  }`}>
                    <div className={`p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white border"
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me to update resumes, process job applications, or execute other automation tools..."
                className="flex-1 min-h-[80px]"
                disabled={isProcessing}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isProcessing}
                size="icon"
                className="h-[80px] w-12"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatInterface;
