import { createPurchaseTransaction } from "../logic/checkout";

// We assume the real config.json is loaded. 
// Ideally we mock the config, but for integration testing the real config is fine 
// as long as we don't rely on it changing.
// Or we can mock 'fs' to control config content.
// Let's use the real config logic but verify the BEHAVIOR differs.

describe("createPurchaseTransaction (Configurable)", () => {

    it("should use default config when marketplace is missing or default", async () => {
        const payload = await createPurchaseTransaction("TOK-1", 1, 1, "default");

        // Default is 'buy' function path
        expect(payload.data).toMatch(/^buy@/);
        // Expect generic placeholder address if unchanged, or whatever is in config
        // We check that it conforms to the default ABI structure
    });

    it("should use XOXNO config when marketplace='xoxno'", async () => {
        const payload = await createPurchaseTransaction("TOK-1", 1, 1, "xoxno");

        // XOXNO uses 'buy' (same as default currently in our code)
        // But address should be the real XOXNO address
        expect(payload.receiver).toBe("erd1lp3hkcsqcprmvm6sr7a92zcgxyl3hfyqge5zem232j9axvmnr8esrj8shs");
        expect(payload.data).toMatch(/^buy@/);
    });

    it("should use OOX config when marketplace='oox'", async () => {
        const payload = await createPurchaseTransaction("TOK-1", 1, 1, "oox");

        // OOX uses 'buyNft' (per our new config)
        expect(payload.data).toMatch(/^buyNft@/);
        expect(payload.receiver).toContain("erd1oox");
    });

    // New test for Case Insensitivity
    it("should be case insensitive for marketplace name", async () => {
        const payload = await createPurchaseTransaction("TOK-1", 1, 1, "XoXnO");
        expect(payload.receiver).toBe("erd1lp3hkcsqcprmvm6sr7a92zcgxyl3hfyqge5zem232j9axvmnr8esrj8shs");
    });

    // Coverage Tests (Hex Padding)
    it("should handle large nonces (odd length hex)", async () => {
        // 256 -> hex "100" (odd length 3) -> padded "0100"
        const payload = await createPurchaseTransaction("TOK-1", 256, 1);
        // Arg 2 is Nonce
        const args = payload.data.split("@");
        expect(args[2]).toBe("0100");
    });

    it("should handle quantity with even hex length", async () => {
        // 16 -> hex "10" (even length 2) -> "10" (no padding)
        const payload = await createPurchaseTransaction("TOK-1", 1, 16);
        // Arg 3 is Quantity
        const args = payload.data.split("@");
        expect(args[3]).toBe("10");
    });
});
