import { getAgentManifest } from "../getAgentManifest";
import { getAgentTrustSummary } from "../getAgentTrustSummary";
import { createNetworkProvider } from "../../networkConfig";

jest.mock("../../networkConfig", () => ({
    loadNetworkConfig: jest.fn().mockReturnValue({ apiUrl: "https://api.testnet.multiversx.com", chainId: "T" }),
    createNetworkProvider: jest.fn().mockReturnValue({
        doGetGeneric: jest.fn(),
    })
}));

describe("Registry Tools", () => {
    const mockApi = createNetworkProvider({} as any);

    describe("get-agent-manifest", () => {
        it("should fetch and parse agent manifest from updateAgent transaction", async () => {
            const mockTxData = {
                data: "updateAgent@7b226e616d65223a2255706461746564204167656e74227d" // updateAgent@{"name":"Updated Agent"}
            };
            (mockApi.doGetGeneric as jest.Mock).mockResolvedValue([mockTxData]);

            const result = await getAgentManifest(1);
            const content = JSON.parse(result.content[0].text);

            expect(content).toEqual({ name: "Updated Agent" });
        });

        it("should fetch and parse agent manifest from registerAgent transaction", async () => {
            const mockTxData = {
                data: "registerAgent@7b226e616d65223a2254657374204167656e74227d" // registerAgent@{"name":"Test Agent"}
            };
            (mockApi.doGetGeneric as jest.Mock).mockResolvedValue([mockTxData]);

            const result = await getAgentManifest(1);
            const content = JSON.parse(result.content[0].text);

            expect(content).toEqual({ name: "Test Agent" });
            expect(mockApi.doGetGeneric).toHaveBeenCalledWith(expect.stringContaining("transactions?size=50"));
        });

        it("should handle invalid registration data format (invalid hex)", async () => {
            (mockApi.doGetGeneric as jest.Mock).mockResolvedValue([{ data: "registerAgent@nothex" }]);
            const result = await getAgentManifest(1);
            expect(result.content[0].text).toContain("Error fetching agent manifest");
        });

        it("should handle missing registration transaction", async () => {
            (mockApi.doGetGeneric as jest.Mock).mockResolvedValue([]);
            const result = await getAgentManifest(999);
            expect(result.content[0].text).toContain("No registration transactions found on network.");
        });

        it("should handle invalid JSON content", async () => {
            (mockApi.doGetGeneric as jest.Mock).mockResolvedValue([{ data: "registerAgent@invalidhex" }]);
            const result = await getAgentManifest(1);
            expect(result.content[0].text).toContain("Error fetching agent manifest");
        });

        it("should handle API errors", async () => {
            (mockApi.doGetGeneric as jest.Mock).mockRejectedValue(new Error("Network Error"));
            const result = await getAgentManifest(1);
            expect(result.content[0].text).toContain("Error fetching agent manifest: Network Error");
        });
    });

    describe("get-agent-trust-summary", () => {
        it("should return trust metrics for an agent", async () => {
            const result = await getAgentTrustSummary(1);
            const content = JSON.parse(result.content[0].text);

            expect(content).toHaveProperty("reputation_score");
            expect(content).toHaveProperty("total_completed_jobs");
        });
    });
});
