# Blockchain Part of the ship2earn project - Hardhat Project

## Contracts

### PebbleRegistration.sol
- registration of a Pebble to a vehicle
- AccessControl to allow only admins (us) to register vehicles and devices

### Pebble Binding
- binding of a Pebble to a wallet address
- only allowed by official Pebbles

### Verifier.sol
- verifies zokrates proof created in w3bstream node
- if proof is valid, forwards necessary data to RankingContract 

### RankingContract.col
- stores necessary data to build a ranking (totalCO2, totalDistance)
- ranks companies once all reported their data
- invokes mintsíng process accordingly

### MintingContract.sol
- mints tokens

### CertificateContract.sol
- 

## Initial Setup 

### Verifier.sol
- invoke function setRankingContract(address _rankingContract) with address of deployed RankingContract
-> sets the address of the RankingContract within the Verifier for forwarding the data

### RankingContract.sol
- invoke function setMintingContract(address _mintingContract) with address of deployed MintingContract
-> sets the address of the MintingContract within the RankingContract for forwarding the calculated savings

### MintingContract.sol
- invoke function setCertificateAddress(dress _certificateAddress) with address of deployed CertificateContract
-> sets the address of the CertificateContract within the MintingContract

## Role Based AccessControl
A role based access control is implemented to ensure the security in between contract interactions and external calls. 
At the current stage the address that deploys the contracts has an ADMIN_ROLE and can invoke the functions to grant other roles.

### Verifier.sol
- AccessControl to be implemented

### RankingContract.sol
- invoke function setRankingRole(address _rankingRole) with address of deployed Verifier contract
-> grants the given address the RANKING_ROLE which is allowed to call the function receiveData(...)
-> should only be granted to the Verifier contract

### MintingContract.sol
- invoke function setMinter(address _minter) with address of deployed RankingContract contract
-> grants the given address the MINTER_ROLE which is allowed to mint tokens

### CertificateContract.sol
- 
