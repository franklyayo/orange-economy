import hre from "hardhat";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("🚀 Deploying OrangeMarketplace to Polygon Amoy...");

  const networkUrl = "https://rpc-amoy.polygon.technology";
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY not set in .env");

  const provider = new ethers.JsonRpcProvider(networkUrl);
  const signer = new ethers.Wallet(privateKey, provider);

  const artifact = await hre.artifacts.readArtifact("OrangeMarketplace");
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);

  const marketplace = await factory.deploy();
  await marketplace.waitForDeployment();

  console.log("✅ OrangeMarketplace deployed at:", await marketplace.getAddress());
  console.log("🔗 View on Amoy Explorer: https://amoy.polygonscan.com/address/" + await marketplace.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
