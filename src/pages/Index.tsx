
import { useState, useEffect } from "react";
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
import { FileDocument, ChatMessage, ElevenLabsChatResponse } from "@/types";
import { initializeKnowledgeBase, fetchDocuments, uploadDocument, deleteDocument } from "@/utils/elevenlabs";

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Default voice ID (Rachel voice)

const Index = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<FileDocument[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [apiKey, setApiKey] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [knowledgeBaseId, setKnowledgeBaseId] = useState<string>("");

  useEffect(() => {
    // Check if API key is stored in localStorage on component mount
    const storedApiKey = localStorage.getItem("elevenlabs_api_key");
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setIsApiKeySet(true);
      initializeKnowledgeBaseAndFetchDocs(storedApiKey);
    }
  }, []);

  const initializeKnowledgeBaseAndFetchDocs = async (key: string) => {
    try {
      const kb = await initializeKnowledgeBase(key);
      setKnowledgeBaseId(kb.knowledge_base_id);
      
      const docsData = await fetchDocuments(key, kb.knowledge_base_id);
      if (docsData.documents) {
        const formattedDocs: FileDocument[] = docsData.documents.map((doc: any) => ({
          id: doc.id,
          name: doc.name || "Unknown Document",
          size: doc.size || 0,
          type: doc.type || "application/octet-stream",
          uploadDate: doc.upload_date || new Date().toISOString()
        }));
        
        setDocuments(formattedDocs);
      }
    } catch (error) {
      console.error("Failed to initialize knowledge base:", error);
      toast({
        title: "Error",
        description: "Failed to initialize knowledge base. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleApiKeySubmit = async (key: string) => {
    setApiKey(key);
    setIsApiKeySet(true);
    toast({
      title: "API Key Set",
      description: "Your API key has been securely stored."
    });
    
    await initializeKnowledgeBaseAndFetchDocs(key);
  };

  const handleFileUpload = async (files: File[]) => {
    if (!isApiKeySet || !knowledgeBaseId) {
      toast({
        title: "Error",
        description: "Please set your ElevenLabs API key first.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const uploadedDocs: FileDocument[] = [];
      
      for (const file of files) {
        const result = await uploadDocument(apiKey, knowledgeBaseId, file);
        
        if (result.document_id) {
          uploadedDocs.push({
            id: result.document_id,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date().toISOString()
          });
        }
      }
      
      setDocuments(prev => [...prev, ...uploadedDocs]);
      
      toast({
        title: "Files Uploaded",
        description: `Successfully uploaded ${uploadedDocs.length} file(s).`,
      });
      
      if (uploadedDocs.length > 0) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "system",
            content: `${uploadedDocs.length} new document(s) added to the knowledge base: ${uploadedDocs.map(doc => doc.name).join(", ")}`
          }
        ]);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your files.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocumentDelete = async (documentId: string) => {
    if (!knowledgeBaseId) return;

    try {
      await deleteDocument(apiKey, knowledgeBaseId, documentId);
      
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      toast({
        title: "Document Deleted",
        description: "Document successfully removed from your knowledge base.",
      });
      
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
      console.error("Delete error:", error);
      toast({
        title: "Deletion Failed",
        description: "There was an error removing your document.",
        variant: "destructive"
      });
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

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">FileChatSage</h1>
          <ApiKeyInput 
            onSubmit={handleApiKeySubmit} 
            defaultApiKey={apiKey}
          />
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
