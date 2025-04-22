
import { useEffect } from "react";
import { useApiKey } from "@/hooks/useApiKey";
import { useDocuments } from "@/hooks/useDocuments";
import { useChat } from "@/hooks/useChat";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import DocumentPanel from "@/components/DocumentPanel";
import ChatInterface from "@/components/ChatInterface";

const Index = () => {
  const { toast } = useToast();
  const { apiKey, isApiKeySet, handleApiKeySubmit } = useApiKey();
  const {
    documents,
    isUploading,
    initializeKnowledgeBaseAndFetchDocs,
    handleFileUpload,
    handleDocumentDelete
  } = useDocuments(apiKey);
  const { messages, isProcessing, handleMessageSubmit } = useChat(apiKey);

  useEffect(() => {
    if (apiKey) {
      initializeKnowledgeBaseAndFetchDocs(apiKey);
    }
  }, [apiKey]);

  const handleUpload = async (files: File[]) => {
    if (!isApiKeySet) {
      toast({
        title: "Error",
        description: "Please set your ElevenLabs API key first.",
        variant: "destructive"
      });
      return;
    }

    const uploadedDocs = await handleFileUpload(files);
    
    if (uploadedDocs.length > 0) {
      // Add system message about uploaded documents
      const systemMessage = {
        id: Date.now().toString(),
        role: "system" as const,
        content: `${uploadedDocs.length} new document(s) added to the knowledge base: ${uploadedDocs.map(doc => doc.name).join(", ")}`
      };
      messages.push(systemMessage);
    }
  };

  const handleDelete = async (documentId: string) => {
    const deletedDoc = documents.find(doc => doc.id === documentId);
    const result = await handleDocumentDelete(documentId);
    
    if (result && deletedDoc) {
      // Add system message about deleted document
      const systemMessage = {
        id: Date.now().toString(),
        role: "system" as const,
        content: `Document removed from knowledge base: ${deletedDoc.name}`
      };
      messages.push(systemMessage);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Header onApiKeySubmit={handleApiKeySubmit} defaultApiKey={apiKey} />
      
      <main className="flex flex-1 overflow-hidden container mx-auto my-4 gap-4">
        <DocumentPanel
          documents={documents}
          isUploading={isUploading}
          onUpload={handleUpload}
          onDelete={handleDelete}
        />
        
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
