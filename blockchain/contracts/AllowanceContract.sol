// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

interface ITokenContract {
    function mint(address to, uint amount) external;
    function getTokens(address _company) external returns (uint256);
    function burn(address _company, uint256 _amount) external;
}

interface ICertContract {
    function mint(address to, string memory cert_type, uint amount) external;
}

/**
 * @title AllowanceContract
 * @dev Contract to verify and store achieved CO2 savings
 * TODO: Implement burn function to burn tokens, reduce trackedCO2, and check allowance
 */

contract AllowanceContract is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE"); // admin role set during construction
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE"); // only verifier SC should be able to store data 
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE"); // ioCarb operations team role

    // necessary company data to calculate ranking and savings, stored to process after final reporting
    struct Company {
        uint256 allowance;  // CO2 allowance for the company
        uint256 trackedCO2; // CO2 emissions recorded by the company     
    }
    mapping(address => Company) public companies;
    address[] public companyAddresses; // wallet addresses of companies, sorted by normalizedGR during initial data reporting

    ITokenContract private tokenContract;
    ICertContract private certContract;

    constructor() {
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    event verifierRoleSet(address verifier); // emitted when verifier role is set -> emits address of verifier
    event operatorRoleSet(address operator); // emitted when operator role is set -> emits address of operator
    event tokenContractSet(address tokenContract); // emitted when minting contract is set -> emits address of minting contract
    event certContractSet(address certContract); // emitted when certificate contract is set -> emits address of certificate contract
    event failedEmissionReport(address company, uint256 excess); // emitted when company exceeds allowance during initial reporting
    event successfullEmissionReport(address company, uint256 savings); // emitted when company meets or is below allowance during initial reporting

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

    // adds a company to the list of companies with their CO2 allowance
    function addCompany(address _company, uint256 _allowance) public onlyRole(OPERATOR_ROLE) {
        companies[_company] = Company({
            allowance: _allowance,
            trackedCO2: 0
        });
        companyAddresses.push(_company);
    }

    // adjusts the allowance of a company
    function adjustAllowance(address _company, uint256 _newAllowance) public onlyRole(OPERATOR_ROLE) {
        companies[_company].allowance = _newAllowance;
    }

    // called by Verifier Contract if proof is valid
    function emissionReport(address _company, uint256 _trackedCO2) public onlyRole(VERIFIER_ROLE) {
        companies[_company].trackedCO2 = _trackedCO2;
        if (companies[_company].trackedCO2 == companies[_company].allowance) {
            certContract.mint(_company, "allowance", 0);
            emit successfullEmissionReport(_company, 0);
        } else if (companies[_company].trackedCO2 < companies[_company].allowance) {
            uint256 savings = companies[_company].allowance - companies[_company].trackedCO2;
            certContract.mint(_company, "allowance", 0);
            emit successfullEmissionReport(_company, savings);
            tokenContract.mint(_company, savings);            // mint tokens corresponding to negative CO2 surplus
            companies[_company].trackedCO2 = companies[_company].allowance;
        } else {
            uint256 excess = companies[_company].trackedCO2 - companies[_company].allowance;
            emit failedEmissionReport(_company, excess);
        }
    }

    // burns tokens and mints certificates
    function burnTokens(uint256 _amount) public {
        address _company = msg.sender;
        if (_amount == 0) {
            _amount = tokenContract.getTokens(_company);
        }
        if (companies[_company].trackedCO2 == companies[_company].allowance) {
            tokenContract.burn(_company, _amount);
            //event
        } else if ((companies[_company].trackedCO2 > companies[_company].allowance) && 
        (_amount >= (companies[_company].trackedCO2 - companies[_company].allowance))) {
            uint256 _excess = companies[_company].trackedCO2 - companies[_company].allowance;
            certContract.mint(_company, "allowance", 0);
            emit successfullEmissionReport(_company, 0);
            tokenContract.burn(_company, _amount-_excess);
        } else {
            revert("Insufficient tokens to burn");
        }   
    }
}