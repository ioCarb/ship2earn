require('dotenv').config();
const { ethers } = require("hardhat")

async function balanceOf(CarbTokenAddress, wallet, signer) {
    const CarbToken = await ethers.getContractAt("CarbToken", CarbTokenAddress, signer);
    const balance = await CarbToken.balanceOf(wallet);
    console.log(`Balance of ${wallet}: ${balance}`);
}

async function sendIOTX(wallet, amount, signers) {
    const chalk = (await import('chalk')).default;
    const amountInWei = ethers.parseUnits(amount, 18);
    const tx = await signers[0].sendTransaction({
        to: wallet,
        value: amountInWei
    });
    console.log(`Transaction hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

async function sendCRBToken(CarbTokenAddress, wallet, amount, signers) {
    const chalk = (await import('chalk')).default;
    const CarbToken = await ethers.getContractAt("CarbToken", CarbTokenAddress, signers[0]);
    const tx = await CarbToken.transfer(wallet, amount);
    console.log(`Transaction hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

async function main() {
    const signers = await ethers.getSigners();
    const CRBTokenExchangeAddress = process.env.CRBTOKENEXCHANGE_ADDRESS;
    const CarbTokenAddress = process.env.CARBTOKEN_ADDRESS;
    await balanceOf(CarbTokenAddress, process.env.ADDRESS_COMPANY_D, signers[0]);
    await sendCRBToken(CarbTokenAddress, process.env.ADDRESS_COMPANY_D, 100, signers);
    await balanceOf(CarbTokenAddress, process.env.ADDRESS_COMPANY_D, signers);
    //await sendIOTX(process.env.B_ADDRESS_TESTNET, "1", signers);
}

// Run the script
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });