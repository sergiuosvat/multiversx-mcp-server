"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkout_1 = require("../logic/checkout");
describe("createPurchaseTransaction", () => {
    it("should generate a valid transaction payload with default quantity", async () => {
        const payload = await (0, checkout_1.createPurchaseTransaction)("EGLD-123456", 1);
        expect(payload.receiver).toBeDefined();
        expect(payload.value).toBe("1000000000000000000");
        expect(payload.chainID).toBe("1");
        // data: buy@45474c442d313233343536@01@01
        expect(payload.data).toMatch(/^buy@[0-9a-f]+@[0-9a-f]+@[0-9a-f]+$/);
    });
    it("should handle even/odd length hex strings for nonce/quantity", async () => {
        // Nonce 15 -> '0f' (already even), Quantity 16 -> '10' (already even)
        const payload = await (0, checkout_1.createPurchaseTransaction)("TEST-123", 15, 16);
        const parts = payload.data.split("@");
        expect(parts[2]).toBe("0f");
        expect(parts[3]).toBe("10");
        // Nonce 255 -> 'ff', Quantity 256 -> '100' (odd -> '0100')
        const payload2 = await (0, checkout_1.createPurchaseTransaction)("TEST-123", 255, 256);
        const parts2 = payload2.data.split("@");
        expect(parts2[2]).toBe("ff");
        expect(parts2[3]).toBe("0100");
    });
});
