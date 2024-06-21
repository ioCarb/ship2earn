// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title DeviceRegistry
 * @dev Contract to register and bind a Pebble to a vehicle
 * done: only admin can register a pebble to a vehicle and also change the vehicle later
 * done: only admin can bind a unbind pebble to a wallet -> transfer ownership only by current owner or admin
 * done: add set functions for registration
 * done: add set functions for binding
 * done: add transfer function for binding
 * TODO: add getter functions for w3bstream
 * todo: add events for w3bstream
 * todo: add vehicle struct functions
 * todo: 
 */

contract DeviceRegistry is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    uint256 public pebblesCount = 0;

    struct Device {
        string vehicleId;       // ID of the associated vehicle: bike, scooter, car, airplane
        bool isRegistered; 
        address wallet;         // Wallet address of the current owner
        bool isBound;
    }

    // Mapping from device ID to Device struct
    mapping(string => Device) private devices;
    string[] private Device_devices;

    struct Vehicle {
        string vehicleId;
        string vehicleType;
        uint256 avgEmissions;
    }

    mapping(string => Vehicle) private vehicles;

    // Constructor to set the admin address
    constructor() {
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // modifier //////////////////////////////////////////////////////////////////////////////////////
    
    modifier onlyUnregisteredDevice(string calldata _deviceID) {
        require(!devices[_deviceID].isRegistered, "Device already registered");
        _;
    }

    modifier onlyUnboundDevice(string calldata _deviceID) {
        require(!devices[_deviceID].isBound, "Device already bound");
        _;
    }

    // events ////////////////////////////////////////////////////////////////////////////////////////

    event DeviceRegistered(string deviceID, string vehicleId, bool isRegistered);
    event DeviceBound(string deviceID, address _wallet, bool isBound);

    // functions //////////////////////////////////////////////////////////////////////////////////////

    // function to register a device to a vehicle
    function registerDevice(string calldata _deviceID, string calldata _vehicleId) 
        public onlyRole(ADMIN_ROLE) onlyUnregisteredDevice(_deviceID) {
        devices[_deviceID] = Device({vehicleId: _vehicleId, isRegistered: true, wallet: address(0), isBound: false});
        emit DeviceRegistered(_deviceID, _vehicleId, true);
    }

    // function to switch the vehicle for a given device
    function switchVehicle(string calldata _deviceID, string calldata _vehicleId) 
        public onlyRole(ADMIN_ROLE) {
        devices[_deviceID].vehicleId = _vehicleId;
        emit DeviceRegistered(_deviceID, _vehicleId, true);
    }

    // function to bind a device to a wallet (user)
    function bindDevice(string calldata _deviceID, address _wallet) 
        public onlyRole(ADMIN_ROLE)  {
        devices[_deviceID].wallet = _wallet;
        devices[_deviceID].isBound = true;
        emit DeviceBound(_deviceID, _wallet, true);
    }

    // function to transfer the ownership of a device to a new user initiated by the current owner
    function transferDeviceOwnerUser(string calldata _deviceID, address _wallet) public {
        require(devices[_deviceID].wallet == msg.sender, "You are not the owner of the device");
        devices[_deviceID].wallet = _wallet;
        emit DeviceBound(_deviceID, _wallet, true);
    }

    // function to transfer the ownership of a device to a new user initiated by ioCarb (in an error scenario)
    function transferDeviceOwnerIoCarb(string calldata _deviceID, address _wallet) 
        public onlyRole(ADMIN_ROLE) {
        devices[_deviceID].wallet = _wallet;
        emit DeviceBound(_deviceID, _wallet, true);
    }
}
