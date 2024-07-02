const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Get the transaction hash
  const txHash = "0x56d73050ecc7ede59a69f943b8ed4bb2de2b6a9ffff8cdd7a552211743b672cc";

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