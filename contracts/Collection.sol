// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title An EIP-721 Customizable Collection
/// @author sacredwx
/// @notice Used by the deployeer to serve as a customizable collection
/// @dev All the functions disclosed to the owner only
contract Collection is ERC721, ERC721URIStorage, Ownable {
    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    /// @notice mints a new token in the collection
    /// @param to is the recipient
    /// @param tokenId shall not exist and refers to the id of the token
    /// @param uri of the token
    function mint(address to, uint256 tokenId, string memory uri)
        public
        onlyOwner
    {
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    /// @notice burns a token
    /// @param tokenId shall not exist and refers to the id of the token
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /// @notice sets the uri for the token
    /// @param tokenId shall not exist and refers to the id of the token
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /// @notice checks wether the collection supports an interface
    /// @param interfaceId an interface id
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}