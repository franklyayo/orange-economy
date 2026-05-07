import * as dotenv from "dotenv";
dotenv.config();

import { defineConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY not found in .env");
}

const POLYGON_RPC = process.env.POLYGON_MAINNET_RPC || "https://polygon.drpc.org";

export default defineConfig({
  plugins: [hardhatToolboxMochaEthers],
  solidity: "0.8.28",
  networks: {
    polygon: {
      type: "http",
      url: POLYGON_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 137,
    },
    amoy: {
      type: "http",
      url: "https://rpc-amoy.polygon.technology",
      accounts: [PRIVATE_KEY],
      chainId: 80002,
    },
  },
  // Hardhat 3 requires the 'verify' wrapper!
// Hardhat 3 expects a direct string here!
  verify: {
    etherscan: {
      apiKey: process.env.POLYGONSCAN_API_KEY || "",
    },
  },
});
