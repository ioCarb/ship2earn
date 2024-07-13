require('dotenv').config();
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const admin = process.env.ADDRESS_ADMIN;

module.exports = buildModule("SecondPartModule", (m) => {
    // DeviceRegistry
    const cRBTokenExchange = m.contract("CRBTokenExchange", [process.env.CARBTOKEN_ADDRESS]);

    // CarbToken
    const verifier = m.contract("Verifier", [process.env.CARBTOKEN_ADDRESS]);

    return { cRBTokenExchange, verifier };
});