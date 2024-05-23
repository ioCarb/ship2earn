// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";



contract PebbleRegistration is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    uint256 public pebblesCount = 0;

    struct Pebble {
        string vehicleId; // ID of the associated vehicle: bike, scooter, car, airplane
        bool isRegistered; 
    }

    // Mapping from device ID to Device struct
    mapping(string => Pebble) public pebbles;

    struct Vehicle {
        string vehicleId;
        string vehicleType;
        uint256 avgEmissions;
    }

    mapping(string => Vehicle) public vehicles;

    // Constructor to set the admin address
    constructor() {
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    modifier onlyUnregisteredPebble(string calldata pebbleId) {
        require(
            !pebbles[pebbleId].isRegistered,
            "Data Source already registered"
        );
        _;
    }

    // Event for device registration
    event PebbleRegistered(string pebbleId, string vehicleId, bool isRegistered);

    // Function to get the vehicle ID for a given pebble ID
    function getPebble(
        string calldata _pebbleId
    ) public view returns (string memory) {
        return pebbles[_pebbleId].vehicleId;
    }

    function pebblesCounter() public view returns (uint256) {
        return pebblesCount;
    }

    // Function to register a device to a vehicle
    function registerPebble(string calldata pebbleId, string calldata vehicleId) 
        public onlyRole(ADMIN_ROLE) {
        // If the pebble is already registered, return and emit event -> false means already registered
        if (pebbles[pebbleId].isRegistered) {
            emit PebbleRegistered(pebbleId, vehicleId, false);
            return;
        }

        pebbles[pebbleId] = Pebble({vehicleId: vehicleId, isRegistered: true});
        pebblesCount++;
        emit PebbleRegistered(pebbleId, vehicleId, true);
    }
    // Function to add a vehicle type
    function addVehicle(string calldata vehicleId, string calldata vehicleType, uint256 avgEmissions) 
        public onlyRole(ADMIN_ROLE) {
        vehicles[vehicleId] = Vehicle({vehicleId: vehicleId, vehicleType: vehicleType, avgEmissions: avgEmissions});
    }
}
