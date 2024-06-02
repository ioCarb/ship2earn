require('dotenv').config();
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const admin = process.env.ADDRESS_ADMIN;

const PebbleRegistrationModule = buildModule("PebbleRegistrationModule", (m) => {
    const adminAddress = m.getParameter("admin", admin);
    const pebbleRegistration = m.contract("PebbleRegistration", [adminAddress]);
    return { pebbleRegistration };
});

module.exports = PebbleRegistrationModule;