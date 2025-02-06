import express from "express";
import { CdpAgentkit } from "@coinbase/cdp-agentkit-core";
import { CdpToolkit } from "@coinbase/cdp-langchain";
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
    model: "grok-beta",
    apiKey: process.env.XAI_API_KEY,
    configuration: {
      baseURL: "https://api.x.ai/v1"
    }
  });

  let walletDataStr: string | null = null;
  if (fs.existsSync(WALLET_DATA_FILE)) {
    walletDataStr = fs.readFileSync(WALLET_DATA_FILE, "utf8");
  }

  const config = {
    cdpWalletData: walletDataStr || undefined,
    networkId: process.env.NETWORK_ID || "base-sepolia",
  };

  const agentkit = await CdpAgentkit.configureWithWallet(config);
  const cdpToolkit = new CdpToolkit(agentkit);
  const tools = cdpToolkit.getTools();
  const memory = new MemorySaver();

  agent = createReactAgent({
    llm,
    tools,
    checkpointSaver: memory,
    messageModifier:
      "You are a helpful agent that can interact onchain using the Coinbase Developer Platform Agentkit. You are empowered to interact onchain using your tools. If you ever need funds, you can request them from the faucet if you are on network ID `base-sepolia`. If not, you can provide your wallet details and request funds from the user. If someone asks you to do something you can't do with your currently available tools, you must say so, and encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to docs.cdp.coinbase.com for more informaton. Be concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.",
  });

  const exportedWallet = await agentkit.exportWallet();
  fs.writeFileSync(WALLET_DATA_FILE, exportedWallet);

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

    for await (const chunk of stream) {
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
