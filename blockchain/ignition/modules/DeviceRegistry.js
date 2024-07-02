require('dotenv').config();
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const admin = process.env.ADDRESS_ADMIN;

module.exports = buildModule("DeviceRegistryModule", (m) => {
    const deviceRegistry = m.contract("DeviceRegistry");
    return { deviceRegistry };
});