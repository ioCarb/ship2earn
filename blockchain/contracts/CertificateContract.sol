// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

contract CarbonCertificate is ERC721, ERC721URIStorage, AccessControl {
    
    //0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a
    //bytes32 internal constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    //0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775
    bytes32 private constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    //0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6
    bytes32 internal constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    uint256 internal _nextTokenId;
    uint256[] public allTokens;

    mapping(uint256 => address) internal Owner;
    mapping(uint256 => uint256) internal mintDates;
    mapping(uint256 => bool) internal isBurned;

    event TokenBurned(uint256 indexed tokenId, address indexed owner);
    
    constructor() ERC721("Carbon Certificate", "CC") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "";
    }

    function safeMintGreen(address _to) public onlyRole(MINTER_ROLE) {
        uint256 tokenId = _nextTokenId++;
        uint256 expiryDate = block.timestamp + 90 days;             //Expiry date is set to 90 days from the current block timestamp
        _safeMint(_to, tokenId);
        mintDates[tokenId] = block.timestamp;                       //Add Mint-Timestamp to Mapping
        Owner[tokenId] = _to;                                       //Add Owner-address to Mapping
        allTokens.push(tokenId);                                    // Store the tokenId in the allTokens array
        _setTokenURI(tokenId, string.concat("TokenID: ", Strings.toString(tokenId), ", Kategorie: Green, ", "Owner: ", toAsciiString(_to), ", Expiry Date: ", Strings.toString(expiryDate)));
    }

    function safeMintYellow(address _to) public onlyRole(MINTER_ROLE) {
        uint256 tokenId = _nextTokenId++;
        uint256 expiryDate = block.timestamp + 90 days;             //Expiry date is set to 90 days from the current block timestamp
        _safeMint(_to, tokenId);
        mintDates[tokenId] = block.timestamp;                       //Add Mint-Timestamp to Mapping
        Owner[tokenId] = _to;                                       //Add Owner-address to Mapping
        allTokens.push(tokenId);                                    // Store the tokenId in the allTokens array
        _setTokenURI(tokenId, string.concat("TokenID: ", Strings.toString(tokenId), ", Kategorie: Yellow, ", "Owner: ", toAsciiString(_to), ", Expiry Date: ", Strings.toString(expiryDate)));
    }

    function safeMintRed(address _to) public onlyRole(MINTER_ROLE) {
        uint256 tokenId = _nextTokenId++;
        uint256 expiryDate = block.timestamp + 90 days;             //Expiry date is set to 90 days from the current block timestamp
        _safeMint(_to, tokenId);
        mintDates[tokenId] = block.timestamp;                       //Add Mint-Timestamp to Mapping
        Owner[tokenId] = _to;                                       //Add Owner-address to Mapping
        allTokens.push(tokenId);                                    // Store the tokenId in the allTokens array
        _setTokenURI(tokenId, string.concat("TokenID: ", Strings.toString(tokenId), ", Kategorie: Red, ", "Owner: ", toAsciiString(_to), ", Expiry Date: ", Strings.toString(expiryDate)));
    }

    function burn(uint256 tokenId) public {
        require(msg.sender == Owner[tokenId], "Caller is not owner");
        require(!isBurned[tokenId], "Token is already burned");
        isBurned[tokenId] = true;
        _burn(tokenId);
    }

    function checkUpkeep() view public onlyRole(ADMIN_ROLE) returns (bool upkeepNeeded) {
        for (uint256 i = 0; i < _nextTokenId; i++) {
            if (block.timestamp >= mintDates[i] + 90 days) {
                upkeepNeeded = true;
                return (upkeepNeeded);
            }
        }
        upkeepNeeded = false;
        return (upkeepNeeded);
    }

    function performUpkeep() external onlyRole(ADMIN_ROLE) {
        for (uint256 i = 0; i < _nextTokenId; i++) {
            if (block.timestamp >= mintDates[i] + 90 days&& !isBurned[i]) {
                isBurned[i] = true;
                _burn(i);
                emit TokenBurned(i, ownerOf(i));
            }
        }
    }

    function getOwners() public view returns (string memory) {
        string memory result;
        for (uint256 i = 0; i < allTokens.length; i++) {
            result = string(abi.encodePacked(result, Strings.toString(allTokens[i]), ":", toAsciiString(Owner[allTokens[i]]), ", "));
        }
        return result;
    }

    function getNftStates() public view returns (string memory) {
        string memory result;
        for (uint256 i = 0; i < allTokens.length; i++) {
            result = string(abi.encodePacked(result, Strings.toString(allTokens[i]), ":", boolToString(isBurned[allTokens[i]]), ", "));
        }
    return result;
    }
    
    function boolToString(bool value) internal pure returns (string memory) {
        return value ? "true" : "false";
    }

    //Required to make address to readable ascii-address
    function toAsciiString(address x) internal pure returns (string memory) {
    bytes memory s = new bytes(40);
    for (uint i = 0; i < 20; i++) {
        bytes1 b = bytes1(uint8(uint(uint160(x)) / (2**(8*(19 - i)))));
        bytes1 hi = bytes1(uint8(b) / 16);
        bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
        s[2*i] = char(hi);
        s[2*i+1] = char(lo);            
    }
    return string(s);
    }
    
    //Required to make address to readable ascii-address
    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }

    
    // The following functions are overrides required by Solidity.
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

}