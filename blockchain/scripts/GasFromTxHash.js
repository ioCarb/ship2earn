const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Get the transaction hash
  const txHash = "0xe3663afd58eb77b34d47f793bcab15abb846519019a62f674c631da946adea9c";

  // Get the transaction receipt
  const receipt = await hre.ethers.provider.getTransactionReceipt(txHash);

  //console.log("Deployment Address:", allowanceContractDeployment.address);
  console.log("Gas Used:", receipt.gasUsed.toString());
  console.log("Block Number:", receipt.blockNumber);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });