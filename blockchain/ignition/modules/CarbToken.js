require('dotenv').config();
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const admin = process.env.ADDRESS_ADMIN;

module.exports = buildModule("CarbTokenModule", (m) => {
    const carbToken = m.contract("CarbToken");
    return { carbToken };
});