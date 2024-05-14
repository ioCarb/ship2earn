// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICarbToken {
    function mint(address to, uint256 amount) external;
}

contract IfMinting {
    uint private number = 0;


    ICarbToken public carbTokenContract;
    
    constructor(address carbTokenAddress) {
        carbTokenContract = ICarbToken(carbTokenAddress);
    }

    function ifFoo() public{
        if (number == 0) {
            carbTokenContract.mint(msg.sender, 1000);
        } else {
            number = 2;
        }
    }
}