
'use client';
import { useEffect, useState } from 'react';

type WalletInfo = {
  address: string;
  balance: string;
  network: string;
};

const defaultWalletInfo: WalletInfo = {
  address: '0x0000000000000000000000000000000000000000',
  balance: '0',
  network: 'Unknown'
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
        setWalletInfo(defaultWalletInfo);
      }
    };

    fetchWalletInfo();
  }, []);

  if (!walletInfo) return <div>Loading wallet info...</div>;

  return (
    <div className="bg-white rounded-lg p-4 mt-4">
      <h2 className="text-xl font-bold mb-2">Agent Wallet Info</h2>
      <div className="space-y-2">
        {error && <p className="text-red-500 text-sm mb-2">Error: {error}</p>}
        <p><span className="font-medium">Address:</span> {walletInfo.address}</p>
        <p><span className="font-medium">Balance:</span> {walletInfo.balance}</p>
        <p><span className="font-medium">Network:</span> {walletInfo.network}</p>
      </div>
    </div>
  );
}
