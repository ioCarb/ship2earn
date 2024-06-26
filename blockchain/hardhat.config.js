require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

// npx tasks 

// npx hardhat pebblesCounter --contractaddress <contractaddress>
// npx hardhat pebblesCounter --contractaddress 0x39CC83d180EF86776db3001fCd6Db20d21Ad541c
task("pebblesCounter", "Prints the number of pebbles")
  .addParam("contractaddress", "The address of the PebbleRegistration contract")
  .setAction(async ({ contractaddress }, { ethers }) => {
    const contract = await ethers.getContractAt("PebbleRegistration", contractaddress);
    const pebblesCounter = await contract.pebblesCounter();
    console.log(`The number of pebbles is: ${pebblesCounter.toString()}`);
  });
    

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    localIotex: {
      // These are the official IoTeX endpoints to be used by Ethereum clients
      // url: `https://babel-api.testnet.iotex.io` // Testnet 
      // Mainnet https://babel-api.mainnet.iotex.io
      // url: `https://babel-api.testnet.iotex.io`,
      url: `http://127.0.0.1:15014`,

      // Input your Metamask testnet account private key here
      accounts: [process.env.PRIVATE_KEY_ADMIN, 
        process.env.PRIVATE_KEY_COMPANY_A, 
        process.env.PRIVATE_KEY_COMPANY_B, 
        process.env.PRIVATE_KEY_COMPANY_C],
    },
  },
};