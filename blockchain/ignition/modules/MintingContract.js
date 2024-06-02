require('dotenv').config();
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const admin = process.env.ADDRESS_ADMIN;

const MintingContractModule = buildModule("MintingContractModule", (m) => {
    const adminAddress = m.getParameter("admin", admin);
    const mintingContract = m.contract("MintingContract");
    return { mintingContract };
});

module.exports = MintingContractModule;