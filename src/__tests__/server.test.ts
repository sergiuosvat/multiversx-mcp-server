// Mock the SDK Server class BEFORE imports
const mockSetRequestHandler = jest.fn();
jest.mock("@modelcontextprotocol/sdk/server/index.js", () => {
    return {
        Server: jest.fn().mockImplementation(() => {
            return {
                setRequestHandler: mockSetRequestHandler,
                connect: jest.fn(),
            };
        }),
    };
});

import { createMcpServer } from "../server";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { searchProducts } from "../logic/search"; // No .js needed due to mapper
import { createPurchaseTransaction } from "../logic/checkout";
import { trackOrder } from "../logic/tracking";

// Mock Logic
jest.mock("../logic/search");
jest.mock("../logic/checkout");
jest.mock("../logic/tracking");

describe("MCP Server Integration", () => {
    let server: any;

    beforeEach(() => {
        jest.clearAllMocks();
        server = createMcpServer();
    });

    it("should list all available tools", async () => {
        // Find the handler for ListToolsRequestSchema
        const call = mockSetRequestHandler.mock.calls.find(
            (c) => c[0] === ListToolsRequestSchema
        );
        expect(call).toBeDefined();

        const handler = call[1];
        const result = await handler();

        expect(result.tools).toHaveLength(3);
        expect(result.tools[0].name).toBe("search_products");
    });

    it("should route search_products correctly", async () => {
        const call = mockSetRequestHandler.mock.calls.find(
            (c) => c[0] === CallToolRequestSchema
        );
        const handler = call[1];

        (searchProducts as jest.Mock).mockResolvedValue([{ id: "test" }]);

        const response = await handler({
            params: {
                name: "search_products",
                arguments: { query: "test" }
            }
        });

        expect(searchProducts).toHaveBeenCalledWith("test", undefined, undefined);
        expect(JSON.parse(response.content[0].text)).toEqual([{ id: "test" }]);
    });

    it("should route create_purchase_transaction correctly", async () => {
        const call = mockSetRequestHandler.mock.calls.find(
            (c) => c[0] === CallToolRequestSchema
        );
        const handler = call[1];

        (createPurchaseTransaction as jest.Mock).mockResolvedValue({ data: "tx" });

        const response = await handler({
            params: {
                name: "create_purchase_transaction",
                arguments: { token_identifier: "T", nonce: 1, quantity: 1 }
            }
        });

        expect(createPurchaseTransaction).toHaveBeenCalledWith("T", 1, 1, undefined);
        expect(JSON.parse(response.content[0].text)).toEqual({ data: "tx" });
    });

    it("should route track_order correctly", async () => {
        const call = mockSetRequestHandler.mock.calls.find(
            (c) => c[0] === CallToolRequestSchema
        );
        const handler = call[1];

        (trackOrder as jest.Mock).mockResolvedValue({ status: "success" });

        const response = await handler({
            params: {
                name: "track_order",
                arguments: { transaction_hash: "hash" }
            }
        });

        expect(trackOrder).toHaveBeenCalledWith("hash");
        expect(JSON.parse(response.content[0].text)).toEqual({ status: "success" });
    });

    it("should throw on unknown tool", async () => {
        const call = mockSetRequestHandler.mock.calls.find(
            (c) => c[0] === CallToolRequestSchema
        );
        const handler = call[1];

        await expect(handler({
            params: {
                name: "unknown_tool",
                arguments: {}
            }
        })).rejects.toThrow("Unknown tool: unknown_tool");
    });
});
