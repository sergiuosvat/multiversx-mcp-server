import Fastify from "fastify";
import { searchProducts } from "./tools/searchProducts";
import { loadWhitelist } from "./utils/whitelistRegistry";

export function createHttpServer() {
    const fastify = Fastify({ logger: false });

    const feedHandler = async (request: any, reply: any) => {
        // 1. Fetch products from all whitelisted collections
        const whitelist = loadWhitelist();
        const allProducts = [];

        for (const collectionId of whitelist) {
            try {
                const result = await searchProducts("EGLD", collectionId, 20);
                const products = JSON.parse(result.content[0].text);
                allProducts.push(...products);
            } catch (e) {
                console.error(`Error fetching products for ${collectionId}:`, e);
            }
        }

        // 2. Map to Google Merchant Center Feed Schema (JSON)
        const feedItems = allProducts.map((p: any) => ({
            id: p.id,
            title: p.name,
            description: p.description,
            link: `https://xexchange.com/nft/${p.id}`,
            image_link: p.image_url,
            availability: p.availability,
            price: {
                value: p.price.split(" ")[0],
                currency: "EGLD"
            },
            brand: "MultiversX",
            condition: "new"
        }));

        return { items: feedItems };
    };

    fastify.get("/feed.json", feedHandler);
    fastify.get("/.well-known/acp/products.json", feedHandler);

    fastify.get("/health", async () => {
        return { status: "ok", service: "multiversx-mcp-server-http" };
    });

    return fastify;
}
