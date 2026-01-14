import { Transaction, TransactionPayload, Address } from "@multiversx/sdk-core";

export interface GuardianTxRequest {
    sender: string;
    receiver: string; // Merchant
    value: string;
    data: string;
    guardian_address: string;
    nonce: number;
}

export async function createGuardianTransaction(req: GuardianTxRequest): Promise<any> {
    // 1. Construct Basic Transaction
    const tx = new Transaction({
        nonce: req.nonce,
        value: req.value,
        receiver: new Address(req.receiver),
        sender: new Address(req.sender),
        gasLimit: 50000000, // Safe default for Guardian txs
        data: new TransactionPayload(req.data),
        chainID: "1" // Default Mainnet, config should override
    });

    // 2. Configure for Guardians (Protocol V2)
    tx.setVersion(2);
    // Set "Guarded" option bit (Bit 1)
    // In SDK, TransactionOptions.Guarded = 2
    tx.setOptions(2);

    // 3. Set Guardian Address (Metadata)
    tx.setGuardian(new Address(req.guardian_address));

    return tx.toPlainObject();
}
