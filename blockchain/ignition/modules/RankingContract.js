require('dotenv').config();
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const admin = process.env.ADDRESS_ADMIN;

const RankingContractModule = buildModule("RankingContractModule", (m) => {
    const adminAddress = m.getParameter("admin", admin);
    const rankingContract = m.contract("RankingContract");
    return { rankingContract };
});

module.exports = RankingContractModule;