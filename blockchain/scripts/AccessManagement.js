require('dotenv').config();

async function setRankingRole(RankingContractAddress, VerifierContractAddress, signers) {
  const chalk = (await import('chalk')).default;
  const Contract = await ethers.getContractAt("RankingContract", RankingContractAddress);
  Contract.on("rankingRoleSet", (address) => {
    console.log(chalk.green(`Event: Data Role set for company: ${address}.`));
  });
  const tx_set = await Contract.setTotalCompanies(process.env.NUMBER_OF_COMPANIES, { from: signers[0].address });
  await tx_set.wait();
  const num = await Contract.getTotalCompanies();
  //console.log("Event emitted: Total companies set to: ", num.toString());
  //const tx = await Contract.setRankingRole(VerifierContractAddress,{ from: signer.address });
  //await tx.wait();
  for (let i = 1; i <= process.env.NUMBER_OF_COMPANIES; i++) {
    const tx = await Contract.setRankingRole(signers[i].address, { from: signers[0].address });
    console.log(`Transaction hash: ${tx.hash}`);
    receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);
  }
}

async function setRankingContract(VerifierContractAddress, RankingContractAddress, signer) {
  const chalk = (await import('chalk')).default;
  const Contract = await ethers.getContractAt("Verifier", VerifierContractAddress, signer);
  Contract.on("rankingContractSet", (address) => {
    console.log(chalk.green(`Event: Ranking contract set to ${address}.`));
  });
  const tx = await Contract.setRankingContract(RankingContractAddress);
  console.log(`Transaction hash: ${tx.hash}`);
  receipt = await tx.wait();
  console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
  console.log(`Gas used: ${receipt.gasUsed.toString()}`);
}

async function SetMintingContract(RankingContractAddress, mintingContractAddress, signer) {
  const chalk = (await import('chalk')).default;
  const Contract = await ethers.getContractAt("RankingContract", RankingContractAddress, signer);
  Contract.on("mintingContractSet", (address) => {
    console.log(chalk.green(`Event: Minting contract set to ${address}.`));
  });
  const tx = await Contract.setMintingContract(mintingContractAddress);
  console.log(`Transaction hash: ${tx.hash}`);
  receipt = await tx.wait();
  console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
  console.log(`Gas used: ${receipt.gasUsed.toString()}`);
}

async function SetMinterRole(MintingContractAddress, RankingContractAddress, signer) {
  const chalk = (await import('chalk')).default;
  const Contract = await ethers.getContractAt("MintingContract", MintingContractAddress, signer);
  Contract.on("MinterRoleSet", (address) => {
    console.log(chalk.green(`Event: Minter role set for ${address}.`));
  });
  const tx = await Contract.setMinter(RankingContractAddress);
  console.log(`Transaction hash: ${tx.hash}`);
  receipt = await tx.wait();
  console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
  console.log(`Gas used: ${receipt.gasUsed.toString()}`);
}

async function main() {
  const RankingContractAddress = process.env.RANKING_CONTRACT_ADDRESS;
  const VerifierContractAddress = process.env.VERIFIER_CONTRACT_ADDRESS;
  const signers = await ethers.getSigners();
  const MintingContractAddress = process.env.MINTING_CONTRACT_ADDRESS;
  await setRankingRole(RankingContractAddress, VerifierContractAddress, signers);
  await SetMintingContract(RankingContractAddress, MintingContractAddress, signers[0]);
  await SetMinterRole(MintingContractAddress, RankingContractAddress, signers[0]);
  //await setRankingContract(VerifierContractAddress, RankingContractAddress, signers[0]);
  }
  
// Run the script
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });