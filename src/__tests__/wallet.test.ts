import { getWalletAddressFromPath } from "../logic/wallet";
import fs from "fs";
import path from "path";

// Mock FS to simulate PEM file
jest.mock("fs");

describe("Wallet Logic", () => {
    const mockPemContent = `-----BEGIN PRIVATE KEY for erd1spybe369l39qzyv69nyenpcr76zc6pcyasstz9790pbaq26p326q66zue0-----
NDhiNGNmOGI2ZThhNTE0ZjA4ZGNlZDA1OGE0YzU0YjA3MDQ4ZjM0NzhiZDk2YjFiNDFlYzE1Zjg1NjBhMjBlNjEwMmI1YTA5NmRiZDU5MzBiNTk0OWNiMzRhMGFlYjc0OGJjN2M2NjFlNGE0ZDRhNmZlZTk4NWNlNDYxYmMwMjg=
-----END PRIVATE KEY for erd1spybe369l39qzyv69nyenpcr76zc6pcyasstz9790pbaq26p326q66zue0-----`;
    const mockAddress = "erd1hkda8gjycurkg2pr6zj8uyqssegtd6ymp5w58ss0ku6dkh5pxnmqhwj6ps";

    it("should load a valid PEM and return the target address", async () => {
        (fs.readFileSync as jest.Mock).mockReturnValue(mockPemContent);
        (fs.existsSync as jest.Mock).mockReturnValue(true);

        const address = await getWalletAddressFromPath("/fake/path.pem");
        expect(address).toBe(mockAddress);
    });

    it("should throw error if PEM file does not exist", async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(false);

        await expect(getWalletAddressFromPath("/invalid/path.pem")).rejects.toThrow("Wallet file not found");
    });

    it("should throw error if PEM file is invalid", async () => {
        (fs.readFileSync as jest.Mock).mockReturnValue("invalid content");
        (fs.existsSync as jest.Mock).mockReturnValue(true);

        await expect(getWalletAddressFromPath("/fake/path.pem")).rejects.toThrow();
    });
});
