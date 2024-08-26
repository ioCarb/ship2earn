require('dotenv').config();
require('ethers');

async function offsetExcess(AllowanceContractAddress, signer) {
    const chalk = (await import('chalk')).default;
    const AllowanceContract = await ethers.getContractAt('AllowanceContract', AllowanceContractAddress, signer);
    const tx = await AllowanceContract.offsetExcess();
    // -> Gas used: 
    console.log(`Transaction hash: ${tx.hash}`);
    receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

async function getNFTData(CarbCertificateAddress, tokenId, signer) {
    const chalk = (await import('chalk')).default;
    const CarbCertificate = await ethers.getContractAt('CarbCertificate', CarbCertificateAddress, signer);
    const data = await CarbCertificate.getNFTData(tokenId);
    console.log(`NFT ${tokenId} data: ${data}`);
}

async function tokensOfOwner(CarbCertificateAddress, signer) {
    const chalk = (await import('chalk')).default;
    const CarbCertificate = await ethers.getContractAt('CarbCertificate', CarbCertificateAddress, signer);
    const data = await CarbCertificate.tokensOfOwner(signer.address);
    console.log(`Available NFT tokens: ${data}`);
    return data;
}

async function balanceOf(CarbTokenAddress, signer) {
    const CarbToken = await ethers.getContractAt("CarbToken", CarbTokenAddress, signer);
    const balance = await CarbToken.balanceOf(signer.address);
    console.log(`Balance of ${signer.address}: ${balance}`);
}

// Operational functions executed by the company to offset excess emissions or retrieve stored data
async function main() {
    const signers = await ethers.getSigners();
    const AllowanceContractAddress = process.env.ALLOWANCECONTRACT_ADDRESS;
    const CarbTokenAddress = process.env.CARBTOKEN_ADDRESS;
    const CarbCertificateAddress = process.env.CRBCERT_ADDRESS;
    // adjust signer to company that wants to offset excess
    const signer = signers[0];
    await balanceOf(CarbTokenAddress, signer);
    //await offsetExcess(AllowanceContractAddress, signer);
    const data = await tokensOfOwner(CarbCertificateAddress, signer);
    await getNFTData(CarbCertificateAddress, data[0], signer);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });