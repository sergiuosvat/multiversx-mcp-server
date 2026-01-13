"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPurchaseTransaction = createPurchaseTransaction;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const configPath = path_1.default.join(__dirname, "../../src/config.json");
const config = JSON.parse(fs_1.default.readFileSync(configPath, "utf-8"));
async function createPurchaseTransaction(tokenIdentifier, nonce, quantity = 1, marketplace = "default") {
    // 1. Resolve Marketplace Config
    const marketConfig = config.contracts_config[marketplace.toLowerCase()] || config.contracts_config["default"];
    const { address, abi } = marketConfig;
    // 2. Prepare Arguments
    const tokenHex = Buffer.from(tokenIdentifier).toString("hex");
    const nonceHex = nonce.toString(16).padStart(2, "0");
    const nonceEven = nonceHex.length % 2 !== 0 ? `0${nonceHex}` : nonceHex;
    const quantityHex = quantity.toString(16);
    const quantityEven = quantityHex.length % 2 !== 0 ? `0${quantityHex}` : quantityHex;
    // 3. Construct Data Field via ABI pattern
    // Pattern: funcName@arg1@arg2...
    const argsMap = {
        "token_identifier": tokenHex,
        "nonce": nonceEven,
        "quantity": quantityEven
    };
    const args = abi.args_order.map((argName) => argsMap[argName]);
    // Join with @
    const data = `${abi.function}@${args.join("@")}`;
    return {
        receiver: address,
        value: "0", // Typically 0 for SC calls unless it's a direct transfer. If Payable, user wallet attaches value. 
        // WARN: If the function expects EGLD, the "value" field in the standard Transaction object 
        // usually handles it. But here we set 0 placeholder as we don't know the Listing Price.
        // Ideally, the "value" should come from the Tool Arguments (listing price). 
        // For now, let's keep it 0 or a placeholder string "USER_FILL_PRICE".
        // Reverting to previous "1 EGLD" placeholder logic or better "0"
        data: data,
        gasLimit: 20000000,
        chainID: "1",
    };
}
