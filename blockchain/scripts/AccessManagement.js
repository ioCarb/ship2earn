require('dotenv').config();

async function setVerifierRole(VerifierContractAddress, AllowanceContractAddress, signers) {
  const chalk = (await import('chalk')).default;
  const Contract = await ethers.getContractAt("AllowanceContract", AllowanceContractAddress, signers[0]);
  Contract.on("verifierRoleSet", (address) => {
    console.log(chalk.green(`Event: Verifier Role set for ${address}.`));
  });
  const tx = await Contract.setVerifierRole(VerifierContractAddress);
  console.log(`Transaction hash: ${tx.hash}`);
  receipt = await tx.wait();
  console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
  console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

async function setMinter(AllowanceContractAddress, CarbTokenAddress, signers) {
  const chalk = (await import('chalk')).default;
  const Contract = await ethers.getContractAt("CarbToken", CarbTokenAddress, signers[0]);
  Contract.on("minterRoleSet", (address) => {
    console.log(chalk.green(`Event: Minter Role set for ${address}.`));
  });
  const tx = await Contract.setMinter(AllowanceContractAddress);
  console.log(`Transaction hash: ${tx.hash}`);
  receipt = await tx.wait();
  console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
  console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

async function setCarbTokenAddress(AllowanceContractAddress, CarbTokenAddress, signers) {
  const chalk = (await import('chalk')).default;
  const Contract = await ethers.getContractAt("AllowanceContract", AllowanceContractAddress, signers[0]);
  Contract.on("tokenContractSet", (address) => {
    console.log(chalk.green(`Event: Carb Token Address set to ${address}.`));
  });
  const tx = await Contract.setMintingContract(CarbTokenAddress);
  console.log(`Transaction hash: ${tx.hash}`);
  receipt = await tx.wait();
  console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
  console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

async function main() {
  const signers = await ethers.getSigners();
  const AllowanceContractAddress = process.env.ALLOWANCECONTRACT_ADDRESS;
  const VerifierContractAddress = signers[0].address //--> for testing as long as verifier not live, then: process.env.VERIFIER_CONTRACT_ADDRESS;
  const CarbTokenAddress = process.env.CARBTOKEN_ADDRESS;
  await setVerifierRole(VerifierContractAddress, AllowanceContractAddress, signers); // sets the verifier role within the allowance contract
  // -> Gas used: 38876
  await setMinter(AllowanceContractAddress, CarbTokenAddress, signers); // sets the minter role within the carb token contract
  // -> Gas used: 38941
  await setCarbTokenAddress(AllowanceContractAddress, CarbTokenAddress, signers); // sets the carb token address within the allowance contract
  // -> Gas used: 36205
}
  
// Run the script
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });