require('dotenv').config();
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CRBTokenExchangeModule", (m) => {
    const cRBTokenExchange = m.contract("CRBTokenExchange", [process.env.CARBTOKEN_ADDRESS]);
    return { cRBTokenExchange };
});