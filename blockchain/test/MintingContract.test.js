const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MintingContract", function () {
    let mintingContract;
    let owner, addr1, addr2, addr3;

    beforeEach(async function () {
        [owner, addr1, addr2, addr3] = await ethers.getSigners();
        const MintingContractFactory = await ethers.getContractFactory("MintingContract");
        mintingContract = await MintingContractFactory.deploy();
    });

    describe("Minter Role", function () {
        it("should set the minter role", async function () {
            // Set the minter role
            await mintingContract.connect(owner).setMinter(addr1.address);
            // Check if the minter role is set correctly
            const isMinter = await mintingContract.hasRole(mintingContract.MINTER_ROLE(), addr1.address);
            expect(isMinter).to.be.true;
        });
        it("should mint tokens and emit Minted event", async function () {
            mintingContract.on("Minted", (_to, _amount) => {
                to_amount = _amount;
                to_address = _to;
              });
            // Mint tokens
            const amount = 100;
            const recipient = addr1.address;
            await mintingContract.connect(owner).mint(recipient, amount);

            // Check if tokens are minted correctly
            const balance = await mintingContract.balanceOf(recipient);
            expect(balance).to.equal(amount);

            // Check if Minted event is emitted
            const events = await mintingContract.queryFilter("Minted");
            expect(events.length).to.equal(1);
            expect(to_address).to.equal(recipient);
            expect(to_amount).to.equal(amount);
        });
    });
});
