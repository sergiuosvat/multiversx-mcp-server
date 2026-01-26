import fs from "fs";
import { UserSigner } from "@multiversx/sdk-core";

/**
 * Loads a wallet address from a PEM file path.
 * Aligned with official MultiversX standards.
 * 
 * @param pemPath Absolute path to the .pem wallet file
 * @returns Bech32 address
 * @throws Error if file not found or invalid
 */
export async function getWalletAddressFromPath(pemPath: string): Promise<string> {
    if (!fs.existsSync(pemPath)) {
        throw new Error("Wallet file not found");
    }

    try {
        const pemContent = fs.readFileSync(pemPath, "utf-8");
        const signer = UserSigner.fromPem(pemContent);
        return signer.getAddress().toBech32();
    } catch (error: any) {
        throw new Error(`Failed to load wallet from PEM: ${error.message}`);
    }
}
