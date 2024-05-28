// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

interface IMintingContract {
    function mint(address to, uint amount) external;
}

/**
 * @title RankingContract
 * @dev Contract to rank companies based on their normalized GHG emissions
 * 2nd it. TO DO: Update set function for totalCompanies (who and when?) potentially during Registration or Binding
 * 2nd it. TO DO: Add a role for ioCarb besides ADMIN_ROLE for operational tasks
 * Done: Check the Ranking Algorithm if best is first or last -> index 0 is best, implementation correct
 * Done: calculateRanking() should be called by ioCarb after all companies have reported their data
 * public address, signed 
 */

contract RankingContract is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINT_ROLE = keccak256("MINT_ROLE");
    bytes32 public constant RANKING_ROLE = keccak256("RANKING_ROLE");

    // necessary company data to calculate ranking and savings, stored to process after final reporting
    struct Company {
        uint normalizedGR;
        uint totalCO2Company;
        uint totalDistanceCompany;
    }

    mapping(address => Company) public companies;
    address[] public companyAddresses;          // wallet addresses of companies, sorted by normalizedGR during initial data reporting
    uint public companiesCount;                 // number of companies that have reported their data
    uint public totalCompanies;                 // total number of companies that should report their data
    uint public avgCO2PerKm;                    // average CO2 emissions per km, calculated from all companies in calculateRanking()
    address[] public topCompanies;              // companies that will receive CO2 savings

    address public mintingContract;

    constructor() {
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function setTotalCompanies(uint _totalCompanies) public onlyRole(ADMIN_ROLE) {
        totalCompanies = _totalCompanies;
    }

    function setRankingRole(address _rankingRole) public onlyRole(ADMIN_ROLE) {
        _grantRole(RANKING_ROLE, _rankingRole);
    }

    function setMintingContract(address _mintingContract) public onlyRole(ADMIN_ROLE) {
        mintingContract = _mintingContract;
    }

    // called by Verifier Contract if proof is valid
    function receiveData(address company, uint totalCO2Company, uint totalDistanceCompany, uint normalizedGR) public
        onlyRole(RANKING_ROLE) {
            companies[company] = Company({
                normalizedGR: normalizedGR,
                totalCO2Company: totalCO2Company,
                totalDistanceCompany: totalDistanceCompany
            });
            // add company immediately to correct ranking position so no sorting is needed later
            uint index;
            for (index = 0; index < companyAddresses.length; index++) {
                if (companies[companyAddresses[index]].normalizedGR < normalizedGR) { // newest addition has higher nGR (better ranking)
                    break; // found the correct position
                }
            }
            companyAddresses.push(address(0)); 
            for (uint i = companyAddresses.length - 1; i > index; i--) { // shift all elements to the right
                companyAddresses[i] = companyAddresses[i - 1];
            }
            companyAddresses[index] = company; // insert company at correct position

            companiesCount++;
            if (companiesCount == totalCompanies) { // all companies have reported their data
                calculateRanking(); // potentially change to emit an event and let ioCarb call the function so last reporting entity is not punished with gas fees
            }
        }
    
    function calculateRanking() public onlyRole(ADMIN_ROLE) { // potentially new role for ioCarb to call this function
        uint totalCO2 = 0;  
        uint totalDistance = 0;
        // uint totalNormalizedGR = 0;  // not used in the current implementation as cutoff is handled using CO2 emissions

        for (uint i = 0; i < totalCompanies; i++) {
            totalCO2 += companies[companyAddresses[i]].totalCO2Company;
            totalDistance += companies[companyAddresses[i]].totalDistanceCompany;
            // totalNormalizedGR += companies[companyAddresses[i]].normalizedGR;
        }

        avgCO2PerKm = totalCO2 / totalDistance;

        retrieveTopCompanies(totalCO2/2);

        calcCO2Savings();

        resetState();
    }

    function retrieveTopCompanies(uint CO2Cutoff) private {
        uint currentCO2 = 0;
        for (uint i = 0; i < companyAddresses.length; i++) {
            currentCO2 += companies[companyAddresses[i]].totalCO2Company;
            if (currentCO2 < CO2Cutoff) {
                topCompanies.push(companyAddresses[i]);
            } else {
                break; // once cutoff is reached, no more companies are added
            }
        }
    }

    function calcCO2Savings() private {
        for (uint i = 0; i < topCompanies.length; i++) {
            uint savings =  avgCO2PerKm * companies[topCompanies[i]].totalDistanceCompany - companies[topCompanies[i]].totalCO2Company;
            IMintingContract(mintingContract).mint(topCompanies[i], savings); // mint tokens corresponding to CO2 savings
        }
    }

    // reset state after ranking calculation for next round
    function resetState() private {
        companiesCount = 0;
        avgCO2PerKm = 0;
        topCompanies = new address[](0);
        companyAddresses = new address[](0);
    }
    
    
}