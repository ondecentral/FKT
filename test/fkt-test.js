const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("FoundersKitToken", function () {
  let FoundersKitToken;
  let fkt;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    FoundersKitToken = await ethers.getContractFactory("FoundersKitToken");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    const CAP_VALUE = ethers.utils.parseUnits("10000", 0);  // example cap value, adapt as needed
    fkt = await upgrades.deployProxy(FoundersKitToken, [owner.address, CAP_VALUE], {initializer: 'initialize', kind: 'uups'});

    await fkt.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await fkt.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await fkt.balanceOf(owner.address);
      expect(await fkt.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await fkt.transfer(addr1.address, 50);
      const addr1Balance = await fkt.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      await fkt.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await fkt.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      const initialOwnerBalance = await fkt.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner (10000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(fkt.connect(addr1).transfer(owner.address, 1)).to.be.revertedWith("Not enough tokens");

      // Owner balance shouldn't have changed.
      expect(await fkt.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await fkt.balanceOf(owner.address);

      // Transfer 100 tokens from owner to addr1.
      await fkt.transfer(addr1.address, 100);

      // Transfer 50 tokens from addr1 to addr2.
      await fkt.connect(addr1).transfer(addr2.address, 50);

      // Check balances.
      const finalOwnerBalance = await fkt.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - 100);

      const addr1Balance = await fkt.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      const addr2Balance = await fkt.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
  });
});
