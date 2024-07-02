require('dotenv').config();

async function addCompany(AllowanceContractAddress, signers, companyToAdd, allowance) {
    const chalk = (await import('chalk')).default;
    const Contract = await ethers.getContractAt("AllowanceContract", AllowanceContractAddress, signers[0]);
    const tx = await Contract.addCompany(companyToAdd, allowance);
    console.log(`Transaction hash: ${tx.hash}`);
    receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

async function reportData(AllowanceContractAddress, signers, company, emissions) {
    const chalk = (await import('chalk')).default;
    const Contract = await ethers.getContractAt("AllowanceContract", AllowanceContractAddress, signers[0]);
    Contract.on("successfullEmissionReport", (address, savings) => {
      console.log(chalk.green(`Event: Report successful. Emissions saved: ${savings}kg CO2.`));
    });
    const CarbContract = await ethers.getContractAt("CarbToken", process.env.CARBTOKEN_ADDRESS, signers[0]);
    CarbContract.on("minted", (address, amount) => {
      console.log(chalk.green(`Event: CRB minted: ${amount}. To: ${address}`));
    });
    const tx = await Contract.emissionReport(company, emissions);
    console.log(`Transaction hash: ${tx.hash}`);
    receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

async function main() {
    const signers = await ethers.getSigners();
    const AllowanceContractAddress = process.env.ALLOWANCECONTRACT_ADDRESS;
    const company = process.env.ADDRESS_COMPANY_B;
    const allowance = process.env.ALLOWANCE_B;
    const emissions = process.env.EMISSIONS_B;
    //await addCompany(AllowanceContractAddress, signers, company, allowance);
    // -> gas used: 83807
    await reportData(AllowanceContractAddress, signers, company, emissions);
    // -> gas used: 95117
}

// Run the script
main() 
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });