require('dotenv').config();
require('ethers');

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

async function getNFTData(CarbCertificateAddress, tokenId, signers) {
  const chalk = (await import('chalk')).default;
  const CarbCertificate = await ethers.getContractAt('CarbCertificate', CarbCertificateAddress, signers[0]);
  const data = await CarbCertificate.getNFTData(tokenId);
  console.log(`NFT ${tokenId} data: ${data}`);
}

// different getter functions to retrieve public data from the blockchain
async function main() {
  const signers = await ethers.getSigners();
  const DeviceRegistryAddress = process.env.DEVICEREGISTRY_ADDRESS;
  const AllowanceContractAddress = process.env.ALLOWANCECONTRACT_ADDRESS;
  const CarbTokenAddress = process.env.CARBTOKEN_ADDRESS;
  await getCompanyStats(AllowanceContractAddress, company=process.env.COMPANY_ADDRESS_TESTNET, signers);
  await getDevicesByWallet(DeviceRegistryAddress, wallet=process.env.COMPANY_ADDRESS_TESTNET, signers);
  await getDeviceData(DeviceRegistryAddress, deviceID=12345, signers);
  await getVehicleData(DeviceRegistryAddress, vehicleID=1234, signers);
  await getNFTData(CarbCertificateAddress, tokenId=0, signers);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });