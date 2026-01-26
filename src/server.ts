import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { searchProducts } from "./logic/search";
import { createPurchaseTransaction } from "./logic/checkout";
import { trackOrder } from "./logic/tracking";
import { createGuardianTransaction } from "./logic/guardians";
import { getWalletAddressFromPath } from "./logic/wallet";
import { getAccountBalance, getAccountDetails } from "./logic/accounts";
import { createEgldTransfer, createTokenTransfer } from "./logic/transfers";

export const MCP_SERVER_NAME = "multiversx-mcp-server";
export const MCP_SERVER_VERSION = "0.1.0";

const NETWORK_API_URLS: Record<string, string> = {
    mainnet: "https://api.multiversx.com",
    devnet: "https://devnet-api.multiversx.com",
    testnet: "https://testnet-api.multiversx.com",
};

const NETWORK_CHAIN_IDS: Record<string, string> = {
    mainnet: "1",
    devnet: "D",
    testnet: "T",
};

export function createMcpServer() {
    const network = process.env.MVX_NETWORK || "mainnet";
    const apiUrl = NETWORK_API_URLS[network] || NETWORK_API_URLS.mainnet;
    const chainId = NETWORK_CHAIN_IDS[network] || "1";
    const walletPath = process.env.MVX_WALLET;

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
                {
                    name: "get_balance",
                    description: "Fetch the EGLD balance of an address.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            address: { type: "string" },
                        },
                        required: ["address"],
                    },
                },
                {
                    name: "query_account",
                    description: "Fetch detailed account information (balance, nonce, shard, etc.).",
                    inputSchema: {
                        type: "object",
                        properties: {
                            address: { type: "string" },
                        },
                        required: ["address"],
                    },
                },
                {
                    name: "send_egld",
                    description: "Generate an unsigned transaction to send EGLD.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            sender: { type: "string" },
                            receiver: { type: "string" },
                            value: { type: "string" },
                            nonce: { type: "number" },
                        },
                        required: ["sender", "receiver", "value", "nonce"],
                    },
                },
                {
                    name: "send_tokens",
                    description: "Generate an unsigned transaction to send ESDT tokens.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            sender: { type: "string" },
                            receiver: { type: "string" },
                            token_identifier: { type: "string" },
                            amount: { type: "string" },
                            nonce: { type: "number" },
                        },
                        required: ["sender", "receiver", "token_identifier", "amount", "nonce"],
                    },
                },
                {
                    name: "get_wallet_address",
                    description: "Get the address of the wallet configured in the environment (via MVX_WALLET).",
                    inputSchema: {
                        type: "object",
                        properties: {},
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
            const tx = await createGuardianTransaction(args as any);
            return {
                content: [{ type: "text", text: JSON.stringify(tx, null, 2) }],
            };
        }

        if (name === "get_balance") {
            const { address } = args as any;
            const balance = await getAccountBalance(apiUrl, address);
            return {
                content: [{ type: "text", text: JSON.stringify({ balance }, null, 2) }],
            };
        }

        if (name === "query_account") {
            const { address } = args as any;
            const details = await getAccountDetails(apiUrl, address);
            return {
                content: [{ type: "text", text: JSON.stringify(details, null, 2) }],
            };
        }

        if (name === "send_egld") {
            const { sender, receiver, value, nonce } = args as any;
            const tx = await createEgldTransfer({
                sender,
                receiver,
                value,
                nonce,
                chainId,
            });
            return {
                content: [{ type: "text", text: JSON.stringify(tx, null, 2) }],
            };
        }

        if (name === "send_tokens") {
            const { sender, receiver, token_identifier, amount, nonce } = args as any;
            const tx = await createTokenTransfer({
                sender,
                receiver,
                tokenIdentifier: token_identifier,
                amount,
                nonce,
                chainId,
            });
            return {
                content: [{ type: "text", text: JSON.stringify(tx, null, 2) }],
            };
        }

        if (name === "get_wallet_address") {
            if (!walletPath) {
                throw new Error("MVX_WALLET environment variable is not set.");
            }
            const address = await getWalletAddressFromPath(walletPath);
            return {
                content: [{ type: "text", text: JSON.stringify({ address }, null, 2) }],
            };
        }

        throw new Error(`Unknown tool: ${name}`);
    });

    return server;
}
