
import express from "express";
import { CdpAgentkit } from "@coinbase/cdp-agentkit-core";
import { CdpToolkit } from "@coinbase/cdp-langchain";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import * as fs from "fs";
import path from "path";

class AgentServer {
  private app: express.Application;
  private agent: any;
  private agentConfig: any;
  private readonly WALLET_DATA_FILE = "wallet_data.txt";
  private readonly PORT: number;

  constructor() {
    dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
    this.app = express();
    this.PORT = Number(process.env.PORT) || 3001;
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(express.json());
  }

  private setupRoutes() {
    this.app.post("/api/chat", this.handleChat.bind(this));
    this.app.get("/health", (_, res) => res.json({ status: "ok" }));
  }

  private async initializeAgent() {
    const llm = new ChatOpenAI({
      model: "grok-beta",
      apiKey: process.env.XAI_API_KEY,
      configuration: {
        baseURL: "https://api.x.ai/v1"
      }
    });

    let walletDataStr: string | null = null;
    if (fs.existsSync(this.WALLET_DATA_FILE)) {
      walletDataStr = fs.readFileSync(this.WALLET_DATA_FILE, "utf8");
    }

    const config = {
      cdpWalletData: walletDataStr || undefined,
      networkId: process.env.NETWORK_ID || "base-sepolia",
    };

    const agentkit = await CdpAgentkit.configureWithWallet(config);
    const cdpToolkit = new CdpToolkit(agentkit);
    const tools = cdpToolkit.getTools();
    const memory = new MemorySaver();

    this.agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier:
        "You are a helpful agent that can interact onchain using the Coinbase Developer Platform Agentkit...",
    });

    const exportedWallet = await agentkit.exportWallet();
    fs.writeFileSync(this.WALLET_DATA_FILE, exportedWallet);

    this.agentConfig = { configurable: { thread_id: "CDP Agentkit Chatbot Example!" } };
  }

  private async handleChat(req: express.Request, res: express.Response) {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const responses: any[] = [];
      const stream = await this.agent.stream(
        { messages: [new HumanMessage(message)] },
        this.agentConfig
      );

      for await (const chunk of stream) {
        if ("agent" in chunk) {
          responses.push({ type: "agent", content: chunk.agent.messages[0].content });
        } else if ("tools" in chunk) {
          responses.push({ type: "tools", content: chunk.tools.messages[0].content });
        }
      }

      res.json({ responses });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  public async start() {
    try {
      await this.initializeAgent();
      this.app.listen(this.PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${this.PORT}`);
        console.log(`For logs, check the Shell tab in Replit workspace`);
      });
    } catch (error) {
      console.error("Failed to initialize agent:", error);
      console.error("Server will continue running without agent functionality");
    }
  }
}

// Start the server
const server = new AgentServer();
server.start();

export default AgentServer;
