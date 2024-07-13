// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CarbCertificate
 * @dev ERC721 token contract for carbon certificates
 * TODO: 
 * TODO: 
 */

contract CarbCertificate is ERC721, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // Mapping from token ID to IPFS CID
    mapping(uint256 => string) private _tokenCIDs;

    // Base URI for constructing token URIs
    string private _baseTokenURI;

    constructor(string memory baseTokenURI) ERC721("CarbCert", "CRBC") {
        _baseTokenURI = baseTokenURI;
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // Function to mint a new token and set its CID
    function mint(address to, uint256 tokenId, string memory cid) public onlyRole(ADMIN_ROLE) {
        _mint(to, tokenId);
        _setTokenCID(tokenId, cid);
    }

    // Internal function to set the CID for a token
    function _setTokenCID(uint256 tokenId, string memory cid) internal virtual {
        require(_ownerOf(tokenId) != address(0), "ERC721Metadata: CID set of nonexistent token");
        _tokenCIDs[tokenId] = cid;
    }

    // Override tokenURI to return the full IPFS link
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "ERC721Metadata: URI query for nonexistent token");

        string memory cid = _tokenCIDs[tokenId];
        return string(abi.encodePacked(_baseTokenURI, cid));
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // Public function to set a new base URI
    function setBaseURI(string memory baseTokenURI) public onlyRole(ADMIN_ROLE) {
        _baseTokenURI = baseTokenURI;
    }
}