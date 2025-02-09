import express from "express";
import {
  AgentKit,
  CdpWalletProvider,
  wethActionProvider,
  walletActionProvider,
  erc20ActionProvider,
  cdpApiActionProvider,
  cdpWalletActionProvider,
  // alchemyTokenPricesActionProvider,
  pythActionProvider,
} from "@coinbase/agentkit";
import { pastProtocolsActionProvider } from "./customProvider";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import * as fs from "fs";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://0.0.0.0:3000'],
  credentials: true
}));
app.use(express.json());

const WALLET_DATA_FILE = "wallet_data.txt";
let agent: any;
let agentConfig: any;

async function initializeAgent() {
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
  });

  let walletDataStr: string | null = null;
  if (fs.existsSync(WALLET_DATA_FILE)) {
    walletDataStr = fs.readFileSync(WALLET_DATA_FILE, "utf8");
  }

    // Configure CDP Wallet Provider
    const config = {
      apiKeyName: process.env.CDP_API_KEY_NAME,
      apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n",
      ),
      cdpWalletData: walletDataStr || undefined,
      networkId: process.env.NETWORK_ID || "base-sepolia",
    };

  const walletProvider = await CdpWalletProvider.configureWithWallet(config);

  // Initialize AgentKit
  const agentkit = await AgentKit.from({
    walletProvider,
    actionProviders: [
      wethActionProvider(),
      pythActionProvider(),
      walletActionProvider(),
      // alchemyTokenPricesActionProvider({
      //   apiKey: process.env.ALCHEMY_API_KEY
      // }),
      // pastProtocolsActionProvider(),
      erc20ActionProvider(),
      cdpApiActionProvider({
        apiKeyName: process.env.CDP_API_KEY_NAME,
        apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n",
        ),
      }),
      cdpWalletActionProvider({
        apiKeyName: process.env.CDP_API_KEY_NAME,
        apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n",

app.get("/api/wallet-info", async (req, res) => {
  try {
    const walletInfo = await agentkit.walletProvider.getWalletDetails();
    res.json(walletInfo);
  } catch (error) {
    console.error("Wallet info error:", error);
    res.status(500).json({ error: "Failed to fetch wallet info" });
  }
});

        ),
      }),
    ],
  });

  const tools = await getLangChainTools(agentkit);
  const memory = new MemorySaver();

  agent = createReactAgent({
    llm,
    tools,
    checkpointSaver: memory,
    messageModifier:
    `
        You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit. You are 
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the 
        faucet if you are on network ID 'base-sepolia'. If not, you can provide your wallet details and request 
        funds from the user. Before executing your first action, get the wallet details to see what network 
        you're on. If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone 
        asks you to do something you can't do with your currently available tools, you must say so, and 
        encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to 
        docs.cdp.coinbase.com for more information. Be concise and helpful with your responses. Refrain from 
        restating your tools' descriptions unless it is explicitly requested.
    `
  });

  // Save wallet data
  const exportedWallet = await walletProvider.exportWallet();
  fs.writeFileSync(WALLET_DATA_FILE, JSON.stringify(exportedWallet));

  agentConfig = { configurable: { thread_id: "CDP Agentkit Chatbot Example!" } };
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    console.log("Received message:", message);
    if (!message) {
      console.log("no message");
      return res.status(400).json({ error: "Message is required" });
    }

    const responses: any[] = [];
    const stream = await agent.stream({ messages: [new HumanMessage(message.toString())] }, agentConfig);

    console.log("strean: ", stream)
    for await (const chunk of stream) {
          console.log("chunk: ", chunk)
      if ("agent" in chunk) {
        responses.push({ type: "agent", content: chunk.agent.messages[0].content });
      } else if ("tools" in chunk) {
        responses.push({ type: "tools", content: chunk.tools.messages[0].content });
      }
    }

    // console.log("agent: ", agent)
    console.log("respons: ", responses);
    res.json({ responses });
  } catch (error) {
    // console.log("agent2: ", agent)
    console.error("Chat error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3001;

// Initialize agent and start server
const startServer = async () => {
  try {
    await initializeAgent();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    // Don't exit immediately to keep the process alive
    console.error("Server will continue running without agent functionality");
  }
};

startServer();
