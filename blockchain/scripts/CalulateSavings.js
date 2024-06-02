require('dotenv').config();

async function calculate(contractAddress, signer) {
    const Contract = await ethers.getContractAt("RankingContract", contractAddress, signer);
    Contract.on("savingsCalculated", (address, savings) => {
      console.log(`Company ${address} saved ${savings} CO2.`);
    });
    const MintContract = await ethers.getContractAt("MintingContract", process.env.MINTING_CONTRACT_ADDRESS, signer);
    MintContract.on("Minted", (address, amount) => {
      console.log(`Company ${address} received ${amount} CRB.`);
    });
    const tx = await Contract.calculateRanking({gasLimit: 6000000});
    await tx.wait();
  }

async function main() {
    const RankingContractAddress = process.env.RANKING_CONTRACT_ADDRESS;
    const signers = await ethers.getSigners();
    await calculate(RankingContractAddress, signers[0]);
    }
    
// Run the script
main()
    .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });