
'use client';
import { useEffect, useState } from 'react';

type WalletInfo = {
  address: string;
  balance: string;
  network: string;
};

export default function AgentWallet() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        const response = await fetch('http://0.0.0.0:3001/api/wallet-info');
        if (!response.ok) throw new Error('Failed to fetch wallet info');
        const data = await response.json();
        setWalletInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching wallet info');
      }
    };

    fetchWalletInfo();
  }, []);

  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!walletInfo) return <div>Loading wallet info...</div>;

  return (
    <div className="bg-gray-100 rounded-lg p-4 mt-4">
      <h2 className="text-xl font-bold mb-2">Agent Wallet Info</h2>
      <div className="space-y-2">
        <p><span className="font-medium">Address:</span> {walletInfo.address}</p>
        <p><span className="font-medium">Balance:</span> {walletInfo.balance}</p>
        <p><span className="font-medium">Network:</span> {walletInfo.network}</p>
      </div>
    </div>
  );
}
