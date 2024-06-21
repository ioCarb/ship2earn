// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

//import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title CarbToken
 * @dev ERC20 token contract for carbon credits
 * TODO: 
 * TODO: 
 */

contract CarbToken is ERC20, AccessControl	{
    bytes32 private constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 private constant BURNER_ROLE = keccak256("BURNER_ROLE");

    constructor() ERC20("Carb_Token", "CRB") {
        // Grant the default admin every role for initial deployments and testing 
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
    }

    event minterRoleSet(address minter);
    event burnerRoleSet(address burner);
    event minted(address to, uint256 amount);
    event burned(address from, uint256 amount);
    

    function setMinter(address _minter) public onlyRole(ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, _minter);
        emit minterRoleSet(_minter);
    }

    function setBurner(address _burner) public onlyRole(ADMIN_ROLE) {
        _grantRole(BURNER_ROLE, _burner);
        emit burnerRoleSet(_burner);
    }

    function mint(address _to, uint256 _amount) public onlyRole(MINTER_ROLE) {
        _mint(_to, _amount);
        emit minted(_to, _amount);
    }

    function burn(address _from, uint256 _amount) public onlyRole(BURNER_ROLE) {
        _burn(_from, _amount);
        emit burned(_from, _amount);
    }

}