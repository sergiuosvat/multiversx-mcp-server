import { getAgentManifest } from "../getAgentManifest";
import { getAgentTrustSummary } from "../getAgentTrustSummary";
import { getAgentReputation, submitAgentFeedback } from "../agentReputation";
import { isJobVerified, submitJobProof, verifyJob } from "../jobValidation";
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
                data: "update_agent@7b226e616d65223a2255706461746564204167656e74227d" // update_agent@{"name":"Updated Agent"}
            };
            (mockApi.doGetGeneric as jest.Mock).mockResolvedValue([mockTxData]);

            const result = await getAgentManifest(1);
            const content = JSON.parse(result.content[0].text);

            expect(content).toEqual({ name: "Updated Agent" });
        });

        it("should fetch and parse agent manifest from registerAgent transaction", async () => {
            const mockTxData = {
                data: "register_agent@7b226e616d65223a2254657374204167656e74227d" // register_agent@{"name":"Test Agent"}
            };
            (mockApi.doGetGeneric as jest.Mock).mockResolvedValue([mockTxData]);

            const result = await getAgentManifest(1);
            const content = JSON.parse(result.content[0].text);

            expect(content).toEqual({ name: "Test Agent" });
            expect(mockApi.doGetGeneric).toHaveBeenCalledWith(expect.stringContaining("transactions?size=50"));
        });

        it("should handle invalid registration data format (invalid hex)", async () => {
            (mockApi.doGetGeneric as jest.Mock).mockResolvedValue([{ data: "register_agent@nothex" }]);
            const result = await getAgentManifest(1);
            expect(result.content[0].text).toContain("Error fetching agent manifest");
        });

        it("should handle missing registration transaction", async () => {
            (mockApi.doGetGeneric as jest.Mock).mockResolvedValue([]);
            const result = await getAgentManifest(999);
            expect(result.content[0].text).toContain("No registration transactions found on network.");
        });

        it("should handle invalid JSON content", async () => {
            (mockApi.doGetGeneric as jest.Mock).mockResolvedValue([{ data: "register_agent@invalidhex" }]);
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
        it("should return trust metrics for an agent using real queries", async () => {
            (mockApi.doGetGeneric as jest.Mock).mockImplementation((url: string) => {
                if (url.includes("getReputationScore")) {
                    return Promise.resolve({ data: { data: { returnData: [Buffer.from([0, 0, 0x23, 0x28]).toString("base64")] } } }); // 9000 -> 90.0
                }
                if (url.includes("getTotalJobs")) {
                    return Promise.resolve({ data: { data: { returnData: [Buffer.from([0, 0, 0, 0x64]).toString("base64")] } } }); // 100
                }
                return Promise.resolve([]);
            });

            const result = await getAgentTrustSummary(1);
            const content = JSON.parse(result.content[0].text);

            expect(content.reputation_score).toBe(90.0);
            expect(content.total_completed_jobs).toBe(100);
            expect(content.status).toBe("highly_trusted");
        });
    });

    describe("agent-reputation", () => {
        it("should return reputation data", async () => {
            (mockApi.doGetGeneric as jest.Mock).mockImplementation((url: string) => {
                if (url.includes("getReputationScore")) {
                    return Promise.resolve({ data: { data: { returnData: [Buffer.from([0, 0, 0x23, 0x28]).toString("base64")] } } }); // 90.0
                }
                if (url.includes("getTotalJobs")) {
                    return Promise.resolve({ data: { data: { returnData: [Buffer.from([0, 0, 0, 0x64]).toString("base64")] } } }); // 100
                }
                return Promise.resolve([]);
            });

            const result = await getAgentReputation(1);
            const content = JSON.parse(result.content[0].text);
            expect(content).toHaveProperty("reputation_score");
            expect(content.reputation_score).toBe(90.0);
        });

        it("should create feedback transaction with default sender", async () => {
            const result = await submitAgentFeedback(1, 5);
            const tx = JSON.parse(result.content[0].text);
            expect(tx.receiver).toBeDefined();
            const decodedData = Buffer.from(tx.data, "base64").toString();
            expect(decodedData).toContain("submit_feedback");
        });

        it("should create feedback transaction with custom sender", async () => {
            const customSender = "erd1qyu5wgts7fp92az5y2yuqlsq0zy7gu3g5pcsq7yfu3ez3gr3qpuq00xjqv";
            const result = await submitAgentFeedback(1, 5, customSender);
            const tx = JSON.parse(result.content[0].text);
            expect(tx.sender).toBe(customSender);
        });
    });

    describe("job-validation", () => {
        it("should check if job is verified", async () => {
            (mockApi.doGetGeneric as jest.Mock).mockResolvedValue({ data: { data: { returnData: [Buffer.from([0x01]).toString("base64")] } } });
            const result = await isJobVerified("job-1");
            const content = JSON.parse(result.content[0].text);
            expect(content.verified).toBe(true);
        });

        it("should create proof transaction with custom sender", async () => {
            const customSender = "erd1qyu5wgts7fp92az5y2yuqlsq0zy7gu3g5pcsq7yfu3ez3gr3qpuq00xjqv";
            const result = await submitJobProof("job-1", "hash", customSender);
            const tx = JSON.parse(result.content[0].text);
            const decodedData = Buffer.from(tx.data, "base64").toString();
            expect(decodedData).toContain("submit_proof");
            expect(tx.sender).toBe(customSender);
        });

        it("should create verify transaction with custom sender", async () => {
            const customSender = "erd1qyu5wgts7fp92az5y2yuqlsq0zy7gu3g5pcsq7yfu3ez3gr3qpuq00xjqv";
            const result = await verifyJob("job-1", true, customSender);
            const tx = JSON.parse(result.content[0].text);
            const decodedData = Buffer.from(tx.data, "base64").toString();
            expect(decodedData).toContain("verify_job");
            expect(tx.sender).toBe(customSender);
        });
    });
});
