// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OrangeMarketplace is Ownable {
    struct Listing {
        address seller;
        uint256 price;      // in wei
        bool active;
    }

    // nftContract => tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) public listings;

    event Listed(address indexed nftContract, uint256 indexed tokenId, uint256 price, address seller);
    event Purchased(address indexed nftContract, uint256 indexed tokenId, address buyer, uint256 price);

    constructor() Ownable(msg.sender) {}

    /// @notice Seller lists their NFT for a fixed price (must approve marketplace first)
    function listForSale(address nftContract, uint256 tokenId, uint256 price) external {
        require(price > 0, "Price must be > 0");

        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(
            nft.getApproved(tokenId) == address(this) || nft.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );

        listings[nftContract][tokenId] = Listing(msg.sender, price, true);
        emit Listed(nftContract, tokenId, price, msg.sender);
    }

    /// @notice Buy the NFT (payable)
    function buy(address nftContract, uint256 tokenId) external payable {
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.active, "Listing not active");
        require(msg.value >= listing.price, "Insufficient funds");

        listing.active = false;

        // Get royalty (EIP-2981)
        (address royaltyReceiver, uint256 royaltyAmount) = _getRoyalty(nftContract, tokenId, listing.price);
        uint256 sellerAmount = listing.price - royaltyAmount;

        // Pay royalty to creator
        if (royaltyAmount > 0) {
            payable(royaltyReceiver).transfer(royaltyAmount);
        }

        // Pay seller the rest
        payable(listing.seller).transfer(sellerAmount);

        // Transfer NFT to buyer
        IERC721(nftContract).safeTransferFrom(listing.seller, msg.sender, tokenId);

        emit Purchased(nftContract, tokenId, msg.sender, listing.price);

        // Refund any excess payment
        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }
    }

    function _getRoyalty(address nftContract, uint256 tokenId, uint256 salePrice)
        internal view returns (address receiver, uint256 amount)
    {
        if (IERC165(nftContract).supportsInterface(type(IERC2981).interfaceId)) {
            try IERC2981(nftContract).royaltyInfo(tokenId, salePrice) returns (address r, uint256 a) {
                return (r, a);
            } catch {}
        }
        return (address(0), 0);
    }

    function cancelListing(address nftContract, uint256 tokenId) external {
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.seller == msg.sender, "Not the seller");
        listing.active = false;
    }
}
