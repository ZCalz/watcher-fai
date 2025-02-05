
import { CdpAgentkit } from "@coinbase/cdp-agentkit-core";
import { CdpToolkit } from "@coinbase/cdp-langchain";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { useCallback, useEffect, useState } from "react";

export const useCdpAgent = () => {
  const [agent, setAgent] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAgent = async () => {
      try {
        const llm = new ChatOpenAI({
          model: "grok-beta",
          apiKey: process.env.NEXT_PUBLIC_XAI_API_KEY,
          configuration: {
            baseURL: "https://api.x.ai/v1"
          }
        });

        const agentConfig = {
          networkId: process.env.NEXT_PUBLIC_NETWORK_ID || "base-sepolia",
        };

        const agentkit = await CdpAgentkit.configureWithWallet(agentConfig);
        const cdpToolkit = new CdpToolkit(agentkit);
        const tools = cdpToolkit.getTools();
        const memory = new MemorySaver();

        const reactAgent = createReactAgent({
          llm,
          tools,
          checkpointSaver: memory,
          messageModifier:
            "You are a helpful agent that can interact onchain using the Coinbase Developer Platform Agentkit. Be concise and helpful with your responses.",
        });

        setAgent(reactAgent);
        setConfig({ configurable: { thread_id: "CDP Agentkit Chat" } });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize agent");
      }
    };

    initAgent();
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!agent || !config) {
      throw new Error("Agent not initialized");
    }

    const stream = await agent.stream({ messages: [new HumanMessage(message)] }, config);
    const responses = [];

    for await (const chunk of stream) {
      if ("agent" in chunk) {
        responses.push(chunk.agent.messages[0].content);
      } else if ("tools" in chunk) {
        responses.push(chunk.tools.messages[0].content);
      }
    }

    return responses;
  }, [agent, config]);

  return { sendMessage, error, isReady: !!agent && !!config };
};
