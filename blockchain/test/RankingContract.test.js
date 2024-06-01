const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RankingContract", function () {
  let rankingContract;
  let owner, addr1, addr2, addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const RankingContractFactory = await ethers.getContractFactory("RankingContract");
    rankingContract = await RankingContractFactory.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const isAdmin = await rankingContract.hasRole(rankingContract.ADMIN_ROLE(), owner.address);
      expect(isAdmin).to.be.true;
    });
  });

  describe("Set and Get Total Companies", function () {
    it("Should allow the admin to set total companies", async function () {
      await rankingContract.connect(owner).setTotalCompanies(5);
      const totalCompanies = await rankingContract.getTotalCompanies();
      expect(totalCompanies).to.equal(5);
    });

    it("Should not allow non-admins to set total companies", async function () {
      await expect(rankingContract.connect(addr1).setTotalCompanies(5)).to.be.revertedWith("AccessControl");
    });
  });

  describe("Company Data Handling", function () {
    beforeEach(async function () {
      await rankingContract.connect(owner).setTotalCompanies(3);
      await rankingContract.connect(owner).setRankingRole(owner.address);
    });

    it("Should receive data and emit event", async function () {
      await expect(rankingContract.connect(owner).receiveData(addr1.address, 1000, 500))
        .to.emit(rankingContract, "companyDataReceived")
        .withArgs(addr1.address, false);

      await rankingContract.connect(owner).receiveData(addr2.address, 1500, 700);
      await expect(rankingContract.connect(owner).receiveData(addr3.address, 2000, 1000))
        .to.emit(rankingContract, "companyDataReceived")
        .withArgs(addr3.address, true);
    });

    it("Should calculate CO2 savings correctly and emit event", async function () {
      company_A = [100000, 550, 100000n, 550n]
      company_B = [156000, 7050, 156000n, 7050n]
      company_C = [200000, 10000, 200000n, 10000n]
      await rankingContract.connect(owner).receiveData(addr1.address, company_A[0], company_A[1]);
      await rankingContract.connect(owner).receiveData(addr2.address, company_B[0], company_B[1]);
      await rankingContract.connect(owner).receiveData(addr3.address, company_C[0], company_C[1]);

      await rankingContract.connect(owner).calculateRanking();

      const avgCO2PerKm = await rankingContract.avgCO2PerKm();
      const expectedSavings1 = ((avgCO2PerKm * company_A[3]) / 1000000000000000000n) - company_A[2];
      const expectedSavings2 = ((avgCO2PerKm * company_B[3]) / 1000000000000000000n) - company_B[2];
      const expectedSavings3 = ((avgCO2PerKm * company_C[3]) / 1000000000000000000n) - company_C[2];

      if (expectedSavings1 > 0n) {
        await expect(rankingContract.connect(owner).calcCO2Savings())
          .to.emit(rankingContract, "savingsCalculated")
          .withArgs(addr1.address, Math.ceil(Number(expectedSavings1)));
      }

      if (expectedSavings2 > 0n) {
        await expect(rankingContract.connect(owner).calcCO2Savings())
          .to.emit(rankingContract, "savingsCalculated")
          .withArgs(addr2.address, Math.ceil(Number(expectedSavings2)));
      }

      if (expectedSavings3 > 0n) {
        await expect(rankingContract.connect(owner).calcCO2Savings())
          .to.emit(rankingContract, "savingsCalculated")
          .withArgs(addr3.address, Math.ceil(Number(expectedSavings3)));
      }
    });
  });
});
