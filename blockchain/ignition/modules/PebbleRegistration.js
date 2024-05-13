const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const admin = "0xbe70c6f915433ed968fa7a1e63d5bc98a186e562";

const PebbleRegistrationModule = buildModule("PebbleRegistrationModule", (m) => {
    const adminAddress = m.getParameter("admin", admin);
    const pebbleRegistration = m.contract("PebbleRegistration", [adminAddress]);
    return { pebbleRegistration };
});

module.exports = PebbleRegistrationModule;