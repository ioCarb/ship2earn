require('dotenv').config();
const { ethers } = require("hardhat")

async function setAccessInDeviceRegistry(DeviceRegistryAddress, AllowanceContractAddress, signers) {
  const chalk = (await import('chalk')).default;
  const Contract = await ethers.getContractAt("DeviceRegistry", DeviceRegistryAddress, signers[0]);
  Contract.on("AllowanceContractSet", (address) => {
    console.log(chalk.green(`Event: Allowance Contract Address set to ${address}.`));
  });
  const tx = await Contract.setAllowanceContract(AllowanceContractAddress);
  // -> Gas used: 39,984
  console.log(`Transaction hash: ${tx.hash}`);
  receipt = await tx.wait();
  console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
  console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

async function setAccessInAllowanceContract(AllowanceContractAddress, VerifierContractAddress, DeviceRegistryAddress, CarbTokenAddress, CertContractAddress, signers) {
  const chalk = (await import('chalk')).default;
  const Contract = await ethers.getContractAt("AllowanceContract", AllowanceContractAddress, signers[0]);
  Contract.on("verifierRoleSet", (address) => {
    console.log(chalk.green(`Event: Verifier Role set for ${address}.`));
  });
  Contract.on("operatorRoleSet", (address) => {
    console.log(chalk.green(`Event: Operator Role set for ${address}.`));
  });
  Contract.on("tokenContractSet", (address) => {
    console.log(chalk.green(`Event: Token Contract set to ${address}.`));
  });
  Contract.on("certContractSet", (address) => {
    console.log(chalk.green(`Event: Cert Contract set to ${address}.`));
  });
  Contract.on("deviceRegistrySet", (address) => {
    console.log(chalk.green(`Event: Device Registry set to ${address}.`));
  });
  const tx = await Contract.setVerifierRole(VerifierContractAddress);
  // -> Gas used: 42,576
  console.log(`Transaction hash: ${tx.hash}`);
  receipt = await tx.wait();
  console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
  console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
  const tx2 = await Contract.setOperatorRole(DeviceRegistryAddress);
  // -> Gas used: 42,532
  console.log(`Transaction hash: ${tx2.hash}`);
  receipt2 = await tx2.wait();
  console.log(`Transaction confirmed in block: ${receipt2.blockNumber}`);
  console.log(chalk.red(`Gas used: ${receipt2.gasUsed.toString()}`));
  const tx3 = await Contract.setMintingContract(CarbTokenAddress);
  // -> Gas used: 39,961
  console.log(`Transaction hash: ${tx3.hash}`);
  receipt3 = await tx3.wait();
  console.log(`Transaction confirmed in block: ${receipt3.blockNumber}`);
  console.log(chalk.red(`Gas used: ${receipt3.gasUsed.toString()}`));
  const tx4 = await Contract.setDeviceRegistry(DeviceRegistryAddress);
  console.log(`Transaction hash: ${tx4.hash}`);
  receipt4 = await tx4.wait();
  console.log(`Transaction confirmed in block: ${receipt4.blockNumber}`);
  console.log(chalk.red(`Gas used: ${receipt4.gasUsed.toString()}`));
  const tx5 = await Contract.setCertContract(CertContractAddress);
  console.log(`Transaction hash: ${tx5.hash}`);
  receipt5 = await tx5.wait();
  console.log(`Transaction confirmed in block: ${receipt5.blockNumber}`);
  console.log(chalk.red(`Gas used: ${receipt5.gasUsed.toString()}`));
}

async function setAccessInCarbToken(CarbTokenAddress, AllowanceContractAddress, signers) {
  const chalk = (await import('chalk')).default;
  const Contract = await ethers.getContractAt("CarbToken", CarbTokenAddress, signers[0]);
  Contract.on("minterRoleSet", (address) => {
    console.log(chalk.green(`Event: Minter Role set for ${address}.`));
  });
  Contract.on("burnerRoleSet", (address) => {
    console.log(chalk.green(`Event: Burner Role set for ${address}.`));
  });
  const tx = await Contract.setMinter(AllowanceContractAddress, { gasLimit: 10000000 });
  // -> Gas used: 42,641
  console.log(`Transaction hash: ${tx.hash}`);
  receipt = await tx.wait();
  console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
  console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
  const tx2 = await Contract.setBurner(AllowanceContractAddress, { gasLimit: 10000000 });
  // -> Gas used: 42,553
  console.log(`Transaction hash: ${tx2.hash}`);
  receipt2 = await tx2.wait();
  console.log(`Transaction confirmed in block: ${receipt2.blockNumber}`);
  console.log(chalk.red(`Gas used: ${receipt2.gasUsed.toString()}`));
}

async function setAccessInCertContract(CertContractAddress, AllowanceContractAddress, signers) {
  const chalk = (await import('chalk')).default;
  const Contract = await ethers.getContractAt("CarbCertificate", CertContractAddress, signers[0]);
  const tx = await Contract.setMinter(AllowanceContractAddress);
  // -> Gas used:
  console.log(`Transaction hash: ${tx.hash}`);
  receipt = await tx.wait();
  console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
  console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

// script to set access roles and addresses within the contracts (first time setup)
async function main() {
  const signers = await ethers.getSigners();
  const AllowanceContractAddress = process.env.ALLOWANCECONTRACT_ADDRESS;
  const VerifierContractAddress = process.env.DIST_VERIFIER_CONTRACT_ADDRESS;
  const CarbTokenAddress = process.env.CARBTOKEN_ADDRESS;
  const DeviceRegistryAddress = process.env.DEVICEREGISTRY_ADDRESS;
  const CertContractAddress = process.env.CRBCERT_ADDRESS;
  // sets the allowance contract address within the DeviceRegistry contract:
  await setAccessInDeviceRegistry(DeviceRegistryAddress, AllowanceContractAddress, signers);
  // sets the access roles and addresses within the AllowanceContract:
  await setAccessInAllowanceContract(AllowanceContractAddress, VerifierContractAddress, DeviceRegistryAddress, CarbTokenAddress, CertContractAddress, signers)
  // sets the minter burner role within the carb token contract:
  await setAccessInCarbToken(CarbTokenAddress, AllowanceContractAddress, signers);
  // sets the minter burner role within the CertContract:
  await setAccessInCertContract(CertContractAddress, AllowanceContractAddress, signers);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });