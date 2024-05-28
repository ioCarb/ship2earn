// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
/**
 * @title PebbleBinding
 * @dev Contract to bind a Pebble to a wallet address (company)
 * Done: get function for w3bstream node to call to update DB -> getPebbles
 */

contract PebbleBinding is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Binding {
        address wallet;
        bool isBound;
    }

    // Mapping from device ID to Device struct
    mapping(string => Binding) public bindings;
    string[] public Binding_bindings;

    // Constructor to set the admin address
    constructor() {
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    modifier onlyUnboundPebble(string calldata pebbleId) {
        require(
            !bindings[pebbleId].isBound,
            "Pebble already bound"
        );
        _;
    }

    // Event for device registration
    event PebbleBound(string pebbleId, address wallet, bool isBound);

    // Function to get the wallet address for a given pebble ID
    function getWallet(string calldata _pebbleId) public view returns (address) {
        return bindings[_pebbleId].wallet;
    }

    // Function to get the pebbleIDs for a given wallet address
    function getPebbles(address _wallet) public view returns (string[] memory) {
        string[] memory pebbleIds = new string[](Binding_bindings.length);
        for (uint i = 0; i < Binding_bindings.length; i++) {
            if (bindings[Binding_bindings[i]].wallet == _wallet) {
                pebbleIds[i] = Binding_bindings[i];
            } else {
                pebbleIds[i] = "";
            }
        }
        return pebbleIds;
    }

    // Function to bind a pebble to a wallet
    function bindPebble(string calldata pebbleId, address wallet) 
        public onlyRole(ADMIN_ROLE) onlyUnboundPebble(pebbleId) {
        bindings[pebbleId] = Binding({wallet: wallet, isBound: true});
        Binding_bindings.push(pebbleId);
        emit PebbleBound(pebbleId, wallet, true);
    }

    function unBindPebble(string calldata pebbleId) 
        public onlyRole(ADMIN_ROLE) {
        bindings[pebbleId] = Binding({wallet: address(0), isBound: false});
        emit PebbleBound(pebbleId, address(0), false);
    }
}