/**
 * Wallet management with configurable signing modes
 */

import { UserSecretKey, UserSigner } from "@multiversx/sdk-wallet";
import { Address } from "@multiversx/sdk-core";
import * as fs from "fs";

export type SigningMode = "unsigned" | "signed";

export interface WalletConfig {
    mode: SigningMode;
    pemPath?: string;
    password?: string;
}

export interface LoadedWallet {
    secretKey: UserSecretKey;
    signer: UserSigner;
    address: Address;
}

/**
 * Load wallet configuration from environment variables.
 * MVX_SIGNING_MODE: unsigned | signed (default: unsigned)
 * MVX_WALLET_PEM: Path to PEM file (required for signed mode)
 * MVX_WALLET_PASSWORD: Optional password for encrypted wallets
 */
export function loadWalletConfig(): WalletConfig {
    return {
        mode: (process.env.MVX_SIGNING_MODE || "unsigned") as SigningMode,
        pemPath: process.env.MVX_WALLET_PEM,
        password: process.env.MVX_WALLET_PASSWORD,
    };
}

/**
 * Check if signing is enabled and wallet is configured.
 */
export function isSigningEnabled(config: WalletConfig): boolean {
    return config.mode === "signed" && !!config.pemPath;
}

/**
 * Load wallet from PEM file.
 * @throws Error if PEM file cannot be read or parsed
 */
export function loadWalletFromPem(pemPath: string): LoadedWallet {
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
