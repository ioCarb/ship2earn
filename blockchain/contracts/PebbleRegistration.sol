// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

// import "hardhat/console.sol";

contract PebbleRegistration {
    uint256 public pebblesCount = 0;

    struct Pebble {
        string vehicleId; // ID of the associated vehicle: bike, scooter, car, airplane
        bool isRegistered;
    }

    // Mapping from device ID to Device struct
    mapping(string => Pebble) public pebbles;

    // Address of the developer or admin
    address public admin;

    // Constructor to set the admin address
    constructor(address _admin) {
        admin = _admin;
    }

    // Modifier to restrict access to admin
    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
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
    function registerDevice(
        string calldata pebbleId,
        string calldata vehicleId
    ) public onlyAdmin {
        // If the pebble is already registered, return and emit event -> false means already registered
        if (pebbles[pebbleId].isRegistered) {
            // console.log("Data Source already registered");
            emit PebbleRegistered(pebbleId, vehicleId, false);
            return;
        }

        pebbles[pebbleId] = Pebble({vehicleId: vehicleId, isRegistered: true});

        pebblesCount++;

        emit PebbleRegistered(pebbleId, vehicleId, true);
    }
}
