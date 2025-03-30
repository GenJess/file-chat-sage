
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import DocumentsList from "@/components/DocumentsList";
import ChatInterface from "@/components/ChatInterface";
import FileUploadZone from "@/components/FileUploadZone";
import ApiKeyInput from "@/components/ApiKeyInput";
import { FileDocument, ChatMessage } from "@/types";

const Index = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<FileDocument[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [apiKey, setApiKey] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isApiKeySet, setIsApiKeySet] = useState(false);

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    setIsApiKeySet(true);
    toast({
      title: "API Key Set",
      description: "Your API key has been securely stored for this session."
    });
    // In a real app, we would validate the API key here
  };

  const handleFileUpload = async (files: File[]) => {
    if (!isApiKeySet) {
      toast({
        title: "API Key Required",
        description: "Please set your ElevenLabs API key first.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    // Simulate file upload and processing
    try {
      // In a real implementation, we would upload files to ElevenLabs knowledge base here
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newDocuments = files.map((file, index) => ({
        id: `doc_${Date.now()}_${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString()
      }));
      
      setDocuments(prev => [...prev, ...newDocuments]);
      
      toast({
        title: "Files Uploaded",
        description: `Successfully uploaded ${files.length} file(s).`,
      });
      
      // Add a system message indicating files were added
      if (newDocuments.length > 0) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "system",
            content: `${newDocuments.length} new document(s) added to the knowledge base: ${newDocuments.map(doc => doc.name).join(", ")}`
          }
        ]);
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your files.",
        variant: "destructive"
      });
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleMessageSubmit = async (message: string) => {
    if (!isApiKeySet) {
      toast({
        title: "API Key Required",
        description: "Please set your ElevenLabs API key first.",
        variant: "destructive"
      });
      return;
    }
    
    if (documents.length === 0) {
      toast({
        title: "No Documents",
        description: "Please upload at least one document first.",
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
    
    // In a real implementation, we would send the message to the ElevenLabs API
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate AI response
      const aiResponse = `This is a simulated response about the documents you've uploaded. In a real implementation, I would use the ElevenLabs API to generate a response based on your documents' content. You could ask specific questions about your ${documents.length} uploaded document(s).`;
      
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: aiResponse
        }
      ]);
    } catch (error) {
      toast({
        title: "Message Error",
        description: "Failed to get a response from the AI.",
        variant: "destructive"
      });
      console.error("Message error:", error);
    }
  };

  const handleDocumentDelete = async (documentId: string) => {
    // In a real implementation, we would delete the document from the ElevenLabs knowledge base
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      toast({
        title: "Document Deleted",
        description: "Document successfully removed from your knowledge base.",
      });
      
      // Add a system message indicating the file was removed
      const deletedDoc = documents.find(doc => doc.id === documentId);
      if (deletedDoc) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "system",
            content: `Document removed from knowledge base: ${deletedDoc.name}`
          }
        ]);
      }
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "There was an error removing your document.",
        variant: "destructive"
      });
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">FileChatSage</h1>
          {!isApiKeySet && (
            <ApiKeyInput onSubmit={handleApiKeySubmit} />
          )}
          {isApiKeySet && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsApiKeySet(false)}
              className="text-slate-200 border-slate-600 hover:bg-slate-700"
            >
              Change API Key
            </Button>
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden container mx-auto my-4 gap-4">
        {/* Left Panel - Upload & Documents */}
        <div className="w-1/3 flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
          <Tabs defaultValue="upload" className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-2 mx-4 mt-4">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="flex-1 flex flex-col p-4">
              <h2 className="text-lg font-semibold mb-4">Upload Documents</h2>
              <FileUploadZone onUpload={handleFileUpload} isUploading={isUploading} />
              <div className="mt-4 text-sm text-slate-500">
                <p>Supported file types: PDF, DOCX, TXT</p>
                <p>Maximum file size: 10MB</p>
              </div>
            </TabsContent>
            
            <TabsContent value="documents" className="flex-1 flex flex-col p-4">
              <h2 className="text-lg font-semibold mb-4">Your Documents</h2>
              <DocumentsList documents={documents} onDelete={handleDocumentDelete} />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right Panel - Chat */}
        <div className="w-2/3 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
          <ChatInterface 
            messages={messages} 
            onSendMessage={handleMessageSubmit} 
            isReady={isApiKeySet && documents.length > 0}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
