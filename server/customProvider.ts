import { ActionProvider, WalletProvider, Network, CreateAction } from "@coinbase/agentkit";
import { PastProtocolsActionSchema } from "./schemas";
import { z } from "zod";

class PastProtocolsActionProvider extends ActionProvider<WalletProvider> {
    constructor() {
        super("past-protocols", []);
    }

    @CreateAction({
        name: "Protocol Interacted",
        description: "Returns a list of protocols the user has interacted with. Right now it should just return a string",
        schema: PastProtocolsActionSchema,
    })
    async getPastProtocols(_: z.infer<typeof PastProtocolsActionSchema>): Promise<string> {
        return "Testing here";
    }

    supportsNetwork = (network: Network) => true;
}

export const pastProtocolsActionProvider = () => new PastProtocolsActionProvider();