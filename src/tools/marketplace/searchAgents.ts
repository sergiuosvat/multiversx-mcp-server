import { z } from "zod";
import { ToolResult } from "../types";
import { loadNetworkConfig, createNetworkProvider } from "../networkConfig";

/**
 * Semantic search for agents based on capabilities.
 */
export async function searchAgents(
    query: string,
    minTrust?: number,
    limit: number = 5
): Promise<ToolResult> {
    const config = loadNetworkConfig();

    try {
        const api = createNetworkProvider(config);

        try {
            const items: any[] = await api.doGetGeneric(
                `nfts?search=${encodeURIComponent(query)}&size=${limit}&type=NonFungibleESDT`
            );
            const agents = items.map((item: any) => ({
                id: item.identifier,
                nonce: item.nonce,
                name: item.name,
                description: item.metadata?.description || "No description provided",
                reputation_score: 80.0, // Mock score
                trust_level: "verified"
            }));

            // Filter by minTrust if provided (mock filter)
            const filteredAgents = minTrust
                ? agents.filter((a: any) => a.reputation_score >= minTrust)
                : agents;

            return {
                content: [{ type: "text", text: JSON.stringify(filteredAgents, null, 2) }]
            };

        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            return {
                content: [{ type: "text", text: `Error searching agents: ${message}` }]
            };
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            content: [{ type: "text", text: `Error searching agents: ${message}` }]
        };
    }
}

export const searchAgentsToolName = "search-agents";
export const searchAgentsToolDescription = "Search for agents by capabilities or name";
export const searchAgentsParamScheme = {
    query: z.string().describe("Search query (e.g. 'shopping assistant')"),
    minTrust: z.number().optional().describe("Minimum reputation score (1-100)"),
    limit: z.number().optional().default(5).describe("Max results"),
};
