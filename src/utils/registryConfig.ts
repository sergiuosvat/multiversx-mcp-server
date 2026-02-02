/**
 * Contract addresses for MX-8004 Registries
 */

export const REGISTRY_ADDRESSES = {
    // Identity Registry (Agent NFT Collection Owner / Manifest Indexer)
    IDENTITY: process.env.MVX_REGISTRY_IDENTITY || "erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu",

    // Reputation Registry (Trust scores and job totals)
    REPUTATION: process.env.MVX_REGISTRY_REPUTATION || "erd1qyu5wgts7fp92az5y2yuqlsq0zy7gu3g5pcsq7yfu3ez3gr3qpuq00xjqv",

    // Validation Registry (Job proofs and verification status)
    // Note: In some deployments, Reputation and Validation might be the same contract or linked.
    VALIDATION: process.env.MVX_REGISTRY_VALIDATION || "erd1qyu5wgts7fp92az5y2yuqlsq0zy7gu3g5pcsq7yfu3ez3gr3qpuq00xjqv",
};
