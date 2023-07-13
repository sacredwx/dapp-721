// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./Collection.sol";

/// @title Deployer of EIP-721 Collections
/// @author sacredwx
/// @notice Deploys new collections and mint new tokens on them
/// @dev Minting is public, while onlt the collection deployment is protected to the owner
contract Deployer721 is Ownable {
    event CollectionCreated(address collection, string name, string symbol);
    event TokenMinted(address collection, address recipient, uint256 tokenId, string tokenUri);

    // Collections Index (for future use)
    Collection[] public collections;
    // Mapping for fast existance verification
    mapping(Collection => bool) public collectionsLookup;

    /// @notice deploy new collection
    /// @param name of the new collection
    /// @param symbol of the new collection
    /// @dev protected to the owner only
    function deployCollection(string memory name, string memory symbol) public onlyOwner {
        Collection collection = new Collection(name, symbol);
        collections.push(collection); // (for future use)
        collectionsLookup[collection] = true;

        emit CollectionCreated(address(collection), name, symbol);
    }
    
    /// @notice mint new token in a specified collection
    /// @dev publicly available
    /// @dev only for deployed previously collections
    /// @param collection is the address of the collection to mint on
    /// @param tokenId shall not exist and refers to the id of the token
    /// @param uri of the token
    /// @param to is the recipient
    function mint(Collection collection, uint256 tokenId, string memory uri, address to)
        public
    {
        require(collectionsLookup[collection], "This collection does not belong to the index");
        collection.mint(to, tokenId, uri);

        emit TokenMinted(address(collection), to, tokenId, uri);
    }
}
