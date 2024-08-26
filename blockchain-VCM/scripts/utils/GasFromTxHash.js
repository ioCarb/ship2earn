const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Get the transaction hash
  const txHash = "0xceecc0e83ae5ebb1113558c466709a092c36369212b26227586404282363fe9c";

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