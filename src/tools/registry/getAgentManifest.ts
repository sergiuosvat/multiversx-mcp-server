import { z } from "zod";
import { ToolResult } from "../types";
import { loadNetworkConfig, createNetworkProvider } from "../networkConfig";

/**
 * Fetches the ARF (Agent Registration File) manifest for a given Agent ID (nonce).
 * 
 * Data format: register_agent@<nameHex>@<uriHex>@<publicKeyHex>[@metadata...]
 * Data format: update_agent@<nonceHex>@<uriHex>@<publicKeyHex>[@metadata...]
 */
export async function getAgentManifest(agentNonce: number): Promise<ToolResult> {
    const config = loadNetworkConfig();

    try {
        const api = createNetworkProvider(config);

        // Fetch transactions for the Registry contract
        const txs = await api.doGetGeneric(`transactions?size=50&order=desc`);

        if (!txs || txs.length === 0) {
            return {
                content: [{ type: "text", text: `No registration transactions found on network.` }]
            };
        }

        // Filter for agent registration/update transactions
        const agentTxs = txs.filter((tx: any) => {
            const data = tx.data ? tx.data.toString() : "";
            return (data.startsWith("register_agent@") || data.startsWith("update_agent@"));
        });

        if (agentTxs.length === 0) {
            return {
                content: [{ type: "text", text: `Manifest for Agent #${agentNonce} not found in recent history.` }]
            };
        }

        const tx = agentTxs[0];
        const dataField = tx.data ? tx.data.toString() : "";
        const parts = dataField.split("@");

        // Format: register_agent@name@uri@pk[@metadata...] (4+ parts)
        // Format: update_agent@nonce@uri@pk[@metadata...] (4+ parts)
        if (parts.length < 4) {
            return {
                content: [{ type: "text", text: "Invalid registration data format. Expected: function@name@uri@pk" }]
            };
        }

        const isRegistration = dataField.startsWith("register_agent@");
        const nameOrNonce = Buffer.from(parts[1], "hex").toString("utf-8");
        const uri = Buffer.from(parts[2], "hex").toString("utf-8");
        const publicKey = parts[3];

        let manifest: any = {
            name: isRegistration ? nameOrNonce : `Agent #${nameOrNonce}`,
            uri: uri,
            public_key: publicKey
        };

        // If URI is a base64 data URI, resolve it inline
        if (uri.startsWith("data:application/json;base64,")) {
            try {
                const base64Data = uri.replace("data:application/json;base64,", "");
                const jsonStr = Buffer.from(base64Data, "base64").toString("utf-8");
                const arfData = JSON.parse(jsonStr);
                manifest = { ...manifest, ...arfData };
            } catch {
                // URI is not resolvable inline
            }
        }

        return {
            content: [{ type: "text", text: JSON.stringify(manifest, null, 2) }]
        };

    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            content: [{ type: "text", text: `Error fetching agent manifest: ${message}` }]
        };
    }
}

export const getAgentManifestToolName = "get-agent-manifest";
export const getAgentManifestToolDescription = "Fetch the Agent Registration File (ARF) manifest";
export const getAgentManifestParamScheme = {
    agentNonce: z.number().describe("The Agent ID (NFT Nonce)"),
};
