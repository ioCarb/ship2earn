# Blockchain Project

This project is a blockchain application built using Hardhat.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Smart Contracts](#smart-contracts)
- [Deployment and Initial Setup](#deploymentandsetup)
- [Scripts](#scripts)

## Prerequisites

Before you begin, ensure you have met the following requirements:
* You have installed Node.js and npm

## Installation

To install this project, follow these steps:

1. Navigate to the project directory:
   ```
   cd blockchain
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Configuration

The project uses Hardhat as the development environment. You may want to adjust the `hardhat.config.js` and the `.env` file to suit your needs.
Otherwise, the example project can be used which has the VCM use case deployed.

## Smart Contracts

The VCM project has following smart contracts deployed:

1. `DeviceRegistry.sol`: Registry of devices and vehicles
2. `Verifier.sol`: zk-Verifier generated by ZoKrates
3. `AllowanceContract.sol`: On-chain business logic of carbon allowance use case
4. `CarbToken.sol`: ERC20 token CarbToken
5. `CarbCertificate.sol`: ERC721 token CarbCertificate

## Deployment and Initial Setup (not needed if sample project wants to be executed)

To deploy the smart contracts (Initial Setup) on the testnet:

1. Run the deployment script:
   ```
   npx hardhat ignition deploy ./ignition/modules/FirstPart.js --network testnet
   ```
2. Add all available .env variables
3. Run deployment script to deploy the Verifier (address of AllowanceContract is set during deployment):
   ```
   npx hardhat ignition deploy ./ignition/modules/Verifier.js --network testnet
   ```
4. Add Verifier address in .env file
5. Run the AccessManagement script:
    ```
    npx hardhat run scripts/1_AccessManagement.js --network testnet
    ```
6. Run the OperationalSetups script:
    ```
    npx hardhat run scripts/2_OperationalSetups.js --network testnet
    ```
(add or adjust company/device/vehicle data as needed, default is one company, one device, one vehicle as in .env template)
7. Initial setup is complete, Verifier ready to receive proofs

## Scripts

There are multiple scripts to interact with the smart contracts:

1. `scripts/1_AccessManagement.js`: Set access roles and addresses within the contracts for initial setup
2. `scripts/2_OperationalSetups.js`: Operational setups for initial setup
3. `scripts/3a_OperationalFunctions.js`: Additional operational functions (ioCarb)
4. `scripts/3b_OperationalFunctions.js`: Additional operational functions (company)
5. `scripts/4_TokenTrading.js`: Send IOTX and CRB
6. `scripts/5_AdditionalGetterFunctions.js`: Getter functions for different data
7. `scripts/utils/`: Additional functions used during testing

To run a script:
```
npx hardhat run scripts/[script-name].js --network testnet
```

## Sample blockchain walkthrough

To simulate and test the behavior of a proof being received, the util `scripts/utils/EmissionReportVerifier.js` script can be executed. This will load the corresponding `scripts/utils/proof.json` and send it as a transaction to the IoTex testnet.
The calculated CO2 emission from the sample proof is 28,390. As the allowance is set to 30,000 and only one vehicle is registerred under the company, the AllowanceContract (Business Logic) will trigger the minting process of 1,610 tokens.
To see the current portfolio and the latest NFT of the reviewed company, the util `scripts/3b_OperationalFunctions.js` script can be executed.

### Step-by-step walkthrough

0. Check if the compancy is reset or refer to step 4:
```
npx hardhat run scripts/5_AdditionalGetterFunctions.js --network testnet
```
Expected output:
```
Company 0xa2490c896ac250bf5604aff008a9cebca705de20 stats: 30000,0,1,0
```
Allowance: 30000
Reported Emissions: 0
Registerred Vehicles: 1
Number of reports received: 0
1. Execute the transaction to send the proof to the blockchain:
```
npx hardhat run scripts/utils/EmissionReportVerifier.js --network testnet
```
2. Check if the report has been successfull:
```
npx hardhat run scripts/5_AdditionalGetterFunctions.js --network testnet
```
Expected output:
```
Company 0xa2490c896ac250bf5604aff008a9cebca705de20 stats: 30000,28390,1,1
```
Allowance: 30000
Reported Emissions: 28390
Registerred Vehicles: 1
Number of reports received: 1
3. Check your available CRB tokens, NFTs, and display the latest certificate:
```
npx hardhat run scripts/3b_OperationalFunctions.js --network testnet
```
Expected output (amount of CRB, available NFTs (tokenIDs), and latest NFT data will be different):
```
Balance of 0x0a0c2A51609531D488CCE7e0496e6DC7517FaF75: 3220
Available NFT tokens: 0,1
NFT 1 data: 1724665710,0xA30c7fEBFf75b2941277357f51191482190bF7d0,Congratulations, 0xa2490c896ac250bf5604aff008a9cebca705de20 met the allowance for week 34 in 2024
```
4. Reset the company account to start a new week:
```
npx hardhat run scripts/3a_OperationalFunctions.js --network testnet
```
