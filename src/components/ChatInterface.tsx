
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";
import { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isReady: boolean;
}

const ChatInterface = ({ messages, onSendMessage, isReady }: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && isReady) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Chat with Your Documents</h2>
        <p className="text-sm text-slate-500">
          Ask questions about the content of your uploaded files
        </p>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Bot className="h-12 w-12 text-slate-300 mb-2" />
              <p className="font-medium">Your AI Assistant is Ready</p>
              <p className="text-sm text-center max-w-md">
                {isReady 
                  ? "Start chatting to get insights from your documents" 
                  : "Upload documents and set your API key to start chatting"}
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id} 
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start",
                  message.role === "system" && "justify-center"
                )}
              >
                <div 
                  className={cn(
                    "max-w-[80%] rounded-lg p-4",
                    message.role === "user" && "bg-slate-800 text-white",
                    message.role === "assistant" && "bg-slate-100 text-slate-800",
                    message.role === "system" && "bg-slate-200 text-slate-600 text-sm py-2 px-4"
                  )}
                >
                  {message.role !== "system" && (
                    <div className="flex items-center mb-1">
                      {message.role === "assistant" ? (
                        <Bot className="h-4 w-4 mr-2" />
                      ) : (
                        <User className="h-4 w-4 mr-2" />
                      )}
                      <span className="text-xs font-medium">
                        {message.role === "assistant" ? "AI Assistant" : "You"}
                      </span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={endOfMessagesRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isReady 
              ? "Ask a question about your documents..." 
              : "Upload documents and set API key to start chatting"}
            className="flex-1"
            disabled={!isReady}
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || !isReady}
            className="bg-slate-800 hover:bg-slate-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
