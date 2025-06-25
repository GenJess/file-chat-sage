
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from '@solana/wallet-adapter-react';
import { useToast } from "@/hooks/use-toast";
import ChatInterface from "@/components/ChatInterface";
import ResumeManager from "@/components/ResumeManager";
import ApiKeyManager from "@/components/ApiKeyManager";
import SolanaAuth from "@/components/SolanaAuth";
import SolanaWalletProvider from "@/components/SolanaWalletProvider";

const DashboardContent = () => {
  const { connected, publicKey } = useWallet();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading check
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleAuthenticated = (walletAddress: string) => {
    toast({
      title: "Wallet Connected",
      description: `Successfully connected to ${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}`,
    });
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
            <TabsTrigger value="chat">Chat & Automation</TabsTrigger>
            <TabsTrigger value="resumes">Resume Manager</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <ChatInterface user={walletUser as any} />
          </TabsContent>

          <TabsContent value="resumes">
            <ResumeManager user={walletUser as any} />
          </TabsContent>

          <TabsContent value="settings">
            <ApiKeyManager user={walletUser as any} />
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
