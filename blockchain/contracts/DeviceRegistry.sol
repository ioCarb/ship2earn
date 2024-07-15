// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

interface IAllowanceContract {
    function increaseVehicleCount(address _company) external;
    function decreaseVehicleCount(address _company) external;
}

/**
 * @title DeviceRegistry
 * @dev Contract to register and bind a Pebble to a vehicle
 * done: only admin can register a pebble to a vehicle and also change the vehicle later
 * done: only admin can bind a unbind pebble to a wallet -> transfer ownership only by current owner or admin
 * done: add set functions for registration
 * done: add set functions for binding
 * done: add transfer function for binding
 * done: add getter functions for w3bstream
 * done: add events for w3bstream
 * done: add vehicle struct functions
 * todo: 
 */

contract DeviceRegistry is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    uint256 public pebblesCount = 0;

    struct Device {
        uint256 vehicleId;       // ID of the associated vehicle: bike, scooter, car, airplane
        bool isRegistered; 
        address wallet;         // Wallet address of the current owner
        bool isBound;
    }
    // Mapping from device ID to Device struct
    mapping(uint256 => Device) private devices;
    uint256[] private Device_devices;

    struct Vehicle {
        string vehicleType;
        uint256 avgEmissions;
    }
    mapping(uint256 => Vehicle) private vehicles;

    IAllowanceContract private allowanceContract;

    // Constructor to set the admin address
    constructor() {
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    // modifier //////////////////////////////////////////////////////////////////////////////////////
    
    modifier onlyUnregisteredDevice(uint256 _deviceID) {
        require(!devices[_deviceID].isRegistered, "Device already registered");
        _;
    }

    modifier onlyUnregisteredVehicle(uint256 _vehicleId) {
        require(!devices[_vehicleId].isBound, "Vehicle is already registered");
        _;
    }

    // events ////////////////////////////////////////////////////////////////////////////////////////

    event DeviceRegistered(uint256 deviceID, uint256 vehicleId, bool isRegistered);
    event DeviceBound(uint256 deviceID, address _wallet, bool isBound);
    event AllowanceContractSet(address _allowanceContract);

    // functions //////////////////////////////////////////////////////////////////////////////////////

    function setAllowanceContract(address _allowanceContract) public onlyRole(ADMIN_ROLE) {
        allowanceContract = IAllowanceContract(_allowanceContract);
        emit AllowanceContractSet(_allowanceContract);
    }

    // function to register a device to a vehicle
    function registerDevice(uint256 _deviceID, uint256 _vehicleId, address _wallet) 
        public onlyRole(OPERATOR_ROLE) onlyUnregisteredDevice(_deviceID) {
        devices[_deviceID] = Device({
            vehicleId: _vehicleId, 
            isRegistered: true, 
            wallet: _wallet, 
            isBound: true});
        Device_devices.push(_deviceID);
        allowanceContract.increaseVehicleCount(_wallet);
        emit DeviceRegistered(_deviceID, _vehicleId, true);
    }

    // function to register a vehicle
    function registerVehicle(uint256 _vehicleId, string calldata _vehicleType, uint256 _avgEmissions) 
        public onlyRole(OPERATOR_ROLE) onlyUnregisteredVehicle(_vehicleId){
        vehicles[_vehicleId] = Vehicle({vehicleType: _vehicleType, avgEmissions: _avgEmissions});
    }

    // function to switch the vehicle for a given device
    function switchVehicle(uint256 _deviceID, uint256 _vehicleId) 
        public onlyRole(OPERATOR_ROLE) {
        devices[_deviceID].vehicleId = _vehicleId;
        emit DeviceRegistered(_deviceID, _vehicleId, true);
    }

    // function to unregister a device
    function unregisterDevice(uint256 _deviceID) 
        public onlyRole(OPERATOR_ROLE) {
        allowanceContract.decreaseVehicleCount(devices[_deviceID].wallet);
        delete devices[_deviceID];
        emit DeviceRegistered(_deviceID, 0, false);
    } 

    // function to transfer the ownership of a device to a new user initiated by ioCarb (in an error scenario)
    function transferDeviceOwner(uint256 _deviceID, address _wallet) public onlyRole(OPERATOR_ROLE) {
        devices[_deviceID].wallet = _wallet;
        emit DeviceBound(_deviceID, _wallet, true);
    }

    // getter function to get all devices for a given wallet address
    function getDevicesByWallet(address _wallet) public view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < Device_devices.length; i++) {
            if (devices[Device_devices[i]].wallet == _wallet) {
                count++;
            }
        }
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < Device_devices.length; i++) {
            if (devices[Device_devices[i]].wallet == _wallet) {
                result[index] = Device_devices[i];
                index++;
            }
        }  
        return result;
    }

    // function to retrieve wallet address of a device
    function getDeviceWallet(uint256 _deviceID) public view returns (address) {
        return devices[_deviceID].wallet;
    }

    function getDeviceData(uint256 _deviceID) public view returns (uint256, uint256, address, bool) {
        return (devices[_deviceID].vehicleId, _deviceID, devices[_deviceID].wallet, devices[_deviceID].isBound);
    }

    function getVehicleData(uint256 _vehicleId) public view returns (string memory, uint256) {
        return (vehicles[_vehicleId].vehicleType, vehicles[_vehicleId].avgEmissions);
    }
}
