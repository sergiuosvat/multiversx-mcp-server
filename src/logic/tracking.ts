import axios from "axios";
import fs from "fs";
import path from "path";

// Load Config
const configPath = path.join(__dirname, "../../src/config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

export interface OrderStatus {
    status: "pending" | "success" | "failed" | "unknown";
    details: string;
    retry_after?: number; // Seconds
}

export async function trackOrder(txHash: string): Promise<OrderStatus> {
    if (!txHash) {
        return { status: "unknown", details: "No hash provided" };
    }

    try {
        const url = `${config.api_url}/transactions/${txHash}`;
        const response = await axios.get(url);
        const tx = response.data;

        // Map MultiversX status to UCP status
        // MvX: pending, success, fail, invalid
        switch (tx.status) {
            case "pending":
            case "reward-reverted": // Edge case where it's technically determining
                return {
                    status: "pending",
                    details: "Transaction is broadcasting or processing.",
                    retry_after: 5
                };
            case "success":
                return {
                    status: "success",
                    details: "Order processed successfully on-chain."
                };
            case "fail":
            case "invalid":
                return {
                    status: "failed",
                    details: `Transaction failed. Error: ${tx.operations?.[0]?.message || "Unknown error"}`
                };
            default:
                // Handle "received" or other interim states
                return {
                    status: "pending",
                    details: `Current status: ${tx.status}`,
                    retry_after: 2
                };
        }
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            // 404 means Propogation Delay (Hasn't hit API yet) -> Return Pending per spec
            return {
                status: "pending",
                details: "Transaction not yet indexed by API (Propagation Delay).",
                retry_after: 5
            };
        }

        return {
            status: "unknown",
            details: `API Error: ${error.message}`
        };
    }
}
