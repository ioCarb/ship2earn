// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbToken is ERC20 {
    address public owner;

    constructor() ERC20("CarbToken", "CRB") {
        owner = msg.sender;
    }

    // openzeppelin import did not work so modifier created here
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    // minting process with simple logic of amount will be minted and send to address
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}