import { ethers } from "ethers";
import * as dotenv from "dotenv";
import pinataSDK from '@pinata/sdk'; // Import Pinata SDK
import * as fs from 'fs'; // To read your image file
dotenv.config();

async function main() {
  console.log("🚀 Minting test Orange Economy NFT...");

  const networkUrl = "https://rpc-amoy.polygon.technology";
  const privateKey = process.env.PRIVATE_KEY;
  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;

  if (!privateKey) throw new Error("PRIVATE_KEY not set in .env");
  if (!pinataApiKey || !pinataSecretApiKey) throw new Error("Pinata keys not set in .env");

  const provider = new ethers.JsonRpcProvider(networkUrl);
  const signer = new ethers.Wallet(privateKey, provider);
  const contractAddress = "0xbBd713a3EdeA46343887aC1CDCfBa2e8F74FECc8";
  const abi = [ "function mintTo(address recipient, string memory uri) public returns (uint256)" ];
  const contract = new ethers.Contract(contractAddress, abi, signer);

  // 1. Initialize Pinata
  const pinata = new pinataSDK(pinataApiKey, pinataSecretApiKey);

  // 2. Upload your image to IPFS
  const imageStream = fs.createReadStream('./signature.jpg'); // Replace with your image path
  const imageUpload = await pinata.pinFileToIPFS(imageStream, {
    pinataMetadata: { name: "My Orange Economy NFT Image" }
  });
  const imageCid = imageUpload.IpfsHash;
  console.log(`🖼️  Image uploaded to IPFS: ipfs://${imageCid}`);

  // 3. Create and upload the metadata JSON
  const metadata = {
    name: "Orange Economy NFT #1",
    description: "A unique piece of Nigerian creativity from the Naija IP Marketplace.",
    image: `ipfs://${imageCid}`,
    // You can add more attributes here if needed
  };
  const metadataUpload = await pinata.pinJSONToIPFS(metadata, {
    pinataMetadata: { name: "Orange Economy NFT Metadata #1" }
  });
  const metadataCid = metadataUpload.IpfsHash;
  const metadataUri = `ipfs://${metadataCid}`;
  console.log(`📄 Metadata uploaded to IPFS: ${metadataUri}`);

  // 4. Mint the NFT
  const tx = await contract.mintTo(signer.address, metadataUri);
  await tx.wait();

  console.log("✅ NFT minted! Transaction:", tx.hash);
  console.log("🔗 View on Amoy Explorer: https://amoy.polygonscan.com/tx/" + tx.hash);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
