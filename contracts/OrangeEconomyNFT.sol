// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OrangeEconomyNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    uint96 public royaltyBps = 1000; // 10% default royalty

    constructor() ERC721("OrangeEconomyNFT", "ORANGE") Ownable(msg.sender) {}

    /**
     * @notice Mints a new Orange Economy NFT to a recipient with IPFS metadata URI
     */
    function mintTo(address recipient, string memory uri) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    /**
     * @notice Royalty info for EIP-2981 (used by OpenSea, etc.)
     */
    function royaltyInfo(uint256, uint256 salePrice)
        public
        view
        returns (address receiver, uint256 royaltyAmount)
    {
        royaltyAmount = (salePrice * royaltyBps) / 10000;
        return (owner(), royaltyAmount);
    }

    // Required overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
