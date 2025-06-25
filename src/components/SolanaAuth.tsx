
import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, LogOut } from 'lucide-react';

interface SolanaAuthProps {
  onAuthenticated?: (publicKey: string) => void;
}

const SolanaAuth = ({ onAuthenticated }: SolanaAuthProps) => {
  const { connected, publicKey, disconnect } = useWallet();

  React.useEffect(() => {
    if (connected && publicKey && onAuthenticated) {
      onAuthenticated(publicKey.toString());
    }
  }, [connected, publicKey, onAuthenticated]);

  if (connected && publicKey) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Connected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>Connected Wallet:</p>
            <p className="font-mono text-xs break-all bg-gray-100 p-2 rounded">
              {publicKey.toString()}
            </p>
          </div>
          <WalletDisconnectButton className="w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Connect Your Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">
          Connect your Solana wallet to access your Personal Automation Dashboard
        </p>
        <WalletMultiButton className="w-full" />
        <div className="text-xs text-gray-500">
          <p>Supported wallets:</p>
          <ul className="list-disc list-inside mt-1">
            <li>Phantom</li>
            <li>Solflare</li>
            <li>Sollet</li>
            <li>Torus</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SolanaAuth;
