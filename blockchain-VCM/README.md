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
npx hardhat run scripts/[script-name].js
```

## Sample blockchain walkthrough

To simulate and test the behavior of a proof being received, the util `scripts/utils/EmissionReportVerifier.js` script can be executed. This will load the corresponding `scripts/utils/proof.json` and send it as a transaction to the IoTex testnet. 
The calculated CO2 emission from the proof is 28,390. As the allowance is set to 30,000 and only one vehicle is registerred under the company, the AllowanceContract (Business Logic) will trigger the minting process of 1,610 tokens.
To see the current portfolio of the reviewed company, the util `scripts/3b_OperationalFunctions.js` script can be executed. Here