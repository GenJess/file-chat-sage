
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from '@solana/wallet-adapter-react';
import { useToast } from "@/hooks/use-toast";
import ChatInterface from "@/components/ChatInterface";
import ResumeManager from "@/components/ResumeManager";
import ApiKeyManager from "@/components/ApiKeyManager";
import SolanaAuth from "@/components/SolanaAuth";
import SolanaWalletProvider from "@/components/SolanaWalletProvider";
import DocumentPanel from "@/components/DocumentPanel";
import { useApiKey } from "@/hooks/useApiKey";
import { useDocuments } from "@/hooks/useDocuments";
import { useChat } from "@/hooks/useChat";

const DashboardContent = () => {
  const { connected, publicKey } = useWallet();
  const [loading, setLoading] = useState(true);
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
    // Simulate loading check
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (apiKey) {
      initializeKnowledgeBaseAndFetchDocs(apiKey);
    }
  }, [apiKey]);

  const handleAuthenticated = (walletAddress: string) => {
    toast({
      title: "Wallet Connected",
      description: `Successfully connected to ${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}`,
    });
  };

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
      addSystemMessage(`${uploadedDocs.length} new document(s) added to the knowledge base: ${uploadedDocs.map(doc => doc.name).join(", ")}. You can now ask questions about these documents!`);
    }
  };

  const handleDelete = async (documentId: string) => {
    const deletedDoc = documents.find(doc => doc.id === documentId);
    const result = await handleDocumentDelete(documentId);
    
    if (result && deletedDoc) {
      addSystemMessage(`Document removed from knowledge base: ${deletedDoc.name}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!connected || !publicKey) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <SolanaAuth onAuthenticated={handleAuthenticated} />
      </div>
    );
  }

  // Create a user-like object from the wallet connection
  const walletUser = {
    id: publicKey.toString(),
    email: `${publicKey.toString().slice(0, 8)}...@solana.wallet`,
    user_metadata: {},
    app_metadata: {},
    aud: '',
    created_at: new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Personal Automation Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
              </span>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat">Document Chat</TabsTrigger>
            <TabsTrigger value="resumes">Resume Manager</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <DocumentPanel
                  documents={documents}
                  isUploading={isUploading}
                  onUpload={handleUpload}
                  onDelete={handleDelete}
                />
              </div>
              <div className="lg:col-span-2">
                <ChatInterface 
                  messages={messages} 
                  onSendMessage={handleMessageSubmit} 
                  isReady={isApiKeySet && documents.length > 0}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resumes">
            <ResumeManager user={walletUser as any} />
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-medium mb-4">ElevenLabs API Key</h3>
                <div className="space-y-4">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => handleApiKeySubmit(e.target.value)}
                    placeholder="Enter your ElevenLabs API key"
                    className="w-full p-3 border rounded-lg"
                  />
                  <p className="text-sm text-gray-600">
                    This key is stored locally and used for document chat functionality.
                  </p>
                </div>
              </div>
              <ApiKeyManager user={walletUser as any} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const Dashboard = () => {
  return (
    <SolanaWalletProvider>
      <DashboardContent />
    </SolanaWalletProvider>
  );
};

export default Dashboard;
