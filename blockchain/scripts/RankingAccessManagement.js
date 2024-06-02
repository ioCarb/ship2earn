require('dotenv').config();

async function AccessManagement(contractAddress, signers, numberOfCompanies) {
  const Contract = await ethers.getContractAt("RankingContract", contractAddress);
  Contract.on("rankingRoleSet", (address) => {
    console.log(`Role set for ${address}.`);
  });
  const tx_set = await Contract.setTotalCompanies(numberOfCompanies);
  await tx_set.wait();
  const num = await Contract.getTotalCompanies();
  console.log("Total companies set to: ", num.toString());
  for (let i = 1; i <= numberOfCompanies; i++) {
    const tx = await Contract.setRankingRole(signers[i].address, { from: signers[0].address });
    await tx.wait();
  }
}

async function SetMintingContract(contractAddress, mintingContractAddress, signer) {
  const Contract = await ethers.getContractAt("RankingContract", contractAddress, signer);
  Contract.on("mintingContractSet", (address) => {
    console.log(`Minting contract set to ${address}.`);
  });
  const tx = await Contract.setMintingContract(mintingContractAddress);
  await tx.wait();
}

async function SetMinterRole(mintingContractAddress, rankingContractAddress, signer) {
  const Contract = await ethers.getContractAt("MintingContract", mintingContractAddress, signer);
  Contract.on("MinterRoleSet", (address) => {
    console.log(`Minter role set for ${address}.`);
  });
  const tx = await Contract.setMinter(rankingContractAddress);
  await tx.wait();
}

async function main() {
  const RankingContractAddress = process.env.RANKING_CONTRACT_ADDRESS;
  const signers = await ethers.getSigners();
  const MintingContractAddress = process.env.MINTING_CONTRACT_ADDRESS;
  await AccessManagement(RankingContractAddress, signers, process.env.NUMBER_OF_COMPANIES);
  await SetMintingContract(RankingContractAddress, MintingContractAddress, signers[0]);
  await SetMinterRole(MintingContractAddress, RankingContractAddress, signers[0]);
  }
  
// Run the script
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });