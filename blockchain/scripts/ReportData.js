require('dotenv').config();

async function reportData(contractAddress, signers) {
    const totalCO2Company = [100, 200, 300];
    const totalDistanceCompany = [1000, 1000, 1000];
    const Contract_listener = await ethers.getContractAt("RankingContract", contractAddress, signers[0]);
    Contract_listener.on("companyDataReceived", (address, lastCompany) => {
      console.log(`Company ${address} data received. Last company? ${lastCompany}.`);
    });
    for (let i = 0; i < process.env.NUMBER_OF_COMPANIES; i++) {
      signer = signers[i+1]
      const Contract = await ethers.getContractAt("RankingContract", contractAddress, signer);
      const tx = await Contract.receiveData(signer.address, totalCO2Company[i], totalDistanceCompany[i], {gasLimit: 3000000});
      await tx.wait();
    }
}

async function main() {
    const RankingContractAddress = process.env.RANKING_CONTRACT_ADDRESS;
    const signers = await ethers.getSigners();
    await reportData(RankingContractAddress, signers);
    }
    
// Run the script
main()
    .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });