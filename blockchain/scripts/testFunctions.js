require('dotenv').config();
require('ethers');
const fs = require('fs');
const path = require('path');



async function getDeviceWallet(DeviceRegistryAddress, signers) {
  const chalk = (await import('chalk')).default;
  const DeviceRegistry = await ethers.getContractAt("DeviceRegistry", DeviceRegistryAddress, signers[0]);
  const wallet = await DeviceRegistry.getDeviceWallet(1234);
  console.log(`Device registered under address: ${wallet}`);
}

async function mintTokens(CarbTokenAddress, company, amount, signers) {
  const chalk = (await import('chalk')).default;
  const CarbToken = await ethers.getContractAt("CarbToken", CarbTokenAddress, signers[0]);
  CarbToken.on("minted", (to, amount) => {
    console.log(chalk.green(`Event: Minted ${amount} tokens to ${to}.`));
  });
  const tx = await CarbToken.mint(company, amount);
  console.log(`Transaction hash: ${tx.hash}`);
  receipt = await tx.wait();
  console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
  console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

async function burnTokens(CarbTokenAddress, company, amount, signers) {
  const chalk = (await import('chalk')).default;
  const CarbToken = await ethers.getContractAt("CarbToken", CarbTokenAddress, signers[0]);
  CarbToken.on("burned", (to, amount) => {
    console.log(chalk.green(`Event: Burned ${amount} tokens of ${to}.`));
  });
  const tx = await CarbToken.burn(company, amount);
  console.log(`Transaction hash: ${tx.hash}`);
  receipt = await tx.wait();
  console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
  console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

async function getCompanyStats(AllowanceContractAddress, company, signers) {
  const AllowanceContract = await ethers.getContractAt("AllowanceContract", AllowanceContractAddress, signers[0]);
  const stats = await AllowanceContract.getCompanyStats(company);
  console.log(`Company ${company} stats: ${stats}`);
}

async function getDeviceData(DeviceRegistryAddress, deviceID, signers) {
  const DeviceRegistry = await ethers.getContractAt("DeviceRegistry", DeviceRegistryAddress, signers[0]);
  const data = await DeviceRegistry.getDeviceData(deviceID);
  console.log(`Device ${deviceID} data: ${data}`);
}

async function getVehicleData(DeviceRegistryAddress, vehicleID, signers) {
  const DeviceRegistry = await ethers.getContractAt("DeviceRegistry", DeviceRegistryAddress, signers[0]);
  const data = await DeviceRegistry.getVehicleData(vehicleID);
  console.log(`Vehicle ${vehicleID} data: ${data}`);
}

async function getDevicesByWallet(DeviceRegistryAddress, wallet, signers) {
  const DeviceRegistry = await ethers.getContractAt("DeviceRegistry", DeviceRegistryAddress, signers[0]);
  const devices = await DeviceRegistry.getDevicesByWallet(wallet);
  console.log(`Devices registered under wallet ${wallet}: ${devices}`);
}

async function emissionReport(AllowanceContractAddress, CarbTokenAddress, company, deviceID, trackedCO2, signers) {
  const chalk = (await import('chalk')).default;
  const AllowanceContract = await ethers.getContractAt("AllowanceContract", AllowanceContractAddress, signers[0]);
  const CarbToken = await ethers.getContractAt("CarbToken", CarbTokenAddress, signers[0]);
  AllowanceContract.on("CompanyDataReady", (deviceID, address, trackedCO2, ready) => {
    console.log(chalk.green(`Event: Company of device ${deviceID} is ${address}; is ready: ${ready}.`));
  });
  AllowanceContract.on("EmissionReportReceived", (company, savings, success) => {
    console.log(chalk.green(`Event: Company ${company}, saved ${savings}, success: ${success}.`));
  });
  AllowanceContract.on("Custom", (company, address) => {
    console.log(chalk.green(`Event: Company as of tx: ${address}, \nCompany as of device: ${company}.`));
  });
  CarbToken.on("minted", (to, amount) => {
    console.log(chalk.green(`Event: Minted ${amount} tokens to ${to}.`));
  });
  const tx = await AllowanceContract.emissionReport(deviceID, company, trackedCO2);
  console.log(`Transaction hash: ${tx.hash}`);
  receipt = await tx.wait();
  console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
  console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

async function resetCompanyData(AllowanceContractAddress, company, signers) {
  const chalk = (await import('chalk')).default;
  const AllowanceContract = await ethers.getContractAt('AllowanceContract', AllowanceContractAddress, signers[0]);
  const tx = await AllowanceContract.resetCompanyData(company);
  // -> Gas used: 
  console.log(`Transaction hash: ${tx.hash}`);
  receipt = await tx.wait();
  console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
  console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

async function adjustVehicleCount(AllowanceContractAddress, company, signers) {
  const chalk = (await import('chalk')).default;
  const AllowanceContract = await ethers.getContractAt('AllowanceContract', AllowanceContractAddress, signers[0]);
  //const tx = await AllowanceContract.decreaseVehicleCount(company);
  const tx = await AllowanceContract.increaseVehicleCount(company, { gasLimit: 500000 });
  // -> Gas used: 
  console.log(`Transaction hash: ${tx.hash}`);
  receipt = await tx.wait();
  console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
  console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

async function adjustAllowance(AllowanceContractAddress, company, allowance, signers) {
  const chalk = (await import('chalk')).default;
  const AllowanceContract = await ethers.getContractAt('AllowanceContract', AllowanceContractAddress, signers[0]);
  const tx = await AllowanceContract.adjustAllowance(company, allowance);
  // -> Gas used: 
  console.log(`Transaction hash: ${tx.hash}`);
  receipt = await tx.wait();
  console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
  console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

async function main() {
  const signers = await ethers.getSigners();
  const DeviceRegistryAddress = process.env.DEVICEREGISTRY_ADDRESS;
  const AllowanceContractAddress = process.env.ALLOWANCECONTRACT_ADDRESS;
  const CarbTokenAddress = process.env.CARBTOKEN_ADDRESS;
  //await getCompanyStats(AllowanceContractAddress, process.env.ADDRESS_COMPANY_D, signers);
  //await getDeviceWallet(DeviceRegistryAddress, signers);
  await mintTokens(CarbTokenAddress, process.env.B_ADDRESS_TESTNET, 900, signers);
  //await burnTokens(CarbTokenAddress, process.env.ADDRESS_COMPANY_D, 1900, signers);
  //await resetCompanyData(AllowanceContractAddress, process.env.ADDRESS_COMPANY_D, signers);
  //await adjustAllowance(AllowanceContractAddress, process.env.ADDRESS_COMPANY_D, 30000, signers);
  //await adjustVehicleCount(AllowanceContractAddress, process.env.ADDRESS_COMPANY_D, signers);
  //await getDeviceData(DeviceRegistryAddress, deviceID=12345, signers);
  //await getVehicleData(DeviceRegistryAddress, vehicleID=1234, signers);
  //await getDevicesByWallet(DeviceRegistryAddress, wallet=process.env.ADDRESS_COMPANY_D, signers);
  //await emissionReport(AllowanceContractAddress, CarbTokenAddress, company=process.env.ADDRESS_COMPANY_D, deviceID=12345, trackedCO2=29600, signers);
  //await getCompanyStats(AllowanceContractAddress, process.env.ADDRESS_COMPANY_D, signers);
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });