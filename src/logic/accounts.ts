import axios from "axios";

export interface AccountDetails {
    address: string;
    balance: string;
    nonce: number;
    shard: number;
    rootHash?: string;
    txCount?: number;
    scrCount?: number;
    username?: string;
    developerReward?: string;
}

/**
 * Fetches the EGLD balance for a given address.
 * 
 * @param apiUrl MultiversX API URL
 * @param address Bech32 address
 * @returns Balance as a string (atomic units)
 */
export async function getAccountBalance(apiUrl: string, address: string): Promise<string> {
    try {
        const response = await axios.get(`${apiUrl}/accounts/${address}`);
        return response.data.balance;
    } catch (error: any) {
        throw new Error(`Failed to fetch account balance: ${error.message}`);
    }
}

/**
 * Fetches full account details for a given address.
 * 
 * @param apiUrl MultiversX API URL
 * @param address Bech32 address
 * @returns AccountDetails object
 */
export async function getAccountDetails(apiUrl: string, address: string): Promise<AccountDetails> {
    try {
        const response = await axios.get(`${apiUrl}/accounts/${address}`);
        return response.data;
    } catch (error: any) {
        throw new Error(`Failed to fetch account details: ${error.message}`);
    }
}
