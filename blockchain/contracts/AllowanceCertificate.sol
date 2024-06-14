// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract AllowanceCertificate is ERC721, ERC721URIStorage, AccessControl {
    bytes32 private constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    constructor() ERC721("AllowanceCertificate", "AC") {
        _grantRole(ADMIN_ROLE, msg.sender);
    }

}