require('dotenv').config();

async function setRankingRole(RankingContractAddress, VerifierContractAddress, signer) {
  const Contract = await ethers.getContractAt("RankingContract", RankingContractAddress);
  Contract.on("rankingRoleSet", (address) => {
    console.log(`Event emitted: Ranking Role set for verifier contract: ${address}.`);
  });
  const tx_set = await Contract.setTotalCompanies(process.env.NUMBER_OF_COMPANIES);
  await tx_set.wait();
  const num = await Contract.getTotalCompanies();
  //console.log("Event emitted: Total companies set to: ", num.toString());
  const tx = await Contract.setRankingRole(VerifierContractAddress,{ from: signer.address });
  await tx.wait();
  /*for (let i = 1; i <= numberOfCompanies; i++) {
    const tx = await Contract.setRankingRole(signers[i].address, { from: signer.address });
    await tx.wait();
  }*/
}

async function setRankingContract(VerifierContractAddress, RankingContractAddress, signer) {
  const Contract = await ethers.getContractAt("Verifier", VerifierContractAddress, signer);
  Contract.on("rankingContractSet", (address) => {
    console.log(`Event emitted: Ranking contract set to ${address}.`);
  });
  const tx = await Contract.setRankingContract(RankingContractAddress);
  await tx.wait();
}

async function SetMintingContract(RankingContractAddress, mintingContractAddress, signer) {
  const Contract = await ethers.getContractAt("RankingContract", RankingContractAddress, signer);
  Contract.on("mintingContractSet", (address) => {
    console.log(`Minting contract set to ${address}.`);
  });
  const tx = await Contract.setMintingContract(mintingContractAddress);
  await tx.wait();
}

async function SetMinterRole(MintingContractAddress, RankingContractAddress, signer) {
  const Contract = await ethers.getContractAt("MintingContract", MintingContractAddress, signer);
  Contract.on("MinterRoleSet", (address) => {
    console.log(`Minter role set for ${address}.`);
  });
  const tx = await Contract.setMinter(RankingContractAddress);
  await tx.wait();
}

async function main() {
  const RankingContractAddress = process.env.RANKING_CONTRACT_ADDRESS;
  const VerifierContractAddress = process.env.VERIFIER_CONTRACT_ADDRESS;
  const signers = await ethers.getSigners();
  const MintingContractAddress = process.env.MINTING_CONTRACT_ADDRESS;
  await setRankingRole(RankingContractAddress, VerifierContractAddress, signers[0]);
  await SetMintingContract(RankingContractAddress, MintingContractAddress, signers[0]);
  await SetMinterRole(MintingContractAddress, RankingContractAddress, signers[0]);
  await setRankingContract(VerifierContractAddress, RankingContractAddress, signers[0]);
  }
  
// Run the script
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });