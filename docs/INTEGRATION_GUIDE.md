# Integration Guide: MultiversX MCP Server

This guide explains how to connect and use the MultiversX MCP server with various clients.

## 1. Claude Desktop Integration

To use MultiversX tools directly within Claude, add the server to your `claude_desktop_config.json`:

### macOS
Path: `~/Library/Application\ Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "multiversx": {
      "command": "npx",
      "args": ["-y", "ts-node", "/absolute/path/to/multiversx-mcp-server/src/index.ts"],
      "env": {
        "MVX_NETWORK": "devnet",
        "MVX_SIGNING_MODE": "signed",
        "MVX_WALLET_PEM": "/path/to/your/wallet.pem"
      }
    }
  }
}
```

## 2. Fastify HTTP Integration

If you prefer HTTP over Stdio, run the server in HTTP mode:

```bash
# Start the HTTP server
npm start http

# Default Port: 3000
# Endpoints:
# - GET /health
# - GET /feed.json (Google Merchant Center compatible)
```

## 3. Custom MCP Clients

You can use the `@modelcontextprotocol/sdk` to connect from your own TypeScript applications:

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
    command: "npx",
    args: ["ts-node", "src/index.ts"]
});

const client = new Client({ name: "my-app", version: "1.0.0" }, { capabilities: {} });
await client.connect(transport);

const balance = await client.callTool({
    name: "get-balance",
    arguments: { address: "erd1..." }
});
```

## 4. Signing Modes

| Mode | Description | Security |
| --- | --- | --- |
| `unsigned` | Returns a transaction JSON for external signing. | High (No keys on server) |
| `signed` | Automatically signs transactions using a PEM file. | Medium (Requires PEM protection) |

> [!TIP]
> Use `unsigned` mode for production web apps where users sign with their own wallets (e.g., Extension, xPortal). Use `signed` mode for automated agents or scripts.
