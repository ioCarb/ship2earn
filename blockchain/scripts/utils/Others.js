require('dotenv').config();
require('ethers');
const fs = require('fs');
const path = require('path');

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

async function main() {
    const signers = await ethers.getSigners();
    const DeviceRegistryAddress = process.env.DEVICEREGISTRY_ADDRESS;
    const AllowanceContractAddress = process.env.ALLOWANCECONTRACT_ADDRESS;
    const CarbTokenAddress = process.env.CARBTOKEN_ADDRESS;
    //await mintTokens(CarbTokenAddress, process.env.B_ADDRESS_TESTNET, 900, signers);
    //await burnTokens(CarbTokenAddress, process.env.ADDRESS_COMPANY_D, 1900, signers);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });