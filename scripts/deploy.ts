import hre from "hardhat";
import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config(); // Load environment variables

async function main() {
  console.log("🚀 Deploying OrangeEconomyNFT to Polygon Amoy...");

  const networkUrl = "https://rpc-amoy.polygon.technology";
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY not set in .env");

  const provider = new ethers.JsonRpcProvider(networkUrl);
  const signer = new ethers.Wallet(privateKey, provider);

  // Read the compiled contract artifact
  const artifact = await hre.artifacts.readArtifact("OrangeEconomyNFT");
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);

  const orangeNFT = await factory.deploy();
  await orangeNFT.waitForDeployment();

  console.log("✅ OrangeEconomyNFT deployed at:", await orangeNFT.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
