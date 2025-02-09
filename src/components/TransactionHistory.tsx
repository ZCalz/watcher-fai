
import { useEffect, useState } from 'react';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('http://0.0.0.0:3001/api/transactions');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Resonse data:: ", data)
        setTransactions(data.transfers.length ? data.transfers : getPlaceholderTransactions());
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setTransactions(getPlaceholderTransactions());
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const getPlaceholderTransactions = (): Transaction[] => {
    return [
      {
        hash: '0x1234.....cdefExample',
        from: '0x1234...4567Example',
        to: '0xabcd...def1Example',
        value: '0.000',
        timestamp: Date.now() / 1000,
      },
      // {
      //   hash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
      //   from: '0xabcdef1234567890abcdef1234567890abcdef12',
      //   to: '0x1234567890abcdef1234567890abcdef12345678',
      //   value: '0.05',
      //   timestamp: (Date.now() - 86400000) / 1000, // 1 day ago
      // },
      // {
      //   hash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
      //   from: '0xabcdef1234567890abcdef1234567890abcdef12',
      //   to: '0x1234567890abcdef1234567890abcdef12345678',
      //   value: '0.05',
      //   timestamp: (Date.now() - 86400000) / 1000, // 1 day ago
      // }
    ];
  };

  if (isLoading) return <div>Loading transactions...</div>;

  return (
    <div className="bg-white rounded-lg p-4 w-full">
      <h2 className="text-xl font-bold mb-4">Transaction History</h2>
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {transactions.map((tx) => (
          <div key={tx.hash} className="p-4 bg-gray-100 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm">
                <p>Value: {tx.value} ETH</p>
                <p>toAddress: {tx.to.slice(0,6)}...{tx.to.slice(25)}</p>
              </span>
              <a
                href={`https://sepolia.basescan.org/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                <span className="text-sm">Tx Hash: {tx.hash.slice(0,6)}...{tx.hash.slice(60)}</span>
              </a>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {tx.metadata? new Date(tx.metadata.blockTimestamp).toLocaleString(): ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
