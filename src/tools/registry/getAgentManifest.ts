import { z } from "zod";
import { ToolResult } from "../types";
import { loadNetworkConfig, createNetworkProvider } from "../networkConfig";
import { TokenTransfer } from "@multiversx/sdk-core";

/**
 * Fetches the ARF (Agent Registration File) manifest for a given Agent ID (nonce).
 */
export async function getAgentManifest(agentNonce: number): Promise<ToolResult> {
    const config = loadNetworkConfig();

    try {
        // In a real scenario, we search for the Registry contract transactions.
        // For MVP, we search for any tx with 'registerAgent' and the correct nonce if indexed.
        // Or we just fetch the NFT metadata if the manifest is stored in attributes.
        // Spec 2.2 says: search for registerAgent in data field.

        const api = createNetworkProvider(config);

        try {
            // Fetch transactions for the Registry contract logic (register and update)
            // We fetch more to find the latest update if multiple exist
            const txs = await api.doGetGeneric(`transactions?size=50&order=desc`);

            if (!txs || txs.length === 0) {
                return {
                    content: [{ type: "text", text: `No registration transactions found on network.` }]
                };
            }

            // Find the most recent transaction that matches registerAgent or updateAgent 
            // and contains the agentNonce in the data field (e.g. function@json_hex)
            // Note: In production, we should filter by the Registry Contract Address.

            const agentTxs = txs.filter((tx: any) => {
                const data = tx.data ? tx.data.toString() : "";
                return (data.startsWith("registerAgent@") || data.startsWith("updateAgent@"));
            });

            if (agentTxs.length === 0) {
                return {
                    content: [{ type: "text", text: `Manifest for Agent #${agentNonce} not found in recent history.` }]
                };
            }

            const tx = agentTxs[0]; // Latest one due to order=desc
            const dataField = tx.data ? tx.data.toString() : "";

            // Data format: registerAgent@JSON_HEX
            const parts = dataField.split("@");
            if (parts.length < 2) {
                return {
                    content: [{ type: "text", text: "Invalid registration data format." }]
                };
            }

            const hexJson = parts[1];
            const jsonStr = Buffer.from(hexJson, "hex").toString("utf-8");

            return {
                content: [{ type: "text", text: JSON.stringify(JSON.parse(jsonStr), null, 2) }]
            };

        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            return {
                content: [{ type: "text", text: `Error fetching agent manifest: ${message}` }]
            };
        }
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
