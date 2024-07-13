require('dotenv').config();
require('ethers');
const fs = require('fs');
const path = require('path');

function extractProofDataGM(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const proof = [data.proof];
  const input = data.inputs;
  return { proof, input};
}

function extractProofDataMarlin(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const proof = {
    comms_1: data.proof.commitments[0].map(comm => comm[0]),
    comms_2: data.proof.commitments[1].map(comm => comm[0]),
    degree_bound_comms_2_g1: data.proof.commitments[1][1][1],
    comms_3: data.proof.commitments[2].map(comm => comm[0]),
    degree_bound_comms_3_g2: data.proof.commitments[2][0][1],
    evals: data.proof.evaluations,
    batch_lc_proof_1: data.proof.pc_lc_opening_1,
    batch_lc_proof_1_r: data.proof.pc_lc_opening_1_degree,
    batch_lc_proof_2: data.proof.pc_lc_opening_2
  };

  const input = data.inputs;

  return { proof, input };
}

async function verifyTx(VerifierContractAddress, AllowanceContractAddress, proof, input, signers) {
  const chalk = (await import('chalk')).default;
  const VerifierContract = await ethers.getContractAt('Verifier', VerifierContractAddress, signers[0]);
  const AllowanceContract = await ethers.getContractAt('AllowanceContract', AllowanceContractAddress, signers[0]);
  VerifierContract.on("Verified", (r, stored) => {
    console.log(chalk.green(`Event: Transaction accepted: ${r}, stored: ${stored}.`));
  });
  AllowanceContract.on("CompanyDataReady", (address, ready) => {
    console.log(chalk.green(`Event: Company ${address} data received, ready: .`));
  });
  const tx = await VerifierContract.verifyTx(proof, input, { gasLimit: 50000000 });
  // -> Gas used: 
  console.log(`Transaction hash: ${tx.hash}`);
  receipt = await tx.wait();
  console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
  console.log(chalk.red(`Gas used: ${receipt.gasUsed.toString()}`));
}

async function main() {
  const signers = await ethers.getSigners();
  const jsonFilePath = path.join(__dirname, 'proof.json');
  const { proof, input} = extractProofDataMarlin(jsonFilePath);
  const AllowanceContractAddress = process.env.ALLOWANCECONTRACT_ADDRESS;
  const VerifierContractAddress = process.env.DIST_VERIFIER_CONTRACT_ADDRESS;
  await verifyTx(VerifierContractAddress, AllowanceContractAddress, proof, input , signers);
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });