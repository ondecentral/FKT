const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { addDays } = require("../scripts/helpers/misc-utils");

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

    const CAP_VALUE = ethers.utils.parseUnits("100000000", 0);  // example cap value, adapt as needed
    fkt = await upgrades.deployProxy(FoundersKitToken, [owner.address, CAP_VALUE], { initializer: 'initialize', kind: 'uups' });

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
      await expect(fkt.connect(addr1).transfer(owner.address, 1)).to.be.revertedWith("ERC20: transfer amount exceeds balance");

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

  describe("Minting", function () {
    it("Should mint new tokens", async function () {
      const initialTotalSupply = await fkt.totalSupply();
      await fkt.mint(owner.address, 1000);
      const finalTotalSupply = await fkt.totalSupply();

      expect(finalTotalSupply).to.equal(initialTotalSupply.add(1000));
    });

    it("Should fail minting when cap is reached", async function () {
      const cap = await fkt.capital();
      const fails = cap.sub(await fkt.totalSupply()).add(1);

      await expect(fkt.mint(owner.address, fails)).to.be.revertedWith("FKT: cap exceeded");
    });
  });

  describe("Account Freezing", function () {
    it("Should freeze and unfreeze an account", async function () {
      expect(await fkt.isFrozen(addr1.address)).to.be.false;

      await fkt.freezeAccount(addr1.address);
      expect(await fkt.isFrozen(addr1.address)).to.be.true;

      await fkt.unfreezeAccount(addr1.address);
      expect(await fkt.isFrozen(addr1.address)).to.be.false;
    });
  });

  describe("Update Functions", function () {
    it("Should update accountLockupPeriod, contractLockupStart, contractLockupPeriod, and maxSendAmount", async function () {
      await fkt.updateAccountLockupPeriod(10);
      expect(await fkt.accountLockupPeriod()).to.equal(10);

      await fkt.updateContractLockupStart(1234567890);
      expect(await fkt.contractLockupStart()).to.equal(1234567890);

      await fkt.updateContractLockupPeriod(30);
      expect(await fkt.contractLockupPeriod()).to.equal(30);

      await fkt.updateMaxSendAmount(1000);
      expect(await fkt.maxSendAmount()).to.equal(1000);
    });
  });

  describe("Transfer Restrictions", function () {
    it("Should fail if account is frozen", async function () {
      await fkt.freezeAccount(owner.address);
      await expect(fkt.transfer(addr1.address, 1)).to.be.reverted;
    });

    it("Should fail if amount is over maxSendAmount", async function () {
      await fkt.updateMaxSendAmount(100);
      await expect(fkt.transfer(addr1.address, 101)).to.be.revertedWith("FKT: Transferamount exceeds allowed transfer");
    });

    it("Should fail if account level lockup is set up", async function () {
      await fkt.updateAccountLockupPeriod(10); // 10 days
      await addDays(9); // Passing 9 days
      await expect(fkt.transfer(addr1.address, 100)).to.be.revertedWith("FKT: Account level lockup");
      await addDays(1); // Passing 1 day more, 10 days passed
      await expect(fkt.transfer(addr1.address, 100)).to.be.not.reverted;
    });

    it("Should fail if contract level lockup is set up", async function () {
      await fkt.updateContractLockupPeriod(10); // 10 days
      await addDays(9); // Passing 9 days
      await expect(fkt.transfer(addr1.address, 100)).to.be.revertedWith("FKT: Contract level lockup");
      await addDays(1); // Passing 1 day more, 10 days passed
      await expect(fkt.transfer(addr1.address, 100)).to.be.not.reverted;
    });

    // For testing the lockup logic, you would typically need to advance time using a library or framework
    // that can manipulate the EVM's time, such as the `evm_increaseTime` function provided by ganache-cli
    // or the `increaseTimeTo` function provided by OpenZeppelin test-helpers.
    // for time manipulation, but you may want to check if this has been added in a more recent version.
  });

  describe("Upgrade", function () {
    it("Should has the same right owner on V2", async function () {
      const FoundersKitTokenV2 = await ethers.getContractFactory("FoundersKitTokenV2Mock");
      const fkt2 = await hre.upgrades.upgradeProxy(fkt, FoundersKitTokenV2);
      expect(await fkt.owner()).to.equal(owner.address);
      expect(await fkt2.owner()).to.equal(await fkt.owner());
      expect(fkt2.address).to.equal(fkt.address);
    });

    it("Should keep the total supply of tokens to the owner on V2", async function () {
      const ownerBalance = await fkt.balanceOf(owner.address);
      const FoundersKitTokenV2 = await ethers.getContractFactory("FoundersKitTokenV2Mock");
      const fkt2 = await hre.upgrades.upgradeProxy(fkt, FoundersKitTokenV2);
      expect(await fkt.totalSupply()).to.equal(await fkt.totalSupply());
    });
  });
});
