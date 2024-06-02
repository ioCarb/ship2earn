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



async function sendFunds(receiver, signer) {

  const amount = ethers.parseEther("1000.0"); // The amount of Ether you want to send

  const tx = await signer.sendTransaction({
      to: receiver,
      value: amount
  });

  await tx.wait();
}


async function main() {
  const RegistrationContractAddress = "0x39CC83d180EF86776db3001fCd6Db20d21Ad541c"; // Replace with your contract address
  const deviceid = "0x1234567541ddf"; // Replace with your device ID
  const vehicleid = "bike"; // Replace with your vehicle ID
  // await Registration(RegistrationContractAddress, deviceid, vehicleid);
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });