require('dotenv').config();

async function checkAllowance(AllowanceContractAddress, CarbTokenAddress, company, signers) {
    const chalk = (await import('chalk')).default;
    const AllowanceContract = await ethers.getContractAt('AllowanceContract', AllowanceContractAddress, signers[0]);
    const CarbToken = await ethers.getContractAt('CarbToken', CarbTokenAddress, signers[0]);
    AllowanceContract.on("CompanyDataReady", (address) => {
        console.log(chalk.green(`Event: Company ${address} is ready to be checked.`));
    });
    CarbToken.on("minted", (address) => {
        console.log(chalk.green(`Event: Minted ${address}.`));
    });
    const tx = await AllowanceContract.checkAllowance(company, { gasLimit: 5000000 });
    console.log(`Transaction hash: ${tx.hash}`);
    receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

async function main() {
    const signers = await ethers.getSigners();
    const AllowanceContractAddress = process.env.ALLOWANCECONTRACT_ADDRESS;
    const CarbTokenAddress = process.env.CARBTOKEN_ADDRESS;
    const company = process.env.ADDRESS_COMPANY_D;
    await checkAllowance(AllowanceContractAddress, CarbTokenAddress, company, signers);
}
  
// Run the script
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });