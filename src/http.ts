import Fastify from "fastify";
import { searchProducts } from "./logic/search";

export function createHttpServer() {
    const fastify = Fastify({ logger: false });

    fastify.get("/feed.json", async (request, reply) => {
        // 1. Fetch "Showcase" products (Broad search or curated list)
        // In production, this would iterate over all whitelisted collections.
        // For MVP, we search for a default keyword or list all.
        const products = await searchProducts("EGLD", undefined, 50);

        // 2. Map to Google Merchant Center Feed Schema (JSON)
        // Ref: https://developers.google.com/shopping-content/guides/products/feed-tso
        const feedItems = products.map((p) => ({
            id: p.id,
            title: p.name,
            description: p.description,
            link: `https://xexchange.com/nft/${p.id}`, // Deep-link to marketplace
            image_link: p.image_url,
            availability: p.availability, // "in_stock"
            price: {
                value: p.price.split(" ")[0], // Extract numeric. TODO: Regex for precision
                currency: "EGLD"
            },
            brand: "MultiversX",
            condition: "new"
        }));

        return { items: feedItems };
    });

    fastify.get("/health", async () => {
        return { status: "ok", service: "multiversx-mcp-server-http" };
    });

    return fastify;
}
