import { searchAgents } from "../searchAgents";
import { getTopRatedAgents } from "../getTopRatedAgents";
import { createNetworkProvider } from "../../networkConfig";

jest.mock("../../networkConfig", () => ({
    loadNetworkConfig: jest.fn().mockReturnValue({ apiUrl: "https://api.testnet.multiversx.com", chainId: "T" }),
    createNetworkProvider: jest.fn().mockReturnValue({
        doGetGeneric: jest.fn(),
    })
}));

describe("Marketplace Tools", () => {
    const mockApi = createNetworkProvider({} as any);

    describe("search-agents", () => {
        it("should return a list of agents matching the query", async () => {
            (mockApi.doGetGeneric as jest.Mock).mockResolvedValue([
                { identifier: "AGENT-123", nonce: 123, name: "Shopping Assistant" },
                { identifier: "AGENT-456", nonce: 456, name: "DeFi Bot" }
            ]);

            const result = await searchAgents("shopping");
            const content = JSON.parse(result.content[0].text);

            expect(content.length).toBeGreaterThan(0);
            expect(content[0].name).toContain("Assistant");
            expect(mockApi.doGetGeneric).toHaveBeenCalledWith(expect.stringContaining("nfts"));
        });

        it("should handle empty search results", async () => {
            (mockApi.doGetGeneric as jest.Mock).mockResolvedValue([]);
            const result = await searchAgents("unknown");
            const content = JSON.parse(result.content[0].text);
            expect(content).toEqual([]);
        });
    });

    describe("get-top-rated-agents", () => {
        it("should return top rated agents for a category", async () => {
            const result = await getTopRatedAgents("shopping", 2);
            const content = JSON.parse(result.content[0].text);

            expect(content.length).toBeLessThanOrEqual(2);
            expect(content[0]).toHaveProperty("reputation_score");
        });
    });
});
