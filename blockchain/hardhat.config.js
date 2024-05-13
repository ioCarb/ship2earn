require("@nomicfoundation/hardhat-toolbox");

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
      accounts: [`852a59f98b328f7ccbd195212dfadf53cabe80701639dcfd3d9efcf30b2a3fc4`],
    },
  },
};