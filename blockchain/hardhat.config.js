require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();
require('hardhat-gas-reporter');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  gasReporter: {
    enabled: true,
    currency: 'USD',
    outputFile: 'gas-report.txt',
    noColors: true,
    coinmarketcap: 'your_coinmarketcap_api_key', // Optional for USD prices
  },
  networks: {
    testnet: {
      url: `https://babel-api.testnet.iotex.io`,
      accounts: [process.env.PRIV_KEY_TESTNET],
    },
    localIotex: {
      // These are the official IoTeX endpoints to be used by Ethereum clients
      // url: `https://babel-api.testnet.iotex.io`, // Testnet 
      // Mainnet https://babel-api.mainnet.iotex.io
      // url: `https://babel-api.testnet.iotex.io`,
      url: `http://127.0.0.1:15014`,

      // Input your Metamask testnet account private key here
      accounts: [process.env.PRIVATE_KEY_ADMIN, 
        process.env.PRIVATE_KEY_COMPANY_A, 
        process.env.PRIVATE_KEY_COMPANY_B, 
        process.env.PRIVATE_KEY_COMPANY_C],
      loggingEnabled: true,
    },
  },
};