"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const http_1 = require("../http");
const feedValidator_1 = require("../utils/feedValidator");
const search_1 = require("../logic/search");
// Mock Logic
jest.mock("../logic/search");
describe("HTTP Server E2E", () => {
    let app;
    beforeAll(async () => {
        const fastify = (0, http_1.createHttpServer)();
        await fastify.ready();
        app = fastify.server; // Node http server instance for supertest
    });
    afterAll(() => {
        // fastify.close() if strictly needed, but jest teardown handles it usually.
    });
    it("GET /feed.json should return valid Google Merchant Feed", async () => {
        // Setup Mock Data
        search_1.searchProducts.mockResolvedValue([
            {
                id: "EGLD-123-01",
                name: "Test Item",
                description: "A great NFT",
                price: "1000000000000000000 atomic units",
                image_url: "http://img.com/1.png",
                availability: "in_stock",
                metadata: { nonce: 1, token_identifier: "EGLD-123", trust_level: "verified" }
            }
        ]);
        const response = await (0, supertest_1.default)(app)
            .get("/feed.json")
            .expect("Content-Type", /json/)
            .expect(200);
        const feed = response.body;
        expect(feed.items).toBeDefined();
        expect(feed.items).toHaveLength(1);
        // Run Validator
        const validation = (0, feedValidator_1.validateFeed)(feed.items);
        expect(validation.errors).toEqual([]);
        expect(validation.valid).toBe(true);
        // Check specific mapping details
        const item = feed.items[0];
        expect(item.brand).toBe("MultiversX");
        expect(item.price.value).toBe("1000000000000000000");
        expect(item.link).toContain("xexchange.com/nft/EGLD-123-01");
    });
    it("GET /health should return status ok", async () => {
        const response = await (0, supertest_1.default)(app)
            .get("/health")
            .expect(200);
        expect(response.body.status).toBe("ok");
    });
});
