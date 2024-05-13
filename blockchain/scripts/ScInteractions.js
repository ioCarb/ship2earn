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
  
  async function main() {
    const contractAddress = "0x39CC83d180EF86776db3001fCd6Db20d21Ad541c"; // Replace with your contract address
    const Contract = await ethers.getContractAt("PebbleRegistration", contractAddress); // Replace "YourContractName" with the actual name of your contract
    
    // const deviceid = "0x1234567890abcdef"; // Replace with your device ID
    const deviceid = "0x1234567541ddf"; // Replace with your device ID
    const vehicleid = "bike"; // Replace with your vehicle ID
  
    // await getContractOwner(Contract);
    await getPebblesCount(Contract);
    // await registerPebble(Contract, deviceid, vehicleid);
    // await getVehicle(Contract, deviceid);
  }
  
  // Run the script
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });