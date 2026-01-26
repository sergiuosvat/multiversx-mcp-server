import { getAccountBalance, getAccountDetails } from "../logic/accounts";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Account Logic", () => {
    const mockAddress = "erd1spybe369l39qzyv69nyenpcr76zc6pcyasstz9790pbaq26p326q66zue0";
    const mockApiUrl = "https://devnet-api.multiversx.com";

    it("should fetch account balance", async () => {
        mockedAxios.get.mockResolvedValue({
            data: { balance: "1000000000000000000" }
        });

        const balance = await getAccountBalance(mockApiUrl, mockAddress);
        expect(balance).toBe("1000000000000000000");
    });

    it("should fetch full account details", async () => {
        const mockDetails = {
            address: mockAddress,
            balance: "1000000000000000000",
            nonce: 5,
            shard: 1
        };
        mockedAxios.get.mockResolvedValue({ data: mockDetails });

        const details = await getAccountDetails(mockApiUrl, mockAddress);
        expect(details).toEqual(mockDetails);
    });

    it("should handle API errors gracefully", async () => {
        mockedAxios.get.mockRejectedValue(new Error("API Error"));

        await expect(getAccountBalance(mockApiUrl, mockAddress)).rejects.toThrow("Failed to fetch account balance");
    });
});
