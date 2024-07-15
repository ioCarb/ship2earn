require('dotenv').config();
const { ethers } = require("hardhat")

async function createBuyOffer(exchangeAddress, signers, crbAmount, iotxAmount) {
    const chalk = (await import('chalk')).default;
    const Contract = await ethers.getContractAt("CRBTokenExchange", exchangeAddress, signers[0]);
    Contract.on("OfferCreated", (offerId, maker, crbAmount, iotxAmount, isBuyOffer) => {
        console.log(chalk.green(`Event: Buy offer created. Offer ID: ${offerId}, CRB Amount: ${crbAmount}, IOTX Amount: ${iotxAmount}`));
    });
    const tx = await Contract.createBuyOffer(crbAmount, { value: iotxAmount });
    console.log(`Transaction hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

async function createSellOffer(exchangeAddress, signers, crbAmount, iotxAmount) {
    const chalk = (await import('chalk')).default;
    const Contract = await ethers.getContractAt("CRBTokenExchange", exchangeAddress, signers[1]);
    Contract.on("OfferCreated", (offerId, maker, crbAmount, iotxAmount, isBuyOffer) => {
        console.log(chalk.green(`Event: Sell offer created. Offer ID: ${offerId}, CRB Amount: ${crbAmount}, IOTX Amount: ${iotxAmount}`));
    });
    // First, approve the exchange to spend CRB tokens
    const CRBToken = await ethers.getContractAt("CarbToken", process.env.CARBTOKEN_ADDRESS, signers[1]);
    await CRBToken.approve(exchangeAddress, crbAmount);

    const tx = await Contract.createSellOffer(crbAmount, iotxAmount, { gasLimit: 1000000 });
    console.log(`Transaction hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

async function acceptOffer(exchangeAddress, signers, offerId, iotxAmount) {
    const chalk = (await import('chalk')).default;
    const Contract = await ethers.getContractAt("CRBTokenExchange", exchangeAddress, signers[0]);
    Contract.on("OfferAccepted", (offerId, taker) => {
        console.log(chalk.green(`Event: Offer accepted. Offer ID: ${offerId}, Taker: ${taker}`));
    });
    const tx = await Contract.acceptOffer(offerId, { value: iotxAmount });
    console.log(`Transaction hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

async function cancelOffer(exchangeAddress, signers, offerId) {
    const chalk = (await import('chalk')).default;
    const Contract = await ethers.getContractAt("CRBTokenExchange", exchangeAddress, signers[0]);
    Contract.on("OfferCancelled", (offerId) => {
        console.log(chalk.green(`Event: Offer cancelled. Offer ID: ${offerId}`));
    });
    const tx = await Contract.cancelOffer(offerId);
    console.log(`Transaction hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));  
}

async function getOffersCount(exchangeAddress, signers) {
    const Contract = await ethers.getContractAt("CRBTokenExchange", exchangeAddress, signers[0]);
    const count = await Contract.getOffersCount();
    console.log(`Total number of active offers: ${count}`);
}

async function balanceOf(CarbTokenAddress, wallet, signers) {
    const CarbToken = await ethers.getContractAt("CarbToken", CarbTokenAddress, signers[0]);
    const balance = await CarbToken.balanceOf(wallet);
    console.log(`Balance of ${wallet}: ${balance}`);
}

async function main() {
    const signers = await ethers.getSigners();
    const exchangeAddress = process.env.CRBTOKENEXCHANGE_ADDRESS;
    const CarbTokenAddress = process.env.CARBTOKEN_ADDRESS;
    // Example usage:
    // await createBuyOffer(exchangeAddress, signers, ethers.utils.parseEther("10"), ethers.utils.parseEther("1"));
    //await createSellOffer(exchangeAddress, signers, 200, 10);
    // await acceptOffer(exchangeAddress, signers, 0, ethers.utils.parseEther("1"));
    // await cancelOffer(exchangeAddress, signers, 1);
    //await getOffersCount(exchangeAddress, signers);
    await balanceOf(CarbTokenAddress, process.env.ADDRESS_COMPANY_D, signers);
}

// Run the script
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });