import { z } from "zod";
import { Transaction, TransactionComputer, IPlainTransactionObject } from "@multiversx/sdk-core";
import { ToolResult } from "./types";
import { loadNetworkConfig, createNetworkProvider } from "./networkConfig";
import { loadWalletConfig, loadWalletFromPem } from "./walletConfig";

const txComputer = new TransactionComputer();

/**
 * Acts as a relayer for a signed transaction (RelayedV3).
 * The inner transaction must be already signed by the user.
 * The relayer (this MCP server's wallet) pays for gas by adding its own signature.
 * Requires MVX_WALLET_PEM to be set.
 */
export async function createRelayedV3(
    innerTransaction: any
): Promise<ToolResult> {
    const walletConfig = loadWalletConfig();

    try {
        const config = loadNetworkConfig();
        const relayerWallet = loadWalletFromPem(walletConfig.pemPath!);
        const api = createNetworkProvider(config);

        // Reconstruct inner transaction from plain object
        const tx = Transaction.newFromPlainObject(innerTransaction);

        // Set relayer address (must match the relayer's wallet)
        tx.relayer = relayerWallet.address;

        // Sign the transaction as relayer using TransactionComputer
        const bytesToSign = txComputer.computeBytesForSigning(tx);
        const signature = await relayerWallet.signer.sign(bytesToSign);
        tx.relayerSignature = signature;

        // Send the transaction
        const txHash = await api.sendTransaction(tx);

        return {
            content: [
                {
                    type: "text",
                    text: `RelayedV3 transaction sent: ${config.explorerUrl}/transactions/${txHash}\n\nTransaction Hash: ${txHash}`,
                },
            ],
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            content: [{ type: "text", text: `Failed to create RelayedV3 transaction: ${message}` }],
        };
    }
}

export const createRelayedV3ToolName = "create-relayed-v3";
export const createRelayedV3ToolDescription = "Co-sign a signed inner transaction as a relayer for gas sponsoring (RelayedV3)";
export const createRelayedV3ParamScheme = {
    innerTransaction: z.any().describe("The signed transaction object (as plain JSON)"),
};
