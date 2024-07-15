require('dotenv').config();

async function registerVehicle(DeviceRegistryAddress, vehicleID, vehicleType, avgEmmision, signers) {
    const chalk = (await import('chalk')).default;
    const DeviceRegistry = await ethers.getContractAt("DeviceRegistry", DeviceRegistryAddress, signers[0]);
    const tx = await DeviceRegistry.registerVehicle(vehicleID, vehicleType, avgEmmision);
    // -> Gas used: 74,951
    console.log(`Transaction hash: ${tx.hash}`);
    receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

async function addCompany(AllowanceContractAddress, wallet, allowance, signers) {
    const chalk = (await import('chalk')).default;
    const AllowanceContract = await ethers.getContractAt("AllowanceContract", AllowanceContractAddress, signers[0]);
    AllowanceContract.on("CompanyAdded", (address, allowance) => {
        console.log(chalk.green(`Event: Company ${address} added with allowance ${allowance}.`));
    });
    const tx = await AllowanceContract.addCompany(wallet, allowance);
    console.log(`Transaction hash: ${tx.hash}`);
    receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

async function registerDevice(DeviceRegistryAddress, deviceID, vehicleID, wallet, signers) {
    const chalk = (await import('chalk')).default;
    const DeviceRegistry = await ethers.getContractAt("DeviceRegistry", DeviceRegistryAddress, signers[0]);
    DeviceRegistry.on("DeviceRegistered", (deviceID, vehicleID, isRegistered) => {
        console.log(chalk.green(`Event: Device ${deviceID} registered as ${vehicleID}.`));
      });
    const tx = await DeviceRegistry.registerDevice(deviceID, vehicleID, wallet);
    // -> Gas used: 114,431
    console.log(`Transaction hash: ${tx.hash}`);
    receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

async function unregisterDevice(DeviceRegistryAddress, deviceID, signers) {
    const chalk = (await import('chalk')).default;
    const DeviceRegistry = await ethers.getContractAt("DeviceRegistry", DeviceRegistryAddress, signers[0]);
    const tx = await DeviceRegistry.unregisterDevice(deviceID, { gasLimit: 5000000 });
    // -> Gas used: 
    console.log(`Transaction hash: ${tx.hash}`);
    receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

async function main() {
    const signers = await ethers.getSigners();
    const AllowanceContractAddress = process.env.ALLOWANCECONTRACT_ADDRESS;
    const DeviceRegistryAddress = process.env.DEVICEREGISTRY_ADDRESS;
    // unregister a deviceID
    //await unregisterDevice(DeviceRegistryAddress, deviceID = 1234, signers);
    // register a vehicleID with corresponding vehicleType and avgEmmision
    //await registerVehicle(DeviceRegistryAddress, 
      //  vehicleID = 1234, vehicleType = "Scooter", avgEmmision = 2, 
        //signers); 
    // add a company with corresponding wallet and allowance
    await addCompany(AllowanceContractAddress,
        wallet = process.env.ADDRESS_COMPANY_D, allowance = process.env.ALLOWANCE_D,
        signers);
    // register a deviceID with corresponding vehicleID and wallet (wallet must already be added as a company)
    //await registerDevice(DeviceRegistryAddress,
      //  deviceID = 12345, vehicleID = 1234, wallet = process.env.ADDRESS_COMPANY_D,
        //signers);
  }
    
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });