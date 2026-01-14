import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { searchProducts } from "./logic/search";
import { createPurchaseTransaction } from "./logic/checkout";
import { trackOrder } from "./logic/tracking";
import { createGuardianTransaction } from "./logic/guardians";

export const MCP_SERVER_NAME = "multiversx-mcp-server";
export const MCP_SERVER_VERSION = "0.1.0";

export function createMcpServer() {
    const server = new Server(
        {
            name: MCP_SERVER_NAME,
            version: MCP_SERVER_VERSION,
        },
        {
            capabilities: {
                tools: {},
            },
        }
    );

    server.setRequestHandler(ListToolsRequestSchema, async () => {
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
                            required: ["transaction_hash"],
                        },
                    },
                },
                {
                    name: "generate_guarded_tx",
                    description: "Generate a transaction requiring Guardian Co-Signature.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            sender: { type: "string" },
                            receiver: { type: "string" },
                            value: { type: "string" },
                            data: { type: "string" },
                            guardian_address: { type: "string" },
                            nonce: { type: "number" }
                        },
                        required: ["sender", "receiver", "guardian_address", "nonce"]
                    },
                },
            ],
        };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;

        if (name === "search_products") {
            const { query, collection, limit } = args as any;
            const products = await searchProducts(query, collection, limit);
            return {
                content: [{ type: "text", text: JSON.stringify(products, null, 2) }],
            };
        }

        if (name === "create_purchase_transaction") {
            const { token_identifier, nonce, quantity, marketplace } = args as any;
            const tx = await createPurchaseTransaction(
                token_identifier,
                nonce,
                quantity,
                marketplace
            );
            return {
                content: [{ type: "text", text: JSON.stringify(tx, null, 2) }],
            };
        }

        if (name === "track_order") {
            const { transaction_hash } = args as any;
            const status = await trackOrder(transaction_hash);
            return {
                content: [{ type: "text", text: JSON.stringify(status, null, 2) }],
            };
        }

        if (name === "generate_guarded_tx") {
            const args = request.params.arguments as any;
            const tx = await createGuardianTransaction(args);
            return {
                content: [{ type: "text", text: JSON.stringify(tx, null, 2) }],
            };
        }

        throw new Error(`Unknown tool: ${name}`);
    });

    return server;
}
