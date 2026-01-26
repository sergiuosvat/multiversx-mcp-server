import { createEgldTransfer, createTokenTransfer } from "../logic/transfers";
import { Address } from "@multiversx/sdk-core";

describe("Transfer Logic", () => {
    // Generate valid addresses from hex to avoid manual bech32 errors
    const mockSender = Address.newFromHex("0".repeat(63) + "1").toBech32();
    const mockReceiver = Address.newFromHex("0".repeat(63) + "2").toBech32();

    it("should create an EGLD transfer transaction", async () => {
        const value = "1000000000000000000"; // 1 EGLD
        const nonce = 42;
        const chainId = "D";

        const tx = await createEgldTransfer({
            sender: mockSender,
            receiver: mockReceiver,
            value,
            nonce,
            chainId
        });

        expect(tx.sender).toBe(mockSender);
        expect(tx.receiver).toBe(mockReceiver);
        expect(tx.value).toBe(value);
        expect(tx.nonce).toBe(nonce);
        expect(tx.chainID).toBe(chainId);
        expect(tx.data).toBeUndefined();
    });

    it("should create a Fungible Token transfer transaction", async () => {
        const tokenIdentifier = "TEST-123456";
        const amount = "100000000"; // 1.00 if 8 decimals
        const nonce = 43;
        const chainId = "D";

        const tx = await createTokenTransfer({
            sender: mockSender,
            receiver: mockReceiver,
            tokenIdentifier,
            amount,
            nonce,
            chainId
        });

        expect(tx.sender).toBe(mockSender);
        expect(tx.receiver).toBe(mockReceiver);
        expect(tx.value).toBe("0");
        const decodedData = Buffer.from(tx.data, "base64").toString();
        expect(decodedData).toContain(`ESDTTransfer@${Buffer.from(tokenIdentifier).toString("hex")}@`);
    });
});
