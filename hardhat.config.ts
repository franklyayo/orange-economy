import "dotenv/config";
import { defineConfig, configVariable } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers"; // This injects hre.ethers

export default defineConfig({
  solidity: {
    // Define a default Solidity profile (required in v3)
    profiles: {
      default: {
        version: "0.8.28",
      },
    },
  },

  networks: {
    polygonAmoy: {
      type: "http", // Required: specifies a connection to a remote JSON-RPC node
      url: "https://rpc-amoy.polygon.technology",
      accounts: [configVariable("PRIVATE_KEY")],
      // chainId is optional but can be added for clarity
      chainId: 80002,
    },
  },
});
