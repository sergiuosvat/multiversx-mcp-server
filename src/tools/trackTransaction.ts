/**
 * Track transaction status
 */

import { z } from "zod";
import { ToolResult } from "./types";
import { loadNetworkConfig, createNetworkProvider } from "./networkConfig";

export interface OrderStatus {
    status: "pending" | "success" | "failed" | "unknown";
    details: string;
    retry_after?: number; // Seconds
}

/**
 * Track the status of a transaction hash.
 * Maps MultiversX status to simplified pending/success/failed.
 */
export async function trackTransaction(txHash: string): Promise<ToolResult> {
    if (!txHash) {
        return {
            content: [{ type: "text", text: JSON.stringify({ status: "unknown", details: "No hash provided" }) }],
        };
    }

    try {
        const config = loadNetworkConfig();
        const api = createNetworkProvider(config);

        // Get transaction status
        // ApiNetworkProvider.getTransaction returns the full tx object with status
        let tx;
        try {
            tx = await api.getTransaction(txHash);
        } catch (e: any) {
            if (e.response?.status === 404) {
                // Propagation delay
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(
                                {
                                    status: "pending",
                                    details: "Transaction not yet indexed by API (Propagation Delay).",
                                    retry_after: 5,
                                },
                                null,
                                2
                            ),
                        },
                    ],
                };
            }
            throw e;
        }

        const status = tx.status.toString();
        const result: OrderStatus = {
            status: "unknown",
            details: `Current status: ${status}`,
        };

        switch (status) {
            case "pending":
            case "reward-reverted":
                result.status = "pending";
                result.details = "Transaction is broadcasting or processing.";
                result.retry_after = 5;
                break;
            case "success":
                result.status = "success";
                result.details = "Transaction processed successfully on-chain.";
                break;
            case "fail":
            case "invalid":
                result.status = "failed";
                // Try to get operations message or logs if available in SDK object, otherwise simplified
                result.details = `Transaction failed. Status: ${status}`;
                break;
            default:
                result.status = "pending";
                result.retry_after = 2;
                break;
        }

        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ status: "unknown", details: `API Error: ${message}` }),
                },
            ],
        };
    }
}

export const trackTransactionToolName = "track-transaction";
export const trackTransactionToolDescription = "Track the status of a transaction hash";
export const trackTransactionParamScheme = {
    txHash: z.string().describe("The transaction hash to track"),
};
