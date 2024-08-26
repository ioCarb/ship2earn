require('dotenv').config();
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const admin = process.env.ADDRESS_ADMIN;

module.exports = buildModule("VerifierModule", (m) => {
    const verifier = m.contract("Verifier", [process.env.ALLOWANCECONTRACT_ADDRESS]);
    return { verifier };
});
