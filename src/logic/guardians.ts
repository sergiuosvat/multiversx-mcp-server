import { Transaction, Address } from "@multiversx/sdk-core";

export interface GuardianTxRequest {
    sender: string;
    receiver: string; // Merchant
    value: string;
    data: string;
    guardian_address: string;
    nonce: number;
}

/**
 * Creates a transaction requiring Guardian Co-Signature.
 * Compatibility fix for sdk-core v15.3.2.
 */
export async function createGuardianTransaction(req: GuardianTxRequest): Promise<any> {
    const data = new TextEncoder().encode(req.data);

    // 1. Construct Basic Transaction
    const tx = new Transaction({
        nonce: BigInt(req.nonce),
        value: BigInt(req.value),
        receiver: Address.newFromBech32(req.receiver),
        sender: Address.newFromBech32(req.sender),
        gasLimit: BigInt(50000000), // Safe default for Guardian txs
        data: data,
        chainID: "1", // Default Mainnet, config should override
        version: 2, // Protocol V2
        options: 2, // Guarded option bit (Bit 1)
        guardian: Address.newFromBech32(req.guardian_address)
    });

    return tx.toPlainObject();
}
