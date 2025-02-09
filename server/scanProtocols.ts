import { JsonRpcProvider, ethers } from 'ethers';

// Common DeFi protocol addresses - you can add more
const KNOWN_PROTOCOLS: Record<string, string> = {
    'AAVE V2': '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
    'Uniswap V2 Router': '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    'Uniswap V3 Router': '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    'Compound': '0xc00e94Cb662C3520282E6f5717214004A7f26888',
    'SushiSwap': '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F'
};

interface ProtocolInteraction {
    name: string;
    address: string;
    interactionCount: number;
    firstInteraction: number;
    lastInteraction: number;
}

class ProtocolScanner {
    private provider: JsonRpcProvider;

    constructor(rpcUrl: string) {
        this.provider = new JsonRpcProvider(rpcUrl);
    }

    async getProtocolInteractions(walletAddress: string, startBlock: number = 0): Promise<ProtocolInteraction[]> {
        try {
            const latestBlock = await this.provider.getBlockNumber();
            console.log(`Scanning from block ${startBlock} to ${latestBlock}`);

            const history = await this.getTransactionHistory(walletAddress, startBlock, latestBlock);
            const interactions = await this.analyzeTransactions(history);
            
            return this.formatResults(interactions);
        } catch (error) {
            console.error('Error scanning protocols:', error);
            throw error;
        }
    }

    private async getTransactionHistory(walletAddress: string, startBlock: number, endBlock: number) {
        const sentTxs = await this.provider.getHistory(walletAddress, startBlock, endBlock);

        const receivedLogs = await this.provider.getLogs({
            address: null,
            topics: [
                null,
                ethers.hexZeroPad(walletAddress.toLowerCase(), 32)
            ],
            fromBlock: startBlock,
            toBlock: endBlock
        });

        return { sentTxs, receivedLogs };
    }

    private async analyzeTransactions(history: { 
        sentTxs: ethers.TransactionResponse[], 
        receivedLogs: ethers.Log[] 
    }): Promise<Map<string, ProtocolInteraction>> {
        const { sentTxs, receivedLogs } = history;
        const interactions = new Map<string, ProtocolInteraction>();

        // Analyze sent transactions
        for (const tx of sentTxs) {
            if (tx.to) {
                const protocolName = this.identifyProtocol(tx.to);
                if (protocolName) {
                    if (!interactions.has(tx.to)) {
                        interactions.set(tx.to, {
                            name: protocolName,
                            address: tx.to,
                            interactionCount: 0,
                            firstInteraction: tx.timestamp!,
                            lastInteraction: tx.timestamp!
                        });
                    }
                    const protocol = interactions.get(tx.to)!;
                    protocol.interactionCount++;
                    protocol.lastInteraction = Math.max(protocol.lastInteraction, tx.timestamp!);
                }
            }
        }

        // Analyze received events
        for (const log of receivedLogs) {
            const protocolName = this.identifyProtocol(log.address);
            if (protocolName) {
                if (!interactions.has(log.address)) {
                    const block = await this.provider.getBlock(log.blockNumber);
                    interactions.set(log.address, {
                        name: protocolName,
                        address: log.address,
                        interactionCount: 0,
                        firstInteraction: block!.timestamp,
                        lastInteraction: block!.timestamp
                    });
                }
                const protocol = interactions.get(log.address)!;
                protocol.interactionCount++;
            }
        }

        return interactions;
    }

    private identifyProtocol(address: string): string | null {
        for (const [name, protocolAddress] of Object.entries(KNOWN_PROTOCOLS)) {
            if (address.toLowerCase() === protocolAddress.toLowerCase()) {
                return name;
            }
        }
        return null;
    }

    private formatResults(interactions: Map<string, ProtocolInteraction>) {
        return Array.from(interactions.values()).map(protocol => ({
            name: protocol.name,
            address: protocol.address,
            interactionCount: protocol.interactionCount,
            firstInteraction: new Date(protocol.firstInteraction * 1000).toISOString(),
            lastInteraction: new Date(protocol.lastInteraction * 1000).toISOString()
        }));
    }
}

export { ProtocolScanner };