require('dotenv').config();
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DeviceRegistryModule", (m) => {
    const deviceRegistry = m.contract("DeviceRegistry");
    return { deviceRegistry };
});