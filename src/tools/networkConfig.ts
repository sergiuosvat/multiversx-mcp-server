/**
 * SDK-based network configuration with customizable API URL
 */

import { ApiNetworkProvider } from "@multiversx/sdk-core";
import { USER_AGENT } from "./constants";

export type NetworkName = "mainnet" | "devnet" | "testnet";

export interface NetworkConfig {
    name: NetworkName;
    apiUrl: string;
    chainId: string;
    explorerUrl: string;
}

const NETWORK_CONFIGS: Record<NetworkName, NetworkConfig> = {
    mainnet: {
        name: "mainnet",
        apiUrl: "https://api.multiversx.com",
        chainId: "1",
        explorerUrl: "https://explorer.multiversx.com",
    },
    devnet: {
        name: "devnet",
        apiUrl: "https://devnet-api.multiversx.com",
        chainId: "D",
        explorerUrl: "https://devnet-explorer.multiversx.com",
    },
    testnet: {
        name: "testnet",
        apiUrl: "https://testnet-api.multiversx.com",
        chainId: "T",
        explorerUrl: "https://testnet-explorer.multiversx.com",
    },
};

/**
 * Load network configuration from environment variables.
 * MVX_NETWORK: mainnet | devnet | testnet (default: mainnet)
 * MVX_API_URL: Custom API URL override (optional)
 */
export function loadNetworkConfig(): NetworkConfig {
    const network = (process.env.MVX_NETWORK || "mainnet") as NetworkName;
    const customApiUrl = process.env.MVX_API_URL;

    const config = NETWORK_CONFIGS[network] || NETWORK_CONFIGS.mainnet;

    if (customApiUrl) {
        return { ...config, apiUrl: customApiUrl };
    }

    return config;
}

/**
 * Create an ApiNetworkProvider instance for the given network config.
 */
export function createNetworkProvider(config: NetworkConfig): ApiNetworkProvider {
    return new ApiNetworkProvider(config.apiUrl, { clientName: USER_AGENT });
}

/**
 * Get the network configuration for a specific network name.
 */
export function getNetworkConfig(network: NetworkName): NetworkConfig {
    return NETWORK_CONFIGS[network] || NETWORK_CONFIGS.mainnet;
}
