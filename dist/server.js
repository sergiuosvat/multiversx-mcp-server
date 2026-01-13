"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCP_SERVER_VERSION = exports.MCP_SERVER_NAME = void 0;
exports.createMcpServer = createMcpServer;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const search_1 = require("./logic/search");
const checkout_1 = require("./logic/checkout");
const tracking_1 = require("./logic/tracking");
exports.MCP_SERVER_NAME = "multiversx-mcp-server";
exports.MCP_SERVER_VERSION = "0.1.0";
function createMcpServer() {
    const server = new index_js_1.Server({
        name: exports.MCP_SERVER_NAME,
        version: exports.MCP_SERVER_VERSION,
    }, {
        capabilities: {
            tools: {},
        },
    });
    server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
        return {
            tools: [
                {
                    name: "search_products",
                    description: "Search for NFTs or Tokens on MultiversX using criteria.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            query: { type: "string" },
                            collection: { type: "string" },
                            limit: { type: "number" },
                        },
                        required: ["query"],
                    },
                },
                {
                    name: "create_purchase_transaction",
                    description: "Generate an unsigned buy transaction for an item.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            token_identifier: { type: "string" },
                            nonce: { type: "number" },
                            quantity: { type: "number" },
                            marketplace: { type: "string", description: "Target marketplace (default, xoxno, oox)" }
                        },
                        required: ["token_identifier", "nonce"],
                    },
                },
                {
                    name: "track_order",
                    description: "Check the status of a blockchain transaction.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            transaction_hash: { type: "string" },
                        },
                        required: ["transaction_hash"],
                    },
                },
            ],
        };
    });
    server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        if (name === "search_products") {
            const { query, collection, limit } = args;
            const products = await (0, search_1.searchProducts)(query, collection, limit);
            return {
                content: [{ type: "text", text: JSON.stringify(products, null, 2) }],
            };
        }
        if (name === "create_purchase_transaction") {
            const { token_identifier, nonce, quantity, marketplace } = args;
            const tx = await (0, checkout_1.createPurchaseTransaction)(token_identifier, nonce, quantity, marketplace);
            return {
                content: [{ type: "text", text: JSON.stringify(tx, null, 2) }],
            };
        }
        if (name === "track_order") {
            const { transaction_hash } = args;
            const status = await (0, tracking_1.trackOrder)(transaction_hash);
            return {
                content: [{ type: "text", text: JSON.stringify(status, null, 2) }],
            };
        }
        throw new Error(`Unknown tool: ${name}`);
    });
    return server;
}
