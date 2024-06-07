# Blockchain Part of the ship2earn project - Hardhat Project

## Contracts
PebbleRegistration.sol
- registration of a Pebble to a vehicle
- AccessControl to allow only admins (us) to register vehicles and devices
Pebble Binding
- binding of a Pebble to a wallet address
- only allowed by official Pebbles
Verifier.sol
- verifies zokrates proof created in w3bstream node
- if proof is valid, forwards necessary data to RankingContract 
RankingContract.col
- stores necessary data to build a ranking (totalCO2, totalDistance)
- ranks companies once all reported their data
- invokes mintsíng process accordingly
MintingContract.sol
- mints tokens
CertificateContract.sol
- 

## Initial Setup 
### Environment
(When working with hardhat. Deplyoment and interactions can also be done as per individual preference using other methods.)

hardhat.config.js
- change url to desired deployment endpoint -> current default is a local IoTeX Testnet for fast deployment and testing (https://docs.iotex.io/the-iotex-stack/reference/native-development/install-a-local-testnet)
- adjust number of accounts you want to have access to and use as signers
.env
- set your: 
PRIVATE_KEY_ADMIN="..."
ADDRESS_ADMIN="0x..."
- for script usage also 
    - set the keys and addresses for the desired number of companies you want to test for as:
    PRIVATE_KEY_COMPANY_A="..."
    ADDRESS_COMPANY_A="0x..."
    PRIVATE_KEY_COMPANY_B="..."
    ADDRESS_COMPANY_C="0x..."
    ...
    - set the addresses of the deployed smart contracts as:
    RANKING_CONTRACT_ADDRESS="0x..."
    MINTING_CONTRACT_ADDRESS="0x..."
    VERIFIER_CONTRACT_ADDRESS="0x..."

### Scripts 
(When working with hardhat. Deplyoment and interactions can also be done as per individual preference using other methods.)

Deployment of a SC:
    npx hardhat ignition deploy ./ignition/modules/<smartcontract>.js --network <network>
Script execution:
    npx hardhat run scripts/<script>.js --network <network>
Wipe an old SC (if major changes happened in the SC to wipe created artifacts):
    npx hardhat ignition wipe <deploymentId> <ContractModule>

### Contracts
Verifier.sol
- invoke function setRankingContract(address _rankingContract) with address of deployed RankingContract
-> sets the address of the RankingContract within the Verifier for forwarding the data
RankingContract.sol
- invoke function setMintingContract(address _mintingContract) with address of deployed MintingContract
-> sets the address of the MintingContract within the RankingContract for forwarding the calculated savings
MintingContract.sol
- invoke function setCertificateAddress(dress _certificateAddress) with address of deployed CertificateContract
-> sets the address of the CertificateContract within the MintingContract

### Role Based AccessControl
A role based access control is implemented to ensure the security in between contract interactions and external calls. 
At the current stage the address that deploys the contracts has an ADMIN_ROLE and can invoke the functions to grant other roles.
Verifier.sol
- AccessControl to be implemented
RankingContract.sol
- invoke function setRankingRole(address _rankingRole) with address of deployed Verifier contract
-> grants the given address the RANKING_ROLE which is allowed to call the function receiveData(...)
-> should only be granted to the Verifier contract
MintingContract.sol
- invoke function setMinter(address _minter) with address of deployed RankingContract contract
-> grants the given address the MINTER_ROLE which is allowed to mint tokens
CertificateContract.sol
- 
