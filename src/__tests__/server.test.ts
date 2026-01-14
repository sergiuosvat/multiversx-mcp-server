import { createMcpServer } from "../server";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

describe("MCP Server Integration", () => {
    let server: any;

    beforeAll(async () => {
        server = createMcpServer();
    });

    it("should handle create_purchase_transaction", async () => {
        const response = await server.request(
            {
                method: "tools/call",
                params: {
                    name: "create_purchase_transaction",
                    arguments: {
                        token_identifier: "TEST-123456",
                        nonce: 1,
                        quantity: 1,
                        marketplace: "default"
                    }
                }
            },
            CallToolRequestSchema
        );

        const content = JSON.parse(response.content[0].text);
        expect(content.data).toContain("buy@");
    });

    it("should handle generate_guarded_tx", async () => {
        const response = await server.request(
            {
                method: "tools/call",
                params: {
                    name: "generate_guarded_tx",
                    arguments: {
                        sender: "erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruq0u46d0", // Valid Bech32
                        receiver: "erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruq0u46d0",
                        value: "0",
                        data: "test",
                        guardian_address: "erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruq0u46d0",
                        nonce: 10
                    }
                }
            },
            CallToolRequestSchema
        );

        const tx = JSON.parse(response.content[0].text);
        // MultiversX SDK Transaction Object structure
        expect(tx.version).toBe(2);
        expect(tx.options).toBe(2); // Guarded
        expect(tx.guardian).toBeDefined();
    });
});
