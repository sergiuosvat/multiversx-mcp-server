/**
 * Send ESDT/NFT/SFT tokens to a receiver address
 */

import { z } from "zod";
import { Address, Token, TokenTransfer, TokenTransfersDataBuilder, Transaction, TransactionComputer } from "@multiversx/sdk-core";
import { ToolResult } from "./types";
import { loadNetworkConfig, createNetworkProvider } from "./networkConfig";
import { loadWalletConfig, isSigningEnabled, loadWalletFromPem } from "./walletConfig";
import { DEFAULT_GAS_LIMIT_ESDT } from "./constants";

const txComputer = new TransactionComputer();

/**
 * Create and optionally send an ESDT/NFT/SFT transfer transaction.
 * Supports fungible tokens (nonce=0) and non-fungible/semi-fungible (nonce>0).
 */
export async function sendTokens(
    receiver: string,
    tokenIdentifier: string,
    amount: string,
    nonce?: number
): Promise<ToolResult> {
    let receiverAddr: Address;
    try {
        receiverAddr = Address.newFromBech32(receiver);
    } catch {
        return {
            content: [
                {
                    type: "text",
                    text: "Invalid receiver address format.",
                },
            ],
        };
    }

    const config = loadNetworkConfig();
    const walletConfig = loadWalletConfig();

    // Create token transfer
    const token = new Token({
        identifier: tokenIdentifier,
        nonce: BigInt(nonce || 0),
    });
    const transfer = new TokenTransfer({ token, amount: BigInt(amount) });

    // Build data field using SDK builder
    const builder = new TokenTransfersDataBuilder();
    const dataParts = builder.buildDataPartsForESDTTransfer(transfer);
    const data = new TextEncoder().encode(dataParts.join("@"));

    if (!isSigningEnabled(walletConfig)) {
        // Unsigned mode: return transaction template
        const tx = new Transaction({
            sender: receiverAddr, // placeholder - caller must set
            receiver: receiverAddr,
            data,
            gasLimit: DEFAULT_GAS_LIMIT_ESDT,
            chainID: config.chainId,
            nonce: 0n,
        });

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(
                        {
                            message: "Unsigned transaction. Set sender, nonce, and sign before broadcasting.",
                            transaction: tx.toPlainObject(),
                        },
                        null,
                        2
                    ),
                },
            ],
        };
    }

    // Signed mode: load wallet, create, sign and send
    try {
        const wallet = loadWalletFromPem(walletConfig.pemPath!);
        const api = createNetworkProvider(config);
        const account = await api.getAccount(wallet.address);

        const tx = new Transaction({
            sender: wallet.address,
            receiver: receiverAddr,
            data,
            gasLimit: DEFAULT_GAS_LIMIT_ESDT,
            chainID: config.chainId,
            nonce: account.nonce,
        });

        // Sign the transaction using TransactionComputer
        const bytesToSign = txComputer.computeBytesForSigning(tx);
        const signature = await wallet.signer.sign(bytesToSign);
        tx.signature = signature;

        // Send the transaction
        const txHash = await api.sendTransaction(tx);

        return {
            content: [
                {
                    type: "text",
                    text: `Transaction sent: ${config.explorerUrl}/transactions/${txHash}`,
                },
            ],
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to send tokens: ${message}`,
                },
            ],
        };
    }
}

export const sendTokensToolName = "send-tokens";
export const sendTokensToolDescription = "Send ESDT/NFT/SFT tokens to a receiver address";
export const sendTokensParamScheme = {
    receiver: z.string().describe("The bech32 address of the receiver (erd1...)"),
    tokenIdentifier: z.string().describe("The token identifier (e.g., USDC-c76f1f)"),
    amount: z.string().describe("The amount to send in atomic units"),
    nonce: z.number().optional().describe("Token nonce for NFT/SFT (0 for fungible)"),
};
