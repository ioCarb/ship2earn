require('dotenv').config();
require('ethers');

// decrease or increase vehicle count (only for testing)
async function adjustVehicleCount(AllowanceContractAddress, company, signer) {
    const chalk = (await import('chalk')).default;
    const AllowanceContract = await ethers.getContractAt('AllowanceContract', AllowanceContractAddress, signer);
    //const tx = await AllowanceContract.decreaseVehicleCount(company);
    const tx = await AllowanceContract.increaseVehicleCount(company, { gasLimit: 500000 });
    // -> Gas used: 
    console.log(`Transaction hash: ${tx.hash}`);
    receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

// reset company data after reporting and allowance logic is done
async function resetCompanyData(AllowanceContractAddress, company, signer) {
    const chalk = (await import('chalk')).default;
    const AllowanceContract = await ethers.getContractAt('AllowanceContract', AllowanceContractAddress, signer);
    const tx = await AllowanceContract.resetCompanyData(company);
    // -> Gas used: 
    console.log(`Transaction hash: ${tx.hash}`);
    receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

// adjust allowance for a company
async function adjustAllowance(AllowanceContractAddress, company, allowance, signer) {
    const chalk = (await import('chalk')).default;
    const AllowanceContract = await ethers.getContractAt('AllowanceContract', AllowanceContractAddress, signer);
    const tx = await AllowanceContract.adjustAllowance(company, allowance);
    // -> Gas used: 
    console.log(`Transaction hash: ${tx.hash}`);
    receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

// unregister a device
async function unregisterDevice(DeviceRegistryAddress, deviceID, signer) {
    const chalk = (await import('chalk')).default;
    const DeviceRegistry = await ethers.getContractAt("DeviceRegistry", DeviceRegistryAddress, signer);
    const tx = await DeviceRegistry.unregisterDevice(deviceID, { gasLimit: 5000000 });
    // -> Gas used: 
    console.log(`Transaction hash: ${tx.hash}`);
    receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

// Additional operational functions that may be executed by ioCarb during the operational business
async function main() {
    const signers = await ethers.getSigners();
    const DeviceRegistryAddress = process.env.DEVICEREGISTRY_ADDRESS;
    const AllowanceContractAddress = process.env.ALLOWANCECONTRACT_ADDRESS;
    const signer = signers[0]; // must be OPERATOR (default is admin)
    
    // reset company data after reporting and allowance logic is done
    await resetCompanyData(AllowanceContractAddress, company = process.env.COMPANY_ADDRESS_TESTNET, signer);

    // adjust allowance for a company
    //await adjustAllowance(AllowanceContractAddress, company = process.env.COMPANY_ADDRESS_TESTNET, 28390, signer);

    // unregister a device
    //await unregisterDevice(DeviceRegistryAddress, deviceID = 9876, signer);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
