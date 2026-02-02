import { z } from "zod";
import { ToolResult } from "../types";

/**
 * Aggregates data from Identity, Reputation, and Validation registries.
 */
export async function getAgentTrustSummary(agentNonce: number): Promise<ToolResult> {
    try {
        // For MVP, we return standardized mock trust data.
        // In production, this would query the reputation and job validation contracts.

        const summary = {
            agent_id: agentNonce,
            reputation_score: 85.5, // 1-100
            total_completed_jobs: 124,
            last_verified_job_timestamp: Math.floor(Date.now() / 1000) - 3600,
            status: "highly_trusted",
            verifications: [
                { registry: "Identity", status: "verified" },
                { registry: "Reputation", status: "active" }
            ]
        };

        return {
            content: [{ type: "text", text: JSON.stringify(summary, null, 2) }]
        };

    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            content: [{ type: "text", text: `Error fetching trust summary: ${message}` }]
        };
    }
}

export const getAgentTrustSummaryToolName = "get-agent-trust-summary";
export const getAgentTrustSummaryToolDescription = "Get aggregated trust and reputation summary for an agent";
export const getAgentTrustSummaryParamScheme = {
    agentNonce: z.number().describe("The Agent ID (NFT Nonce)"),
};
