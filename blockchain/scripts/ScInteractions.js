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
  
  async function main() {
    const RegistrationContractAddress = "0x39CC83d180EF86776db3001fCd6Db20d21Ad541c"; // Replace with your contract address
    const deviceid = "0x1234567541ddf"; // Replace with your device ID
    const vehicleid = "bike"; // Replace with your vehicle ID
    // await Registration(RegistrationContractAddress, deviceid, vehicleid);

    const CarbTokenContractAddress = "0x694185f49e55DBd6AfFcc20B582AA99f06F55bb9"
    const CarbContract = await ethers.getContractAt("CarbToken", CarbTokenContractAddress);
    // const IfMintingContractAddress = "0xaB45F2D3b4914EEcADA69Bb5Ffb0d53e9d6Bc5c1"
    // const IfMintingContract = await ethers.getContractAt("IfMinting", IfMintingContractAddress);
    const signers = await ethers.getSigners();
    const signer = signers[0];
    const tx = await CarbContract.addMinter("0xbe70c6f915433ed968fa7a1e63d5bc98a186e562", { from: signer.address });
    console.log(`Transaction hash: ${tx.hash}`);
    await tx.wait();
  }
  
  // Run the script
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });