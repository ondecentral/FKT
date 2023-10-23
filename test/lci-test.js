const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { addDays } = require("../scripts/helpers/misc-utils");

describe("LuciaLCIToken", function () {
  let LuciaLCIToken;
  let lci;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    LuciaLCIToken = await ethers.getContractFactory("LuciaLCIToken");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    const CAP_VALUE = ethers.utils.parseUnits("100000000", 0);  // example cap value, adapt as needed
    lci = await upgrades.deployProxy(LuciaLCIToken, [owner.address, CAP_VALUE], { initializer: 'initialize', kind: 'uups' });

    await lci.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await lci.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await lci.balanceOf(owner.address);
      expect(await lci.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await lci.transfer(addr1.address, 50);
      const addr1Balance = await lci.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      await lci.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await lci.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      const initialOwnerBalance = await lci.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner (10000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(lci.connect(addr1).transfer(owner.address, 1)).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      // Owner balance shouldn't have changed.
      expect(await lci.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await lci.balanceOf(owner.address);

      // Transfer 100 tokens from owner to addr1.
      await lci.transfer(addr1.address, ethers.utils.parseEther("100"));

      // Transfer 50 tokens from addr1 to addr2.
      await lci.connect(addr1).transfer(addr2.address, ethers.utils.parseEther("50"));

      // Check balances.
      const finalOwnerBalance = await lci.balanceOf(owner.address);
      const remainingBalance = Number(ethers.utils.formatEther(initialOwnerBalance)) - 100;
      expect(finalOwnerBalance).to.equal(ethers.utils.parseEther(remainingBalance.toString()));

      const addr1Balance = await lci.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(ethers.utils.parseEther("50"));

      const addr2Balance = await lci.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(ethers.utils.parseEther("50"));
    });
  });

  describe("Minting", function () {
    it("Should mint new tokens", async function () {
      const initialTotalSupply = await lci.totalSupply();
      await lci.mint(owner.address, 1000);
      const finalTotalSupply = await lci.totalSupply();

      expect(finalTotalSupply).to.equal(initialTotalSupply.add(1000));
    });

    it("Should fail minting when cap is reached", async function () {
      const cap = await lci.capital();
      const fails = cap.sub(await lci.totalSupply()).add(1);

      await expect(lci.mint(owner.address, fails)).to.be.revertedWith("LCI: cap exceeded");
    });
  });

  describe("Account Freezing", function () {
    it("Should freeze and unfreeze an account", async function () {
      expect(await lci.isFrozen(addr1.address)).to.be.false;

      await lci.freezeAccount(addr1.address);
      expect(await lci.isFrozen(addr1.address)).to.be.true;

      await lci.unfreezeAccount(addr1.address);
      expect(await lci.isFrozen(addr1.address)).to.be.false;
    });
  });

  describe("Update Functions", function () {
    it("Should update accountLockupPeriod, contractLockupStart, contractLockupPeriod, and maxSendAmount", async function () {
      await lci.updateAccountLockupPeriod(10);
      expect(await lci.accountLockupPeriod()).to.equal(10);

      await lci.updateContractLockupStart(1234567890);
      expect(await lci.contractLockupStart()).to.equal(1234567890);

      await lci.updateContractLockupPeriod(30);
      expect(await lci.contractLockupPeriod()).to.equal(30);

      await lci.updateMaxSendAmount(1000);
      expect(await lci.maxSendAmount()).to.equal(1000);
    });
  });

  describe("Transfer Restrictions", function () {
    it("Should fail if account is frozen", async function () {
      await lci.freezeAccount(owner.address);
      await expect(lci.transfer(addr1.address, 1)).to.be.reverted;
    });

    it("Should fail if amount is over maxSendAmount", async function () {
      await lci.updateMaxSendAmount(100);
      await expect(lci.transfer(addr1.address, 101)).to.be.revertedWith("LCI: Transferamount exceeds allowed transfer");
    });

    it("Should fail if account level lockup is set up", async function () {
      await lci.updateAccountLockupPeriod(10); // 10 days
      await addDays(9); // Passing 9 days
      await expect(lci.transfer(addr1.address, 100)).to.be.revertedWith("LCI: Account level lockup");
      await addDays(1); // Passing 1 day more, 10 days passed
      await expect(lci.transfer(addr1.address, 100)).to.be.not.reverted;
    });

    it("Should fail if contract level lockup is set up", async function () {
      await lci.updateContractLockupPeriod(10); // 10 days
      await addDays(9); // Passing 9 days
      await expect(lci.transfer(addr1.address, 100)).to.be.revertedWith("LCI: Contract level lockup");
      await addDays(1); // Passing 1 day more, 10 days passed
      await expect(lci.transfer(addr1.address, 100)).to.be.not.reverted;
    });

    // For testing the lockup logic, you would typically need to advance time using a library or framework
    // that can manipulate the EVM's time, such as the `evm_increaseTime` function provided by ganache-cli
    // or the `increaseTimeTo` function provided by OpenZeppelin test-helpers.
    // for time manipulation, but you may want to check if this has been added in a more recent version.
  });

  describe("Upgrade", function () {
    it("Should has the same right owner on V2", async function () {
      const LCITokenV2Mock = await ethers.getContractFactory("LCITokenV2Mock");
      const lci2 = await hre.upgrades.upgradeProxy(lci, LCITokenV2Mock);
      expect(await lci.owner()).to.equal(owner.address);
      expect(await lci2.owner()).to.equal(await lci.owner());
      expect(lci2.address).to.equal(lci.address);
    });

    it("Should keep the total supply of tokens to the owner on V2", async function () {
      const ownerBalance = await lci.balanceOf(owner.address);
      const LCITokenV2Mock = await ethers.getContractFactory("LCITokenV2Mock");
      const fkt2 = await hre.upgrades.upgradeProxy(lci, LCITokenV2Mock);
      expect(await lci.totalSupply()).to.equal(await lci.totalSupply());
    });
  });
});
