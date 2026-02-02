import { z } from "zod";
import { ToolResult } from "../types";
import { loadNetworkConfig } from "../networkConfig";
import { Transaction, Address } from "@multiversx/sdk-core";

/**
 * Creates an unsigned transaction for purchasing a product (NFT/SFT).
 * returns a standardized JSON object for interactive signing.
 */
export async function createPurchaseTransaction(params: {
    tokenIdentifier: string;
    nonce: number;
    quantity: number;
    receiver: string;
    price: string;
}): Promise<ToolResult> {
    const config = loadNetworkConfig();

    try {
        // Construct the purchase transaction.
        // For MultiversX marketplaces, this is typically an ESDTNFTTransfer call.
        // Data format: ESDTNFTTransfer@TokenID_HEX@Nonce_HEX@Quantity_HEX@Receiver_ADDR_HEX@Function_HEX@Args_HEX

        const tokenIdentifierHex = Buffer.from(params.tokenIdentifier).toString("hex");
        const nonceHex = params.nonce.toString(16).padStart(2, "0");

        const data = `buy@${tokenIdentifierHex}@${nonceHex}`;

        const tx = new Transaction({
            nonce: 0n,
            value: BigInt(params.price),
            receiver: Address.newFromBech32(params.receiver),
            sender: Address.newFromBech32("erd1qqqqqqqqqqqqqpgqfzydqrew7dr666u64q60zk98v665v7f5pccshv882p"), // Valid placeholder
            gasLimit: 10_000_000n,
            chainID: config.chainId,
            data: Buffer.from(data),
            version: 1,
        });

        // Convert to a format that signing providers expect (Plain object)
        const txJson = tx.toPlainObject();

        return {
            content: [{ type: "text", text: JSON.stringify(txJson, null, 2) }]
        };

    } catch (error) {
        console.error("Error in createPurchaseTransaction:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            content: [{ type: "text", text: `Error creating purchase transaction: ${message}` }]
        };
    }
}

export const createPurchaseTransactionToolName = "create-purchase-transaction";
export const createPurchaseTransactionToolDescription = "Create an unsigned transaction for interactive product purchase";
export const createPurchaseTransactionParamScheme = {
    tokenIdentifier: z.string().describe("The token identifier (e.g. TICKER-123456)"),
    nonce: z.number().describe("The NFT/SFT nonce"),
    quantity: z.number().describe("Quantity to purchase"),
    receiver: z.string().describe("The marketplace or contract address"),
    price: z.string().describe("The price in atomic units (e.g. 1000000000000000000 for 1 EGLD)")
};
