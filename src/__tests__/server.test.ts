import { createMcpServer } from "../server";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { Address } from "@multiversx/sdk-core";

// We mock the SDK Server to avoid connection issues during tests
const mockSetRequestHandler = jest.fn();
let callToolHandler: any;

jest.mock("@modelcontextprotocol/sdk/server/index.js", () => {
    return {
        Server: jest.fn().mockImplementation(() => {
            return {
                setRequestHandler: (schema: any, handler: any) => {
                    if (schema === CallToolRequestSchema) {
                        callToolHandler = handler;
                    }
                },
                connect: jest.fn(),
            };
        }),
    };
});

describe("MCP Server Integration", () => {
    beforeAll(async () => {
        createMcpServer();
    });

    it("should handle create_purchase_transaction", async () => {
        const response = await callToolHandler({
            params: {
                name: "create_purchase_transaction",
                arguments: {
                    token_identifier: "TEST-123456",
                    nonce: 1,
                    quantity: 1,
                    marketplace: "default"
                }
            }
        });

        const content = JSON.parse(response.content[0].text);
        expect(content.data).toContain("buy@");
    });

    it("should handle generate_guarded_tx", async () => {
        const response = await callToolHandler({
            params: {
                name: "generate_guarded_tx",
                arguments: {
                    sender: Address.newFromHex("0".repeat(63) + "1").toBech32(),
                    receiver: Address.newFromHex("0".repeat(63) + "2").toBech32(),
                    value: "0",
                    data: "test",
                    guardian_address: Address.newFromHex("0".repeat(63) + "3").toBech32(),
                    nonce: 10
                }
            }
        });

        const tx = JSON.parse(response.content[0].text);
        // MultiversX SDK Transaction Object structure (v15 plain object uses strings for some, numbers for others)
        expect(tx.version).toBe(2);
        expect(tx.options).toBe(2);
        expect(Number(tx.nonce)).toBe(10);
        expect(tx.guardian).toBeDefined();
    });
});
