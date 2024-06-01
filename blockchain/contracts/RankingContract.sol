// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

interface IMintingContract {
    function mint(address to, uint amount) external;
}

/**
 * @title RankingContract
 * @dev Contract to rank companies based on their normalized GHG emissions
 * Done: Update cutoff handling to simply use CO2 emissions and see if below average
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
        uint256 totalCO2Company;
        uint256 totalDistanceCompany;
    }

    mapping(address => Company) public companies;
    address[] public companyAddresses; // wallet addresses of companies, sorted by normalizedGR during initial data reporting
    uint public companiesCount; // number of companies that have reported their data
    uint256 public totalCompanies; // total number of companies that should report their data
    uint256 public avgCO2PerKm; // average CO2 emissions per km, calculated from all companies in calculateRanking()

    address public mintingContract;

    constructor() {
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    event savingsCalculated(
        address company,
        uint256 savings
    );

    event rankingRoleSet(
        address rankingRole
    );

    event companyDataReceived(
        address company,
        bool lastCompany
    );

    function setTotalCompanies(
        uint256 _totalCompanies
    ) public onlyRole(ADMIN_ROLE) {
        totalCompanies = _totalCompanies;
    }

    function getTotalCompanies() public view returns (uint) {
        return totalCompanies;
    }

    function setRankingRole(address _rankingRole) public onlyRole(ADMIN_ROLE) {
        _grantRole(RANKING_ROLE, _rankingRole);
        emit rankingRoleSet(_rankingRole);
    }

    function setMintingContract(
        address _mintingContract
    ) public onlyRole(ADMIN_ROLE) {
        mintingContract = _mintingContract;
    }

    // called by Verifier Contract if proof is valid
    function receiveData(
        address company,
        uint256 totalCO2Company,
        uint256 totalDistanceCompany
    ) public onlyRole(RANKING_ROLE) {
        companies[company] = Company({
            totalCO2Company: totalCO2Company,
            totalDistanceCompany: totalDistanceCompany
        });
        // add company immediately to correct ranking position so no sorting is needed later
        companyAddresses.push(company);
        companiesCount++;
        if (companiesCount == totalCompanies) {
            // all companies have reported their data
            emit companyDataReceived(company, true);
            //calculateRanking(); // potentially change to emit an event and let ioCarb call the function so last reporting entity is not punished with gas fees
        } else {
            emit companyDataReceived(company, false);
        }
    }

    function calculateRanking() public onlyRole(ADMIN_ROLE) {
        // potentially new role for ioCarb to call this function
        uint256 totalCO2 = 0;
        uint256 totalDistance = 0;

        for (uint256 i = 0; i < totalCompanies; i++) {
            totalCO2 += companies[companyAddresses[i]].totalCO2Company;
            totalDistance += companies[companyAddresses[i]].totalDistanceCompany;
        }

        avgCO2PerKm = Math.mulDiv(totalCO2, 1e18, totalDistance)+1;

        calcCO2Savings();
        resetState();
    }

    function calcCO2Savings() private {
        for (uint256 i = 0; i < companyAddresses.length; i++) {
            uint256 companyDistance = companies[companyAddresses[i]].totalDistanceCompany;
            uint256 companyCO2 = Math.mulDiv(companies[companyAddresses[i]].totalCO2Company, 1e18, 1);

            uint256 expectedCO2 = (avgCO2PerKm * companyDistance);

            uint256 savings;
            if (expectedCO2 > companyCO2) {
                savings = expectedCO2 - companyCO2;
                savings = Math.mulDiv(savings, 1, 1e18);
                emit savingsCalculated(companyAddresses[i], savings);
                // IMintingContract(mintingContract).mint(companyAddresses[i], savings); // mint tokens corresponding to CO2 savings
            }
        }
    }

    // reset state after ranking calculation for next round
    function resetState() private {
        companiesCount = 0;
        avgCO2PerKm = 0;
        companyAddresses = new address[](0) ;
    }
}
