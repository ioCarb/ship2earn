require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    testnet: {
      url: `https://babel-api.testnet.iotex.io`,
      accounts: [process.env.PRIV_KEY_TESTNET,
        process.env.COMPANY_KEY_TESTNET],
      gas: 10000000, // Set your desired gas limit here
    },
  },
};