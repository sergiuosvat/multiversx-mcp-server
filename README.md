# MultiversX MCP Server

The official **Model Context Protocol (MCP)** server for the MultiversX Blockchain. This server enables AI Agents (Claude, Gemini, etc.) to securely interact with the blockchain and allows products to be indexed by Google Shopping via specific feeds.

## Features

### 1. Agent Tools (MCP Stdio)
Exposes the following tools to connected AI Agents:
*   `search_products`: Find NFTs and SFTs on-chain (Passive Indexing).
*   `create_purchase_transaction`: Generates unsigned transaction payloads for buying assets. Supports configurable ABIs (e.g., `buy` vs `buyNft`).
*   `track_order`: Stateless tracking of transaction status on the blockchain.

### 2. Google Shopping Feed (HTTP)
*   **Endpoint**: `GET /feed.json`
*   **Format**: Google Merchant Center JSON Schema (Path A compliance).
*   **Usage**: Submit this URL to Google Merchant Center to list your on-chain assets in "Shop with AI".

## Installation

```bash
git clone https://github.com/multiversx/multiversx-mcp-server.git
cd multiversx-mcp-server
npm install
npm run build
```

## Configuration
The server is driven by `src/config.json`. You can configure trusted marketplaces and their specific smart contract ABIs.

```json
{
  "contracts_config": {
    "xoxno": {
      "address": "erd1...", 
      "abi": {
        "function": "buy",
        "args_order": ["token_identifier", "nonce", "quantity"]
      }
    }
  }
}
```

## Usage

### Run as MCP Server (for Claude Desktop / Agent Runner)
Add this to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "multiversx": {
      "command": "node",
      "args": ["/path/to/multiversx-mcp-server/dist/index.js", "mcp"]
    }
  }
}
```

### Run as HTTP Server (for Google Feed)
```bash
# Starts server on port 3000 (default)
npm run start:http
```
Access the feed at: `http://localhost:3000/feed.json`

## Testing
Run the comprehensive test suite (including End-to-End integration tests):
```bash
npm test
```
