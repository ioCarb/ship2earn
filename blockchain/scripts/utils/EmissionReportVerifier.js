require('dotenv').config();
require('ethers');
const fs = require('fs');
const path = require('path');

function extractProofDataGM(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const proof = [data.proof.a, data.proof.b, data.proof.c];
  const input = data.inputs;
  console.log(proof);
  console.log(input);
  return { proof, input };
}

function extractProofDataMarlin(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const proof = [
    data.proof.commitments[0].map(comm => comm[0]),
    data.proof.commitments[1].map(comm => comm[0]),
    data.proof.commitments[1][1][1],
    data.proof.commitments[2].map(comm => comm[0]),
    data.proof.commitments[2][0][1],
    data.proof.evaluations,
    data.proof.pc_lc_opening_1,
    data.proof.pc_lc_opening_1_degree,
    data.proof.pc_lc_opening_2
  ];
  const input = data.inputs;
  //console.log(proof);
  //console.log(input);
  return { proof, input };
}

async function verifyTx(VerifierContractAddress, AllowanceContractAddress, CarbTokenAddress, proof, input, signers) {
  const chalk = (await import('chalk')).default;
  const VerifierContract = await ethers.getContractAt('Verifier', VerifierContractAddress, signers[0]);
  const AllowanceContract = await ethers.getContractAt('AllowanceContract', AllowanceContractAddress, signers[0]);
  const CarbToken = await ethers.getContractAt('CarbToken', CarbTokenAddress, signers[0]);
  VerifierContract.on("Verified", (r) => {
    console.log(chalk.green(`Event: Proof accepted: ${r}.`));
  });
  AllowanceContract.on("CompanyDataReady", (deviceID, address, trackedCO2, ready) => {
    console.log(chalk.green(`Event: Company of device ${deviceID} is ${address}; is ready: ${ready}.`));
  });
  AllowanceContract.on("EmissionReportReceived", (company, savings, success) => {
    console.log(chalk.green(`Event: Company ${company}, saved ${savings}, success: ${success}.`));
  });
  CarbToken.on("minted", (to, amount) => {
    console.log(chalk.green(`Event: Minted ${amount} tokens to ${to}.`));
  });
  const tx = await VerifierContract.verifyTx(proof, input, { gasLimit: 50000000 });
  // -> Gas used: 
  console.log(`Transaction hash: ${tx}`);
  console.log(`Transaction hash: ${tx.hash}`);
  receipt = await tx.wait();
  console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
  console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

async function main() {
  const signers = await ethers.getSigners();
  const jsonFilePath = path.join(__dirname, 'proof.json');
  const { proof, input } = extractProofDataMarlin(jsonFilePath); 
  //const { proofGM, inputGM } = extractProofDataGM(jsonFilePath);
  const AllowanceContractAddress = process.env.ALLOWANCECONTRACT_ADDRESS;
  const VerifierContractAddress = process.env.DIST_VERIFIER_CONTRACT_ADDRESS;
  const CarbTokenAddress = process.env.CARBTOKEN_ADDRESS;
  await verifyTx(VerifierContractAddress, AllowanceContractAddress, CarbTokenAddress, proof, input , signers);
}

// Run the script to test proof acceptance and on-chain business logic 
// without the need of a full w3bstream setup
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });