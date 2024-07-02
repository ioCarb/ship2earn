require('dotenv').config();

async function balance(CarbTokenAddress, signers) {
    const chalk = (await import('chalk')).default;
    const CarbContract = await ethers.getContractAt("CarbToken", process.env.CARBTOKEN_ADDRESS, signers[0]);
    const balance = await CarbContract.balanceOf(signers[1].address);
    console.log(`CRB balance: ${balance}`);
}

async function main() {
    const signers = await ethers.getSigners();
    const CarbTokenAddress = process.env.CARBTOKEN_ADDRESS;
    await balance(CarbTokenAddress, signers);
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });