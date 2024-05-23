// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
/**
 * @title PebbleBinding
 * @dev Contract to bind a Pebble to a wallet address (company)
 * TO DO: binding process in the hand of the user -> verification of signature necessary
 *     -> pebble has a signature object with an r and an s value of an ECDSA signature
 * - How to verify? Pebble tracker open oracle? MachineFi Portal? 
 * - already done with Pebble setup to MachineFi Portal
 * - currently, the binding is done by the admin, open to do
 * To DO: get function for w3bstream node to call to update DB
 */

contract PebbleBinding is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Binding {
        address wallet;
        bool isBound;
    }

    // Mapping from device ID to Device struct
    mapping(string => Binding) public bindings;

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
    function getWallet(
        string calldata _pebbleId
    ) public view returns (address) {
        return bindings[_pebbleId].wallet;
    }

    // Function to bind a pebble to a wallet
    function bindPebble(string calldata pebbleId, address wallet) 
        public onlyRole(ADMIN_ROLE) onlyUnboundPebble(pebbleId) {
        bindings[pebbleId] = Binding({wallet: wallet, isBound: true});
        emit PebbleBound(pebbleId, wallet, true);
    }

    function unBindPebble(string calldata pebbleId) 
        public onlyRole(ADMIN_ROLE) {
        bindings[pebbleId] = Binding({wallet: address(0), isBound: false});
        emit PebbleBound(pebbleId, address(0), false);
    }
}