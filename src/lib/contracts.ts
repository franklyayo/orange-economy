export const ORANGE_NFT_ADDRESS = "0xbBd713a3EdeA46343887aC1CDCfBa2e8F74FECc8" as const;
export const MARKETPLACE_ADDRESS = "0x890f4884633A083d1CD78228A823e704AA6f6D2f" as const;

export const marketplaceAbi = [
  "function listForSale(address nftContract, uint256 tokenId, uint256 price) external",
  "function buy(address nftContract, uint256 tokenId) external payable",
  "function cancelListing(address nftContract, uint256 tokenId) external",
  "function listings(address nftContract, uint256 tokenId) external view returns (address seller, uint256 price, bool active)",
] as const;
