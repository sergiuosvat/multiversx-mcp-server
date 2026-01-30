import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
    getBalance, getBalanceToolName, getBalanceToolDescription, getBalanceParamScheme,
    queryAccount, queryAccountToolName, queryAccountToolDescription, queryAccountParamScheme,
    sendEgld, sendEgldToolName, sendEgldToolDescription, sendEgldParamScheme,
    sendTokens, sendTokensToolName, sendTokensToolDescription, sendTokensParamScheme,
    issueFungible, issueFungibleToolName, issueFungibleToolDescription, issueFungibleParamScheme,
    issueNftCollection, issueNftCollectionToolName, issueNftCollectionToolDescription, issueNftCollectionParamScheme,
    issueSemiFungibleCollection, issueSemiFungibleCollectionToolName, issueSemiFungibleCollectionToolDescription, issueSemiFungibleCollectionParamScheme,
    issueMetaEsdtCollection, issueMetaEsdtCollectionToolName, issueMetaEsdtCollectionToolDescription, issueMetaEsdtCollectionParamScheme,
    createNft, createNftToolName, createNftToolDescription, createNftParamScheme,
    sendEgldToMultipleReceivers, sendEgldToMultipleReceiversToolName, sendEgldToMultipleReceiversToolDescription, sendEgldToMultipleReceiversParamScheme,
    sendTokensToMultipleReceivers, sendTokensToMultipleReceiversToolName, sendTokensToMultipleReceiversToolDescription, sendTokensToMultipleReceiversParamScheme,
    createRelayedV3, createRelayedV3ToolName, createRelayedV3ToolDescription, createRelayedV3ParamScheme,
    trackTransaction, trackTransactionToolName, trackTransactionToolDescription, trackTransactionParamScheme,
    searchProducts, searchProductsToolName, searchProductsToolDescription, searchProductsParamScheme,
} from "./tools/index";

// Helper to cast tool results to avoid strict TZ index signature issues
// The SDK expects [key: string]: unknown, which our strict ToolResult interfaces don't have
const asToolResult = (p: Promise<any>) => p as Promise<any>;

export const MCP_SERVER_NAME = "multiversx-mcp-server";

export function createMcpServer() {
    const server = new McpServer({
        name: MCP_SERVER_NAME,
        version: "1.0.0",
    });

    // Register all tools
    server.tool(
        getBalanceToolName,
        getBalanceToolDescription,
        getBalanceParamScheme,
        async ({ address }) => asToolResult(getBalance(address))
    );

    server.tool(
        queryAccountToolName,
        queryAccountToolDescription,
        queryAccountParamScheme,
        async ({ address }) => asToolResult(queryAccount(address))
    );

    server.tool(
        sendEgldToolName,
        sendEgldToolDescription,
        sendEgldParamScheme,
        async ({ receiver, amount }) => asToolResult(sendEgld(receiver, amount))
    );

    server.tool(
        sendTokensToolName,
        sendTokensToolDescription,
        sendTokensParamScheme,
        async ({ receiver, tokenIdentifier, amount, nonce }) => asToolResult(sendTokens(receiver, tokenIdentifier, amount, nonce))
    );

    server.tool(
        issueFungibleToolName,
        issueFungibleToolDescription,
        issueFungibleParamScheme,
        async ({ tokenName, tokenTicker, initialSupply, numDecimals }) => asToolResult(issueFungible(tokenName, tokenTicker, initialSupply, numDecimals))
    );

    server.tool(
        issueNftCollectionToolName,
        issueNftCollectionToolDescription,
        issueNftCollectionParamScheme,
        async ({ tokenName, tokenTicker }) => asToolResult(issueNftCollection(tokenName, tokenTicker))
    );

    server.tool(
        issueSemiFungibleCollectionToolName,
        issueSemiFungibleCollectionToolDescription,
        issueSemiFungibleCollectionParamScheme,
        async ({ tokenName, tokenTicker }) => asToolResult(issueSemiFungibleCollection(tokenName, tokenTicker))
    );

    server.tool(
        issueMetaEsdtCollectionToolName,
        issueMetaEsdtCollectionToolDescription,
        issueMetaEsdtCollectionParamScheme,
        async ({ tokenName, tokenTicker, numDecimals }) => asToolResult(issueMetaEsdtCollection(tokenName, tokenTicker, numDecimals))
    );

    server.tool(
        createNftToolName,
        createNftToolDescription,
        createNftParamScheme,
        async ({ collectionIdentifier, name, royalties, quantity, uris }) => asToolResult(createNft(collectionIdentifier, name, royalties, quantity, uris))
    );

    server.tool(
        sendEgldToMultipleReceiversToolName,
        sendEgldToMultipleReceiversToolDescription,
        sendEgldToMultipleReceiversParamScheme,
        async ({ amount, receivers }) => asToolResult(sendEgldToMultipleReceivers(amount, receivers))
    );

    server.tool(
        sendTokensToMultipleReceiversToolName,
        sendTokensToMultipleReceiversToolDescription,
        sendTokensToMultipleReceiversParamScheme,
        async ({ transfers }) => asToolResult(sendTokensToMultipleReceivers(transfers))
    );

    server.tool(
        createRelayedV3ToolName,
        createRelayedV3ToolDescription,
        createRelayedV3ParamScheme,
        async ({ innerTransaction }) => asToolResult(createRelayedV3(innerTransaction))
    );

    server.tool(
        trackTransactionToolName,
        trackTransactionToolDescription,
        trackTransactionParamScheme,
        async ({ txHash }) => asToolResult(trackTransaction(txHash))
    );

    server.tool(
        searchProductsToolName,
        searchProductsToolDescription,
        searchProductsParamScheme,
        async ({ query, collection, limit }) => asToolResult(searchProducts(query, collection, limit))
    );

    return server;
}
