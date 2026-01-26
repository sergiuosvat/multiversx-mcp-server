import {
    Address,
    Transaction,
    Token,
    TokenTransfer,
    TokenTransfersDataBuilder
} from "@multiversx/sdk-core";

export interface TransferBase {
    sender: string;
    receiver: string;
    nonce: number;
    chainId: string;
    gasLimit?: number;
    gasPrice?: number;
}

export interface EgldTransfer extends TransferBase {
    value: string;
}

export interface TokenTransferParams extends TransferBase {
    tokenIdentifier: string;
    amount: string;
}

/**
 * Creates an unsigned EGLD transfer transaction.
 */
export async function createEgldTransfer(params: EgldTransfer): Promise<any> {
    const tx = new Transaction({
        sender: Address.newFromBech32(params.sender),
        receiver: Address.newFromBech32(params.receiver),
        value: BigInt(params.value),
        nonce: BigInt(params.nonce),
        gasLimit: BigInt(params.gasLimit || 50000),
        chainID: params.chainId,
    });

    return tx.toPlainObject();
}

/**
 * Creates an unsigned ESDT transfer transaction.
 */
export async function createTokenTransfer(params: TokenTransferParams): Promise<any> {
    const token = new Token({ identifier: params.tokenIdentifier });
    const transfer = new TokenTransfer({
        token,
        amount: BigInt(params.amount)
    });

    const builder = new TokenTransfersDataBuilder();
    const dataParts = builder.buildDataPartsForESDTTransfer(transfer);
    const data = new TextEncoder().encode(dataParts.join("@"));

    const tx = new Transaction({
        sender: Address.newFromBech32(params.sender),
        receiver: Address.newFromBech32(params.receiver),
        data,
        gasLimit: BigInt(params.gasLimit || 500000),
        nonce: BigInt(params.nonce),
        chainID: params.chainId,
    });

    return tx.toPlainObject();
}
