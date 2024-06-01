require('dotenv').config();

async function getContractOwner(Contract) {
  const contractOwner = await Contract.admin();
  console.log("Contract owner:", contractOwner);
}

async function getPebblesCount(Contract) {
  const pebblesCount = await Contract.pebblesCount();
  console.log("Number of pebbles registered:", pebblesCount.toString());
}

async function registerPebble(Contract, deviceid, vehicleid) {
  Contract.on("PebbleRegistered", (pebbleId, vehicleId, isRegistered) => {
    //console.log(pebbleId, vehicleId, isRegistered);
    if (isRegistered === true) {
      console.log(`Pebble with ID ${pebbleId} registered successfully to vehicle ${vehicleId}`);
    } else {
      console.log(`Pebble with ID ${pebbleId} already registered`);
    }
  });

  const signers = await ethers.getSigners();
  const signer = signers[0];
  const tx = await Contract.registerDevice(deviceid, vehicleid, { from: signer.address });
  console.log(`Transaction hash: ${tx.hash}`);
  await tx.wait();

}

async function getVehicle(Contract, deviceid) {
  const vehicle = await Contract.getPebble(deviceid);
  console.log("Vehicle ID:", vehicle.toString());
}

async function Registration(contractAddress, deviceid, vehicleid) {
  const Contract = await ethers.getContractAt("PebbleRegistration", contractAddress);
  // await getContractOwner(Contract);
  // await getPebblesCount(Contract);
  await registerPebble(Contract, deviceid, vehicleid);
  // await getVehicle(Contract, deviceid);
}
async function Ranking(contractAddress, signers) {
  const Contract = await ethers.getContractAt("RankingContract", contractAddress);
  Contract.on("rankingRoleSet", (address) => {
    console.log(`Role set for ${address}.`);
  });
  const tx_set = await Contract.setTotalCompanies(3);
  await tx_set.wait();
  const num = await Contract.getTotalCompanies();
  console.log("Total companies: ", num.toString());
  const signer_A = signers[1];
  const tx_A = await Contract.setRankingRole(signer_A.address, { from: signers[0].address });
  await tx_A.wait();
  const signer_B = signers[2];
  const tx_B = await Contract.setRankingRole(signer_B.address, { from: signers[0].address });
  await tx_B.wait();
  const signer_C = signers[3];
  const tx_C = await Contract.setRankingRole(signer_C.address, { from: signers[0].address });
  await tx_C.wait();
}

async function reportData(contractAddress, signers) {
  const totalCO2Company = [100, 200, 300];
  const totalDistanceCompany = [1000, 1000, 1000];
  for (let i = 0; i < 3; i++) {
    signer = signers[i+1]
    const Contract = await ethers.getContractAt("RankingContract", contractAddress, signer);
    Contract.on("companyDataReceived", (address, lastCompany) => {
      console.log(`Company ${address} data received. Last company? ${lastCompany}.`);
    });
    const tx = await Contract.receiveData(signer.address, totalCO2Company[i], totalDistanceCompany[i], {gasLimit: 3000000});
    await tx.wait();
  }
}

async function sendFunds(receiver, signer) {

  const amount = ethers.parseEther("1000.0"); // The amount of Ether you want to send

  const tx = await signer.sendTransaction({
      to: receiver,
      value: amount
  });

  await tx.wait();
}

async function calculate(contractAddress, signer) {
  const Contract = await ethers.getContractAt("RankingContract", contractAddress, signer);
  Contract.on("savingsCalculated", (address, savings) => {
    console.log(`Company ${address} saved ${savings} CO2.`);
  });
  const tx = await Contract.calculateRanking({gasLimit: 6000000});
  await tx.wait();
}

async function main() {
  const RegistrationContractAddress = "0x39CC83d180EF86776db3001fCd6Db20d21Ad541c"; // Replace with your contract address
  const deviceid = "0x1234567541ddf"; // Replace with your device ID
  const vehicleid = "bike"; // Replace with your vehicle ID
  // await Registration(RegistrationContractAddress, deviceid, vehicleid);

  const RankingContractAddress = "0xdd2B1eDa0DEA2033355A93201a5eF7761b7a03C3"; // Replace with your contract address
  const signers = await ethers.getSigners();
  await Ranking(RankingContractAddress, signers);
  await reportData(RankingContractAddress, signers);
  await calculate(RankingContractAddress, signers[0]);
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });