import { z } from "zod";
import { ToolResult } from "../types";

/**
 * Returns a list of agents with the highest reputation scores for a specific category.
 */
export async function getTopRatedAgents(
    category: string,
    limit: number = 5
): Promise<ToolResult> {
    try {
        // Mock data for top rated agents
        const agents = [
            {
                id: "AGENT-001",
                nonce: 1,
                name: "Premier Shopping AI",
                category: "shopping",
                reputation_score: 98.5,
                total_completed_jobs: 1500
            },
            {
                id: "AGENT-002",
                nonce: 2,
                name: "DeFi Yield Optimizer",
                category: "finance",
                reputation_score: 97.2,
                total_completed_jobs: 2100
            },
            {
                id: "AGENT-003",
                nonce: 3,
                name: "Travel Planner",
                category: "shopping",
                reputation_score: 95.0,
                total_completed_jobs: 450
            }
        ];

        const filtered = agents
            .filter(a => a.category === category || category === "all")
            .sort((a, b) => b.reputation_score - a.reputation_score)
            .slice(0, limit);

        return {
            content: [{ type: "text", text: JSON.stringify(filtered, null, 2) }]
        };

    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            content: [{ type: "text", text: `Error fetching top agents: ${message}` }]
        };
    }
}

export const getTopRatedAgentsToolName = "get-top-rated-agents";
export const getTopRatedAgentsToolDescription = "Get the highest rated agents for a category";
export const getTopRatedAgentsParamScheme = {
    category: z.string().describe("Agent category (e.g. 'shopping', 'finance')"),
    limit: z.number().optional().default(5).describe("Max results"),
};
