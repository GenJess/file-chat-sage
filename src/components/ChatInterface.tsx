
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

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  toolExecution?: {
    name: string;
    status: "running" | "completed" | "error";
    result?: any;
  };
}

interface ChatInterfaceProps {
  user?: User;
  messages?: ChatMessage[];
  onSendMessage?: (message: string) => Promise<void>;
  isReady?: boolean;
}

const ChatInterface = ({ user, messages: externalMessages, onSendMessage: externalOnSendMessage, isReady }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content: "Welcome to your Personal Automation Dashboard! I can help you execute tools like updating resumes, managing job applications, and more. Just ask!",
      timestamp: new Date(),
    },
  ]);
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

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      // Use external onSendMessage if provided, otherwise use internal logic
      if (externalOnSendMessage) {
        await externalOnSendMessage(input);
      } else {
        // Check if the message requests tool execution
        const shouldExecuteTool = input.toLowerCase().includes("resume") || 
                                 input.toLowerCase().includes("job") ||
                                 input.toLowerCase().includes("update");

        if (shouldExecuteTool) {
          // Add tool execution message
          const toolMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "I'll help you update your resumes. Let me execute the UpdateResumeForJobs tool...",
            timestamp: new Date(),
            toolExecution: {
              name: "UpdateResumeForJobs",
              status: "running",
            },
          };
          setMessages(prev => [...prev, toolMessage]);

          // Simulate tool execution (this would call the actual edge function)
          setTimeout(() => {
            const completedToolMessage: Message = {
              ...toolMessage,
              content: "Successfully updated resumes for all open job postings! Generated 3 tailored PDFs and stored them in your resume library.",
              toolExecution: {
                name: "UpdateResumeForJobs",
                status: "completed",
                result: {
                  resumesGenerated: 3,
                  jobsProcessed: ["Software Engineer - TechCorp", "Full Stack Developer - StartupXYZ", "Senior Developer - BigTech"],
                },
              },
            };
            setMessages(prev => prev.map(msg => msg.id === toolMessage.id ? completedToolMessage : msg));
          }, 3000);
        } else {
          // Regular chat response
          setTimeout(() => {
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: `I understand you want to know about "${input}". I'm equipped with tools for resume automation, job application management, and more. Try asking me to "update my resumes" or "generate resumes for my job applications".`,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMessage]);
          }, 1000);
        }
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
              {messages.map((message) => (
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
                      {message.toolExecution && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              message.toolExecution.status === "running" ? "default" :
                              message.toolExecution.status === "completed" ? "secondary" : "destructive"
                            }>
                              {message.toolExecution.name}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {message.toolExecution.status}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString()}
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

      {/* Tool Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50" onClick={() => setInput("Update my resumes for all open job applications")}>
              <h3 className="font-medium">Update Resumes</h3>
              <p className="text-sm text-gray-600">Generate tailored resumes for Notion job postings</p>
            </div>
            <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50" onClick={() => setInput("Show me my recent resume activity")}>
              <h3 className="font-medium">Resume Analytics</h3>
              <p className="text-sm text-gray-600">View resume generation history and metrics</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatInterface;
