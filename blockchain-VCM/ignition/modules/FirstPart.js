require('dotenv').config();
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("FirstPartModule", (m) => {
    // DeviceRegistry
    const deviceRegistry = m.contract("DeviceRegistry");

    // CarbToken
    const carbToken = m.contract("CarbToken");

    // AllowanceContract
    const allowanceContract = m.contract("AllowanceContract");

    // CarbCertificate
    const carbCertificate = m.contract("CarbCertificate");

    return { deviceRegistry, carbToken, allowanceContract, carbCertificate };
});