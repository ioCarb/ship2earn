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

    constructor() ERC721("CarbCertificate", "CRBC") {
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function setMinter(address _minterAddress) public onlyRole(ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, _minterAddress);
    }

    // Get the week number and year from a timestamp
    function getWeekNumberAndYear(uint256 timestamp) public pure returns (uint256 week, uint256 year) {
        // Calculate the year
        year = 1970;
        uint256 secondsInYear = 31536000; // 365 days
        uint256 secondsInLeapYear = 31622400; // 366 days
        
        while (timestamp >= secondsInYear) {
            if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
                if (timestamp >= secondsInLeapYear) {
                    timestamp -= secondsInLeapYear;
                    year++;
                } else {
                    break;
                }
            } else {
                timestamp -= secondsInYear;
                year++;
            }
        }

        // Calculate the week number
        uint256 dayOfYear = timestamp / 86400; // 86400 seconds in a day
        uint256 wday = (dayOfYear + 3) % 7; // Day of week with Monday as 0
        week = (dayOfYear + 7 - wday) / 7;

        if (week == 0) {
            year--;
            week = 52;
            // Check if the last year was a leap year
            if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
                week = 53;
            }
        }
    }

    // Mint a new NFT, company will receive a certificate for meeting the allowance for the past week
    function mintNFT(address _wallet) public onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(_wallet, tokenId);

        (uint256 weekNumber, uint256 year) = getWeekNumberAndYear(block.timestamp);

        string memory customString = string(abi.encodePacked(
            "Congratulations, ",
            Strings.toHexString(uint160(_wallet), 20),
            " met the allowance for week ",
            weekNumber.toString(),
            " in ",
            year.toString()
        ));

        _nftData[tokenId] = NFTData({
            mintDate: block.timestamp,
            minterAddress: msg.sender,
            customString: customString
        });

        return tokenId;
    }

    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 index = 0;

        for (uint256 tokenId = 0; tokenId < _nextTokenId; tokenId++) {
            if (_exists(tokenId) && ownerOf(tokenId) == owner) {
                tokenIds[index] = tokenId;
                index++;
            }
        }
        return tokenIds;
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