// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
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

    using Strings for uint256;
    using Strings for address;

    uint256 private _nextTokenId;

    struct NFTData {
        uint256 mintDate;
        address minterAddress;
        string customString;
    }

    mapping(uint256 => NFTData) private _nftData;

    // Assuming the contract deployment date as the start of week counting
    uint256 public immutable deploymentTimestamp;

    constructor() ERC721("CarbCertificate", "CRBC") {
        deploymentTimestamp = block.timestamp;
    }

    function mintNFT(address _wallet) public onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(_wallet, tokenId);

        uint256 weekNumber = (block.timestamp - deploymentTimestamp) / 1 weeks + 1;
        string memory customString = string(abi.encodePacked(
            "Congratulations, ", 
            _wallet.toHexString(), 
            " met the allowance for week ", 
            weekNumber.toString()
        ));

        _nftData[tokenId] = NFTData({
            mintDate: block.timestamp,
            minterAddress: msg.sender,
            customString: customString
        });

        return tokenId;
    }

    function getNFTData(uint256 tokenId) public view returns (NFTData memory) {
        require(_exists(tokenId), "NFT does not exist");
        return _nftData[tokenId];
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}