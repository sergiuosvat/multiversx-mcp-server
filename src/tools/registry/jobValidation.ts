import { z } from "zod";
import { ToolResult } from "../types";
import { loadNetworkConfig, createNetworkProvider } from "../networkConfig";
import { REGISTRY_ADDRESSES } from "../../utils/registryConfig";
import { Address, Transaction } from "@multiversx/sdk-core";

/**
 * Check if a specific job has been verified on-chain.
 */
export async function isJobVerified(jobId: string): Promise<ToolResult> {
    const config = loadNetworkConfig();
    const api = createNetworkProvider(config);

    try {
        // Query Validation Registry
        // Endpoint: is_job_verified(jobId)
        const response = await api.doGetGeneric(`accounts/${REGISTRY_ADDRESSES.VALIDATION}/vm-values/is_job_verified?args=${jobId}`);

        const isVerified = response?.data?.data?.returnData?.[0]
            ? Buffer.from(response.data.data.returnData[0], "base64")[0] === 1
            : false;

        return {
            content: [{
                type: "text",
                text: JSON.stringify({ job_id: jobId, verified: isVerified }, null, 2)
            }]
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            content: [{ type: "text", text: `Error checking job status: ${message}` }]
        };
    }
}

/**
 * Build a transaction to submit a proof for a job (Agent only).
 */
export async function submitJobProof(jobId: string, proofHash: string): Promise<ToolResult> {
    const config = loadNetworkConfig();

    try {
        const tx = new Transaction({
            nonce: 0n,
            value: 0n,
            receiver: Address.newFromBech32(REGISTRY_ADDRESSES.VALIDATION),
            sender: Address.newFromBech32("erd1qyu5wgts7fp92az5y2yuqlsq0zy7gu3g5pcsq7yfu3ez3gr3qpuq00xjqv"), // Placeholder
            gasLimit: 15_000_000n,
            chainID: config.chainId,
            data: Buffer.from(`submitProof@${jobId}@${proofHash}`),
            version: 1
        });

        return {
            content: [{ type: "text", text: JSON.stringify(tx.toPlainObject(), null, 2) }]
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            content: [{ type: "text", text: `Error creating proof transaction: ${message}` }]
        };
    }
}

/**
 * Build a transaction to verify a job (Oracle/Validator only).
 */
export async function verifyJob(jobId: string, status: boolean): Promise<ToolResult> {
    const config = loadNetworkConfig();

    try {
        const statusHex = status ? "01" : "00";
        const tx = new Transaction({
            nonce: 0n,
            value: 0n,
            receiver: Address.newFromBech32(REGISTRY_ADDRESSES.VALIDATION),
            sender: Address.newFromBech32("erd1qyu5wgts7fp92az5y2yuqlsq0zy7gu3g5pcsq7yfu3ez3gr3qpuq00xjqv"), // Placeholder
            gasLimit: 10_000_000n,
            chainID: config.chainId,
            data: Buffer.from(`verifyJob@${jobId}@${statusHex}`),
            version: 1
        });

        return {
            content: [{ type: "text", text: JSON.stringify(tx.toPlainObject(), null, 2) }]
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            content: [{ type: "text", text: `Error creating verify transaction: ${message}` }]
        };
    }
}

export const isJobVerifiedToolName = "is-job-verified";
export const isJobVerifiedToolDescription = "Check if a job ID has been cryptographically verified by an Oracle";
export const isJobVerifiedParamScheme = {
    jobId: z.string().describe("The unique Job ID to check"),
};

export const submitJobProofToolName = "submit-job-proof";
export const submitJobProofToolDescription = "Create an unsigned transaction to submit job proof (Agent only)";
export const submitJobProofParamScheme = {
    jobId: z.string().describe("The Job ID"),
    proofHash: z.string().describe("Hash of the result data to prove"),
};

export const verifyJobToolName = "verify-job";
export const verifyJobToolDescription = "Create an unsigned transaction to finalize job verification (Oracle only)";
export const verifyJobParamScheme = {
    jobId: z.string().describe("The Job ID to verify"),
    status: z.boolean().describe("True for success, False for failure"),
};
