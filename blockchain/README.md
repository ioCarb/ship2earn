# Blockchain Part of the ship2earn project - Hardhat Project

## Contracts
#### DeviceRegistry.sol
- registration of a device to a vehicle and binding a device to a user wallet
- AccessControl to allow only admins (us) to register and bind vehicles and devices
#### Verifier.sol
- verifies zokrates proof created in w3bstream node
- if proof is valid, forwards necessary data to AllowanceContract
#### AllowanceContract.sol
- contract has a company struct that stores and tracks the CO2 allowance
- within each iteration it checks if the allowance has been succesfully managed or failed
- if it fails during the initial reporting from the Verifier using the function <emissionReport>
- companies can use the contract to burn CRB tokens and reduce their emitted CO2 using the function <burnTokens>
- in each case if the emitted CO2 falls below the allowance, the contract invokes the minting process
#### CarbToken.sol
- mint and burn tokens
- trading functionalities to be added
#### CarbCertificate.sol
- 

## Initial Setup 
### Environment
(When working with hardhat. Deplyoment and interactions can also be done as per individual preference using other methods.)
Go to directory blockchain and execute:
```
npm install
```
#### hardhat.config.js
- change url to desired deployment endpoint -> current default is a local IoTeX Testnet for fast deployment and testing (https://docs.iotex.io/the-iotex-stack/reference/native-development/install-a-local-testnet)
- adjust number of accounts you want to have access to and use as signers
#### .env
- set your: 
```
PRIVATE_KEY_ADMIN="..."
ADDRESS_ADMIN="0x..."
```
- for script usage also 
    - set the keys and addresses for the desired number of companies you want to test for as:
    ```
    PRIVATE_KEY_COMPANY_A="..."
    ADDRESS_COMPANY_A="0x..."
    PRIVATE_KEY_COMPANY_B="..."
    ADDRESS_COMPANY_C="0x..."
    ...
    ```
    - set the addresses of the deployed smart contracts as:
    ```
    RANKING_CONTRACT_ADDRESS="0x..."
    MINTING_CONTRACT_ADDRESS="0x..."
    VERIFIER_CONTRACT_ADDRESS="0x..."
    ```

### Scripts 
(When working with hardhat. Deplyoment and interactions can also be done as per individual preference using other methods.)

#### Deployment of a SC:
```
npx hardhat ignition deploy ./ignition/modules/<smartcontract>.js --network <network>
```
#### Script execution:
```
npx hardhat run scripts/<script>.js --network <network>
```
#### Wipe an old SC (if major changes happened in the SC to wipe created artifacts):
```
npx hardhat ignition wipe <deploymentId> <ContractModule>
```

### Contracts
#### Verifier.sol
- invoke function ```setAllowanceContract(address _allowanceContract)``` with address of deployed AllowanceContract
-> sets the address of the AllowanceContract within the Verifier for forwarding the data
#### AllowanceContract.sol
- invoke function ```setCarbToken(address _carbToken)``` with address of deployed CarbToken
-> sets the address of the CarbToken within the AllowanceContract for forwarding the emitted CO2 of the current iteration
#### CarbToken.sol
- invoke function ```setAllowanceCertificate(dress _allowanceCertificate)``` with address of deployed AllowanceCertificate contract
-> sets the address of the AllowanceCertificate within the CarbToken

### Role Based AccessControl
A role based access control is implemented to ensure the security in between contract interactions and external calls. 
At the current stage the address that deploys the contracts has an ADMIN_ROLE and can invoke the functions to grant other roles.
#### Verifier.sol
- AccessControl to be implemented
#### RankingContract.sol
- invoke function ```setRankingRole(address _rankingRole)``` with address of deployed Verifier contract
-> grants the given address the RANKING_ROLE which is allowed to call the function receiveData(...)
-> should only be granted to the Verifier contract
#### MintingContract.sol
- invoke function ```setMinter(address _minter)``` with address of deployed RankingContract contract
-> grants the given address the MINTER_ROLE which is allowed to mint tokens
CertificateContract.sol
- 
