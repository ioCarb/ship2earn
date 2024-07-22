// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

interface ITokenContract {
    function mint(address to, uint amount) external;
    function balanceOf(address _company) external returns (uint256);
    function burn(address _company, uint256 _amount) external;
}

interface ICertContract {
    function mint(address to) external;
}

interface IDeviceRegistry {
    function getDeviceWallet(uint256 _deviceID) external returns (address);
}

/**
 * @title AllowanceContract
 * @dev Contract to verify and store CO2 emissions and check them against a respective company allowance
 * TODO: 
 */

contract AllowanceContract is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE"); // admin role set during construction
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE"); // only verifier SC should be able to store data 
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE"); // ioCarb operations team role

    // necessary company data to calculate ranking and savings, stored to process after final reporting
    struct Company {
        uint256 allowance;          // CO2 allowance for the company
        uint256 trackedCO2;         // CO2 emissions recorded by the company  
        uint32 num_vehicles;        // number of vehicles in the company
        uint32 vehicles_tracked;    // number of vehicles with CO2 data
    }
    mapping(address => Company) public companies;
    address[] public companyAddresses; // wallet addresses of companies, sorted by normalizedGR during initial data reporting

    ITokenContract private tokenContract;
    ICertContract private certContract;
    IDeviceRegistry private deviceRegistry;

    constructor() {
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    event verifierRoleSet(address verifier); // emitted when verifier role is set -> emits address of verifier
    event operatorRoleSet(address operator); // emitted when operator role is set -> emits address of operator
    event tokenContractSet(address tokenContract); // emitted when minting contract is set -> emits address of minting contract
    event certContractSet(address certContract); // emitted when certificate contract is set -> emits address of certificate contract
    event deviceRegistrySet(address deviceRegistry); // emitted when device registry contract is set -> emits address of device registry contract
    event CompanyAdded(address company, uint256 allowance); // emitted when a company is added to the list of companies
    event EmissionReportReceived(address company, uint256 excess, bool achieved); // emitted when companys allowance is checked 
    event CompanyDataReady(uint256 _vehicleID, address _company, uint256 _trackedCO2, bool r); // emitted when all vehicles of a company have reported their CO2 emissions

    // sets the verifier role to the address of the verifier contract
    function setVerifierRole(address _verifier) public onlyRole(ADMIN_ROLE) {
        _grantRole(VERIFIER_ROLE, _verifier);
        emit verifierRoleSet(_verifier);
    }

    // sets the operator role
    function setOperatorRole(address _operator) public onlyRole(ADMIN_ROLE) {
        _grantRole(OPERATOR_ROLE, _operator);
        emit operatorRoleSet(_operator);
    }

    // sets the minting contract to the address of the minting contract
    function setMintingContract(address _mintingContract) public onlyRole(ADMIN_ROLE) {
        tokenContract = ITokenContract(_mintingContract);
        emit tokenContractSet(_mintingContract);
    }

    // sets the certificate contract to the address of the certificate contract
    function setCertContract(address _certContract) public onlyRole(ADMIN_ROLE) {
        certContract = ICertContract(_certContract);
        emit certContractSet(_certContract);
    }

    // sets the device registry contract to the address of the device registry contract
    function setDeviceRegistry(address _deviceRegistry) public onlyRole(ADMIN_ROLE) {
        deviceRegistry = IDeviceRegistry(_deviceRegistry);
        emit deviceRegistrySet(_deviceRegistry);
    }

    // adds a company to the list of companies with their CO2 allowance
    function addCompany(address _company, uint256 _allowance) public onlyRole(OPERATOR_ROLE) {
        companies[_company] = Company({
            allowance: _allowance,
            trackedCO2: 0,
            num_vehicles: 0,
            vehicles_tracked: 0
        });
        companyAddresses.push(_company);
        emit CompanyAdded(_company, _allowance);
    }

    // adjusts the allowance of a company
    function adjustAllowance(address _company, uint256 _newAllowance) public onlyRole(OPERATOR_ROLE) {
        companies[_company].allowance = _newAllowance;
    }

    // increases the number of vehicles of a company
    function increaseVehicleCount(address _company) public onlyRole(OPERATOR_ROLE) {
        companies[_company].num_vehicles += 1;
    }

    // decreases the number of vehicles of a company
    function decreaseVehicleCount(address _company) public onlyRole(OPERATOR_ROLE) {
        companies[_company].num_vehicles -= 1;
    }

    // called by Verifier Contract if proof is valid
    function emissionReport(uint256 _deviceID, address _company, uint256 _trackedCO2) public onlyRole(VERIFIER_ROLE) {
        address tmp = deviceRegistry.getDeviceWallet(_deviceID);
        require(tmp == _company, "Vehicle not registered to company");
        companies[_company].trackedCO2 += _trackedCO2;
        companies[_company].vehicles_tracked += 1;
        if (companies[_company].vehicles_tracked == companies[_company].num_vehicles) {
            emit CompanyDataReady(_deviceID, tmp, _trackedCO2, true);
            checkAllowance(_company);
        } else {
            emit CompanyDataReady(_deviceID, tmp, _trackedCO2, false);
        }
    }

    // checks if the company has reached its CO2 allowance the moment all vehicles have reported their CO2 emissions
    function checkAllowance(address _company) internal {
        if (companies[_company].trackedCO2 == companies[_company].allowance) {
            certContract.mint(_company);
            emit EmissionReportReceived(_company, 0, true);
        } else if (companies[_company].trackedCO2 < companies[_company].allowance) {
            uint256 savings = companies[_company].allowance - companies[_company].trackedCO2;
            certContract.mint(_company);
            tokenContract.mint(_company, savings);            // mint tokens corresponding to negative CO2 surplus
            emit EmissionReportReceived(_company, savings, true);
        } else {
            uint256 excess = companies[_company].trackedCO2 - companies[_company].allowance;
            emit EmissionReportReceived(_company, excess, false);
        }
    }

    // resets the tracked CO2 emissions and the number of vehicles tracked for a company, to be calles by ioCarb operations team
    function resetCompanyData(address _company) public onlyRole(OPERATOR_ROLE) {
        companies[_company].trackedCO2 = 0;
        companies[_company].vehicles_tracked = 0;
    }

    // burns tokens to offset excess CO2 emissions
    function offsetExcess() public {
        address _company = msg.sender;
        uint256 _excess = companies[_company].trackedCO2 - companies[_company].allowance;
        if (_excess == 0) {
            revert("No excess to offset");
        } else {
            uint256 _amount = tokenContract.balanceOf(_company);
            if (_amount >= _excess) {
                tokenContract.burn(_company, _excess);
                companies[_company].trackedCO2 = companies[_company].allowance;
                certContract.mint(_company);
                emit EmissionReportReceived(_company, 0, true);
            } else {
                revert("Insufficient tokens to offset excess");
            }
        }
    }

    // function to view current company stats
    function getCompanyStats(address _company) public view returns (uint256, uint256, uint32, uint32) {
        return (companies[_company].allowance, companies[_company].trackedCO2, companies[_company].num_vehicles, companies[_company].vehicles_tracked);
    }
}