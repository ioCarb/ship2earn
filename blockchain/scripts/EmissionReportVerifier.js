require('dotenv').config();

async function main() {
    const signers = await ethers.getSigners();
    const AllowanceContractAddress = process.env.ALLOWANCECONTRACT_ADDRESS;
    const company = process.env.ADDRESS_COMPANY_B;
    const allowance = process.env.ALLOWANCE_B;
    const emissions = process.env.EMISSIONS_B;
    //await addCompany(AllowanceContractAddress, signers, company, allowance);
    // -> gas used: 83807
    await verifyTx();
    // -> gas used: 95117
}

// Run the script
main() 
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });