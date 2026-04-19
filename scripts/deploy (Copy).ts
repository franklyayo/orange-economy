import hre from "hardhat";
//import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying OrangeEconomyNFT to Polygon Amoy...");

  const OrangeEconomyNFT = await hre.ethers.getContractFactory("OrangeEconomyNFT");
  const orangeNFT = await OrangeEconomyNFT.deploy();

  await orangeNFT.waitForDeployment();
  const address = await orangeNFT.getAddress();

  console.log("✅ OrangeEconomyNFT deployed to:", address);
  console.log(`🔗 View on Amoy Explorer: https://amoy.polygonscan.com/address/${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
