# MultiversX UCP Integration Guide

This guide details how to integrate your Marketplace or dApp with the **Universal Commerce Protocol (UCP)** ecosystem on MultiversX.

## Overview

The UCP layer (implemented via `multiversx-mcp-server`) allows your on-chain assets to be:
1.  **Discovered**: By AI Agents (Claude, Gemini) and Google Shopping.
2.  **Purchased**: By generating standardized transaction payloads that agents can hand off to users.

## Integration Steps

### 1. Whitelisting (The Configuration)
To prevent fraud, the MCP server only recommends assets from "Trusted Contracts". You must add your Smart Contract to the `src/config.json` of the server instance (or submit a PR to the official instance).

**File**: `src/config.json`

```json
{
  "contracts_config": {
    "your_marketplace_id": {
      "address": "erd1...",
      "abi": {
        "function": "buyNft",
        "args_order": ["token_identifier", "nonce", "quantity"]
      }
    }
  }
}
```

*   **`function`**: The name of your SC function to call for purchasing.
*   **`args_order`**: The order of arguments your function expects. Supported dynamic args: `token_identifier`, `nonce`, `quantity`.

### 2. Google Shopping Feed (Path A)
Once configured, your items will automatically appear in the generated Product Feed.

*   **Endpoint**: `GET /feed.json`
*   **Validation**: Ensure your metadata (title, image) is standard. The server automatically maps on-chain metadata to the Google Merchant Center schema.

### 3. Verification
Use the `create_purchase_transaction` tool to verify that the server generates the correct transaction data for your contract.

```json
// Tool Input
{
  "name": "create_purchase_transaction",
  "arguments": {
    "marketplace": "your_marketplace_id",
    "token_identifier": "TEST-123",
    "nonce": 1,
    "quantity": 1
  }
}
```

**Expected Data Output**: `buyNft@544553542d313233@01@01` (Hex encoded arguments separated by `@`).
