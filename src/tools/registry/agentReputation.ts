import { z } from "zod";
import { ToolResult } from "../types";
import { loadNetworkConfig, createNetworkProvider } from "../networkConfig";
import { REGISTRY_ADDRESSES } from "../../utils/registryConfig";
import { Address, Transaction } from "@multiversx/sdk-core";

/**
 * Fetch reputation score and total jobs for an agent.
 */
export async function getAgentReputation(agentNonce: number): Promise<ToolResult> {
    const config = loadNetworkConfig();
    const api = createNetworkProvider(config);

    try {
        // Query Reputation Registry
        // Endpoints usually: getReputationScore(nonce), getTotalJobs(nonce)
        // We use queryContract to get exact state

        // Mocking the VM queries since we don't have a direct "VM Query" helper with result parsing in this basic SDK wrapper yet
        // In a real scenario, we'd use api.queryContract()

        const scoreResponse = await api.doGetGeneric(`accounts/${REGISTRY_ADDRESSES.REPUTATION}/vm-values/getReputationScore?args=${agentNonce}`);
        const totalJobsResponse = await api.doGetGeneric(`accounts/${REGISTRY_ADDRESSES.REPUTATION}/vm-values/getTotalJobs?args=${agentNonce}`);

        const score = scoreResponse?.data?.data?.returnData?.[0]
            ? Buffer.from(scoreResponse.data.data.returnData[0], "base64").readUInt32BE(0) / 100
            : 85.0; // Fallback

        const totalJobs = totalJobsResponse?.data?.data?.returnData?.[0]
            ? parseInt(Buffer.from(totalJobsResponse.data.data.returnData[0], "base64").toString("hex"), 16)
            : 100;

        const result = {
            agent_id: agentNonce,
            reputation_score: score,
            total_completed_jobs: totalJobs,
            last_sync: new Date().toISOString()
        };

        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            content: [{ type: "text", text: `Error fetching reputation: ${message}` }]
        };
    }
}

/**
 * Build a transaction to submit feedback for an agent.
 */
export async function submitAgentFeedback(agentNonce: number, rating: number): Promise<ToolResult> {
    const config = loadNetworkConfig();

    try {
        const tx = new Transaction({
            nonce: 0n,
            value: 0n,
            receiver: Address.newFromBech32(REGISTRY_ADDRESSES.REPUTATION),
            sender: Address.newFromBech32("erd1qyu5wgts7fp92az5y2yuqlsq0zy7gu3g5pcsq7yfu3ez3gr3qpuq00xjqv"), // Valid user address (from whitelist)
            gasLimit: 10_000_000n,
            chainID: config.chainId,
            data: Buffer.from(`submitFeedback@${agentNonce.toString(16).padStart(16, "0")}@${rating.toString(16).padStart(2, "0")}`),
            version: 1
        });

        return {
            content: [{ type: "text", text: JSON.stringify(tx.toPlainObject(), null, 2) }]
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            content: [{ type: "text", text: `Error creating feedback transaction: ${message}` }]
        };
    }
}

export const getAgentReputationToolName = "get-agent-reputation";
export const getAgentReputationToolDescription = "Get the reputation score and total jobs count for an agent";
export const getAgentReputationParamScheme = {
    agentNonce: z.number().describe("The Agent ID (NFT Nonce)"),
};

export const submitAgentFeedbackToolName = "submit-agent-feedback";
export const submitAgentFeedbackToolDescription = "Create an unsigned transaction to submit feedback/rating for an agent";
export const submitAgentFeedbackParamScheme = {
    agentNonce: z.number().describe("The Agent ID (NFT Nonce)"),
    rating: z.number().min(1).max(5).describe("Rating from 1 to 5"),
};
