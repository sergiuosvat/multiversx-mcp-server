# Universal Commerce Protocol (UCP) Integration Plan

**Goal:** Integrate the Universal Commerce Protocol (UCP) into the MultiversX MCP Server to enable official agentic commerce capabilities.

**Architecture:** We will leverage the existing Fastify HTTP server (`src/http.ts`) to serve the UCP Discovery Manifest at `/.well-known/ucp`. We will map existing MCP tools to UCP capabilities within this manifest.

**Tech Stack:** TypeScript, Fastify, MCP SDK, JSON Schema.

---

### Task 1: Create UCP Manifest Type Definitions & Schema Validation

**Files:**
- Create: `src/ucp/schemas.ts` (Official Schema Definitions)
- Create: `src/ucp/types.ts`

**Step 1: Write the failing test**
*Skipped (Type definition only)*

**Step 2: Define Official Schemas**
Create `src/ucp/schemas.ts` containing the Zod schemas or JSON schemas for:
- `UCPManifest`
- `UCPCapability`
- `UCPAction`

**Step 3: Write Type Implementation**
```typescript
/**
 * UCP Manifest Types based on official specs
 */
import { z } from "zod";

// Define Zod schemas to allow runtime validation against official specs
export const UCPCapabilitySchema = z.object({
  endpoint: z.string().optional(),
  description: z.string(),
  schema: z.any().optional(),
  mcp_tool_name: z.string().optional(), // Extension for MCP mapping
});

export const UCPManifestSchema = z.object({
  ucp_version: z.string(),
  id: z.string(),
  name: z.string(),
  description: z.string(),
  capabilities: z.record(UCPCapabilitySchema),
});

export type UCPManifest = z.infer<typeof UCPManifestSchema>;
export type UCPCapability = z.infer<typeof UCPCapabilitySchema>;
```

**Step 4: Commit**
```bash
git add src/ucp/types.ts src/ucp/schemas.ts
git commit -m "feat: add UCP type definitions and zod schemas"
```

### Task 2: Implement UCP Manifest & Discovery

**Files:**
- Modify: `src/http.ts`
- Create: `src/ucp/manifest.ts`
- Test: `tests/ucp/manifest.test.ts`

**Step 1: Write the failing test**
Create `tests/ucp/manifest.test.ts`:
```typescript
import Fastify from "fastify";
import { createHttpServer } from "../../src/http";
import request from "supertest";
import { UCPManifestSchema } from "../../src/ucp/schemas";

describe("UCP Manifest", () => {
    let fastify: any;

    beforeAll(async () => {
        fastify = createHttpServer();
        await fastify.ready();
    });

    afterAll(() => {
        fastify.close();
    });

    it("should serve a valid UCP manifest at /.well-known/ucp", async () => {
        const response = await fastify.inject({
            method: 'GET',
            url: '/.well-known/ucp'
        });
        
        expect(response.statusCode).toBe(200);
        const manifest = JSON.parse(response.payload);
        
        // VALIDATE AGAINST SCHEMA
        const validation = UCPManifestSchema.safeParse(manifest);
        if (!validation.success) {
            console.error(validation.error);
        }
        expect(validation.success).toBe(true);
        
        // CHECK SPECIFIC CAPABILITIES
        expect(manifest.capabilities["dev.ucp.discovery"]).toBeDefined();
        expect(manifest.capabilities["dev.ucp.identity"]).toBeDefined();
    });
});
```

**Step 2: Run test (Verify Fail)**
Run: `npm test tests/ucp/manifest.test.ts`
Expected: 404 Not Found or Validation Error

**Step 3: Write minimal implementation**
Create `src/ucp/manifest.ts`:
```typescript
import { UCPManifest } from "./types";

export const MULTIVERSX_UCP_MANIFEST: UCPManifest = {
    ucp_version: "1.0.0",
    id: "multiversx-agent-connector",
    name: "MultiversX Agent Connector",
    description: "Official MultiversX Adapter for Agentic Payments",
    capabilities: {
        "dev.ucp.discovery": {
            description: "Discover available commerce capabilities",
            endpoint: "/.well-known/ucp"
        },
        "dev.ucp.identity": {
            description: "Assert agent identity via MultiversX address",
            mcp_tool_name: "get_wallet_address"
        },
        "dev.ucp.payment.process": {
            description: "Process a payment on MultiversX blockchain",
            mcp_tool_name: "send_egld"
        }
    }
};
```

Modify `src/http.ts`:
```typescript
import { MULTIVERSX_UCP_MANIFEST } from "./ucp/manifest";
// ... existing imports

export function createHttpServer() {
    // ... existing setup

    fastify.get("/.well-known/ucp", async () => {
        return MULTIVERSX_UCP_MANIFEST;
    });

    // ... existing return
}
```

**Step 4: Run test (Verify Pass)**
Run: `npm test tests/ucp/manifest.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/ucp/manifest.ts src/http.ts tests/ucp/manifest.test.ts
git commit -m "feat: implement UCP manifest with discovery and identity"
```

### Task 3: Map MCP Tools (Conceptual/Doc Update)

**Files:**
- Modify: `README.md`

**Step 1: Write documentation**
Update README to explain how UCP agents can use the MCP tools via the manifest mapping.

**Step 2: Commit**
```bash
git add README.md
git commit -m "docs: add UCP integration details"
```
