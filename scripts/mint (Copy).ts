import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("🚀 Minting test Orange Economy NFT...");

  const networkUrl = "https://rpc-amoy.polygon.technology";
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY not set in .env");

  const provider = new ethers.JsonRpcProvider(networkUrl);
  const signer = new ethers.Wallet(privateKey, provider);

  const contractAddress = "0xbBd713a3EdeA46343887aC1CDCfBa2e8F74FECc8";
  const abi = [
    "function mintTo(address recipient, string memory uri) public returns (uint256)",
  ];

  const contract = new ethers.Contract(contractAddress, abi, signer);

  // Example IPFS metadata (replace with real one later)
  const testMetadataUri = "ipfs://bafkreid7v7g7z7v7g7z7v7g7z7v7g7z7v7g7z7v7g7z7v7g7z7v7g7z7v7g7z7"; // ← change this

  const tx = await contract.mintTo(signer.address, testMetadataUri);
  await tx.wait();

  console.log("✅ NFT minted! Transaction:", tx.hash);
  console.log("🔗 View on Amoy Explorer: https://amoy.polygonscan.com/tx/" + tx.hash);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
