require('dotenv').config();
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const admin = process.env.ADDRESS_ADMIN;

module.exports = buildModule("AllowanceContractModule", (m) => {
    const adminAddress = m.getParameter("admin", admin);
    const allowanceContract = m.contract("AllowanceContract");
    return { allowanceContract };
});