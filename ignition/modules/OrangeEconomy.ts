import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const OrangeEconomyModule = buildModule("OrangeEconomyModule", (m) => {
  
  // Deploy NFT Contract (No constructor args needed)
  const orangeNFT = m.contract("OrangeEconomyNFT");

  // Deploy Marketplace Contract (No constructor args needed)
  const marketplace = m.contract("OrangeMarketplace");

  return { 
    orangeNFT, 
    marketplace 
  };
});

export default OrangeEconomyModule;
