
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
    knowledgeBaseId,
    initializeKnowledgeBaseAndFetchDocs,
    handleFileUpload,
    handleDocumentDelete
  } = useDocuments(apiKey);
  const { messages, isProcessing, handleMessageSubmit, addSystemMessage } = useChat(apiKey, knowledgeBaseId);

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
      addSystemMessage(`${uploadedDocs.length} new document(s) added to the knowledge base: ${uploadedDocs.map(doc => doc.name).join(", ")}. You can now ask questions about these documents!`);
    }
  };

  const handleDelete = async (documentId: string) => {
    const deletedDoc = documents.find(doc => doc.id === documentId);
    const result = await handleDocumentDelete(documentId);
    
    if (result && deletedDoc) {
      // Add system message about deleted document
      addSystemMessage(`Document removed from knowledge base: ${deletedDoc.name}`);
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
