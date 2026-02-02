# MCP Server Features Implementation Plan

**Goal:** Implement missing Agent Registry, Marketplace, and UCP Commerce tools for the MultiversX MCP Server, adhering to new technical specifications.

**Architecture:** TypeScript-based MCP tools using `@modelcontextprotocol/sdk`. New tools will fetch data from MultiversX API (Registry/Marketplace) and handle UCP-specific logic (Whitelisting).

**Tech Stack:** TypeScript, MultiversX SDK (optional, or just API checks), Axios, Zod.

---

### Task 1: Whitelist Registry Infrastructure

**Files:**
- Create: `src/utils/whitelistRegistry.ts`
- Create: `whitelists.json`
- Test: `src/utils/__tests__/whitelistRegistry.test.ts`

**Step 1: Write the failing test**
Create `src/utils/__tests__/whitelistRegistry.test.ts` testing `loadWhitelist` and `isWhitelisted`.

**Step 2: Run test to verify it fails**
Run: `npm test src/utils/__tests__/whitelistRegistry.test.ts`

**Step 3: Implement Whitelist Registry**
Create `whitelists.json` with empty array or example.
Create `src/utils/whitelistRegistry.ts` to load and check against this file.

**Step 4: Run test to verify it passes**
Run: `npm test src/utils/__tests__/whitelistRegistry.test.ts`

**Step 5: Commit**
`git add . && git commit -m "feat: add whitelist registry infrastructure"`

---

### Task 2: Registry Tools (`get-agent-manifest`, `get-agent-trust-summary`)

**Files:**
- Create: `src/tools/registry/getAgentManifest.ts`
- Create: `src/tools/registry/getAgentTrust.ts`
- Modify: `src/index.ts` (to register tools)
- Test: `src/tools/registry/__tests__/registryTools.test.ts`

**Step 1: Write the failing test**
Create tests for `getAgentManifest` (mocking API response for a registration tx) and `getAgentTrust`.

**Step 2: Run test to verify it fails**
`npm test src/tools/registry/__tests__/registryTools.test.ts`

**Step 3: Implement Tools**
Implement `getAgentManifest` using `axios` to fetch tx data.
Implement `getAgentTrust` (returning mock/calculated data).

**Step 4: Run test to verify it passes**
`npm test src/tools/registry/__tests__/registryTools.test.ts`

**Step 5: Commit**
`git add . && git commit -m "feat: add agent registry tools"`

---

### Task 3: Marketplace Tools (`search-agents`, `get-top-rated-agents`)

**Files:**
- Create: `src/tools/marketplace/searchAgents.ts`
- Create: `src/tools/marketplace/getTopAgents.ts`
- Modify: `src/index.ts`
- Test: `src/tools/marketplace/__tests__/marketplaceTools.test.ts`

**Step 1: Write the failing test**
Create tests for search and top-rated logic.

**Step 2: Run test to verify it fails**
`npm test`

**Step 3: Implement Tools**
Implement `searchAgents` and `getTopAgents`.

**Step 4: Run test to verify it passes**
`npm test`

**Step 5: Commit**
`git add . && git commit -m "feat: add marketplace discovery tools"`

---

### Task 4: UCP Commerce Tool (`create_purchase_transaction`)

**Files:**
- Create: `src/tools/commerce/createPurchaseTx.ts`
- Modify: `src/index.ts`
- Test: `src/tools/commerce/__tests__/createPurchaseTx.test.ts`

**Step 1: Write the failing test**
Test that it returns a correct unsigned transaction JSON object.

**Step 2: Implement Tool**
Implement `createPurchaseTransaction` taking `token_identifier`, `nonce`.

**Step 3: Verify**
`npm test`

**Step 4: Commit**
`git add . && git commit -m "feat: add create_purchase_transaction tool"`

---

### Task 5: Enhance Existing Tools (Whitelist & Feed)

**Files:**
- Modify: `src/tools/searchProducts.ts` (Add whitelist check)
- Modify: `src/tools/trackTransaction.ts` (Add whitelist check)
- Modify: `src/http.ts` (Loop through whitelist)

**Step 1: Write failing tests**
Update specific tests to fail if whitelist is ignored.

**Step 2: Modify Code**
Integrate `isWhitelisted` into `searchProducts` and `trackTransaction`.
Update `http.ts` loop.

**Step 3: Verify**
`npm test`

**Step 4: Commit**
`git add . && git commit -m "feat: enforce whitelist in search and track tools"`
