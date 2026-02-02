/**
 * Wallet management for PEM-based signing
 */

import { UserSecretKey, UserSigner } from "@multiversx/sdk-wallet";
import { Address } from "@multiversx/sdk-core";
import * as fs from "fs";

export interface WalletConfig {
    pemPath?: string;
}

export interface LoadedWallet {
    secretKey: UserSecretKey;
    signer: UserSigner;
    address: Address;
}

/**
 * Load wallet configuration from environment variables.
 * MVX_WALLET_PEM: Path to PEM file (required for signing transactions)
 */
export function loadWalletConfig(): WalletConfig {
    return {
        pemPath: process.env.MVX_WALLET_PEM,
    };
}

/**
 * Load wallet from PEM file.
 * @throws Error if PEM file cannot be read or parsed
 */
export function loadWalletFromPem(pemPath: string): LoadedWallet {
    if (!pemPath) {
        throw new Error("MVX_WALLET_PEM environment variable is not set.");
    }

    const pemContent = fs.readFileSync(pemPath, "utf-8");
    const secretKey = UserSecretKey.fromPem(pemContent);
    const signer = new UserSigner(secretKey);
    const publicKey = secretKey.generatePublicKey();
    const address = Address.newFromBech32(publicKey.toAddress().bech32());

    return {
        secretKey,
        signer,
        address,
    };
}

/**
 * Get the address from a loaded wallet as bech32 string.
 */
export function getWalletAddress(wallet: LoadedWallet): string {
    return wallet.address.toBech32();
}
