import * as dotenv from "dotenv";
dotenv.config(); // ✅ Load .env variables into process.env

import { defineConfig } from "hardhat/config";
import hardhatVerify from "@nomicfoundation/hardhat-verify";

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY not found in .env");
}

export default defineConfig({
  solidity: {
    profiles: {
      default: { version: "0.8.28" },
    },
  },

  networks: {
    polygonAmoy: {
      type: "http",
      url: "https://rpc-amoy.polygon.technology",
      accounts: [PRIVATE_KEY], // ✅ Use the environment variable directly
      chainId: 80002,
    },
  },

  verify: {
    etherscan: {
      apiKey: process.env.POLYGONSCAN_API_KEY,
    },
  },

  plugins: [hardhatVerify],
});
