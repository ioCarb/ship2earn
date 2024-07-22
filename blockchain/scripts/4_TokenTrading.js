require('dotenv').config();
const { ethers } = require("hardhat")

// get CRB balance of signer
async function balanceOf(CarbTokenAddress, signer) {
    const CarbToken = await ethers.getContractAt("CarbToken", CarbTokenAddress, signer);
    const balance = await CarbToken.balanceOf(signer.address);
    console.log(`Balance of ${signer.address}: ${balance}`);
}

// send IOTX to wallet from signer
async function sendIOTX(wallet, amount, signer) {
    const chalk = (await import('chalk')).default;
    const amountInWei = ethers.parseUnits(amount, 18);
    const tx = await signer.sendTransaction({
        to: wallet,
        value: amountInWei
    });
    console.log(`Transaction hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

// send CRB tokens to wallet from signer
async function sendCRBToken(CarbTokenAddress, wallet, amount, signer) {
    const chalk = (await import('chalk')).default;
    const CarbToken = await ethers.getContractAt("CarbToken", CarbTokenAddress, signer);
    const tx = await CarbToken.transfer(wallet, amount);
    console.log(`Transaction hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

// functions to send CRB and IOTX tokens
async function main() {
    const signers = await ethers.getSigners();
    const CRBTokenExchangeAddress = process.env.CRBTOKENEXCHANGE_ADDRESS;
    const CarbTokenAddress = process.env.CARBTOKEN_ADDRESS;
    const signer = signers[0];

    // get CRB balance of signer
    //await balanceOf(CarbTokenAddress, signer);

    // send CRB tokens to wallet from signer: 
    //await sendCRBToken(CarbTokenAddress, wallet = process.env.ADDRESS_COMPANY_D, 100, signer);

    // send IOTX to wallet from signer:
    //await sendIOTX(process.env.B_ADDRESS_TESTNET, "1", signer);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });