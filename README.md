# MultiversX MCP Server

The official **Model Context Protocol (MCP)** server for the MultiversX Blockchain. This server enables AI Agents (Claude, Gemini, etc.) to securely interact with the blockchain and allows products to be indexed by Google Shopping via specific feeds.

## 🚀 Features

- **14 Comprehensive Tools**: Cover everything from account queries to batch transfers and token issuance.
- **Relayed V3 Support**: Native support for gas-sponsored transactions.
- **Modular Architecture**: Easy to extend or integrate into custom agents.
- **Dual Mode**: Runs via Stdio (for desktop agents) or HTTP (for web services/Google Shopping feeds).

## quick-start-integration-guide

### 1. Installation
```bash
git clone https://github.com/multiversx/multiversx-mcp-server.git
cd multiversx-mcp-server
npm install
npm run build
```

### 2. Configuration
Create a `.env` file (see `.env.example`):
```env
MVX_NETWORK=devnet
MVX_SIGNING_MODE=signed
MVX_WALLET_PEM=./wallets/my-wallet.pem
```

### 3. Usage
- **MCP Stdio**: Add to your MCP client config (e.g., `claude_desktop_config.json`).
- **HTTP Mode**: `npm start http` - Access Google Feed at `/feed.json`.

## 🛠 Available Tools

| Category | Tools |
| --- | --- |
| **Account** | `get-balance`, `query-account` |
| **Transfers** | `send-egld`, `send-tokens`, `send-egld-to-multiple`, `send-tokens-to-multiple` |
| **Tokens** | `issue-fungible-token`, `issue-nft-collection`, `issue-sft-collection`, `create-nft` |
| **Advanced** | `create-relayed-v3`, `track-transaction`, `search-products` |

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md) - System design and data flow.
- [API Reference](docs/API_REFERENCE.md) - Detailed tool specifications and examples.
- [Integration Guide](docs/INTEGRATION_GUIDE.md) - Setup for Claude Desktop and custom clients.
- [RelayedV3 Spec](docs/specs/RELAYED_V3.md) - Technical deep-dive into gas-sponsored transactions.
- [E2E Testing Guide](docs/E2E_GUIDE.md) - How to run and verify the test suite.

## 🧪 Testing
```bash
# Run unit tests
npm test

# Run E2E tests (Playwright)
npx playwright test src/__tests__/e2e
```
