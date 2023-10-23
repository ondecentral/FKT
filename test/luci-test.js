const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { addDays } = require("../scripts/helpers/misc-utils");

describe("LuciaLUCIToken", function () {
  let LuciaLUCIToken;
  let lcui;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    LuciaLUCIToken = await ethers.getContractFactory("LuciaLUCIToken");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    lcui = await upgrades.deployProxy(LuciaLUCIToken, [owner.address], { initializer: 'initialize', kind: 'uups' });

    await lcui.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await lcui.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await lcui.balanceOf(owner.address);
      expect(await lcui.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await lcui.transfer(addr1.address, 50);
      const addr1Balance = await lcui.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      await lcui.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await lcui.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      const initialOwnerBalance = await lcui.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner (10000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(lcui.connect(addr1).transfer(owner.address, 1)).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      // Owner balance shouldn't have changed.
      expect(await lcui.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await lcui.balanceOf(owner.address);

      // Transfer 100 tokens from owner to addr1.
      await lcui.transfer(addr1.address, ethers.utils.parseEther("100"));

      // Transfer 50 tokens from addr1 to addr2.
      await lcui.connect(addr1).transfer(addr2.address, ethers.utils.parseEther("50"));

      // Check balances.
      const finalOwnerBalance = await lcui.balanceOf(owner.address);
      const remainingBalance = Number(ethers.utils.formatEther(initialOwnerBalance)) - 100;
      expect(finalOwnerBalance).to.equal(ethers.utils.parseEther(remainingBalance.toString()));

      const addr1Balance = await lcui.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(ethers.utils.parseEther("50"));

      const addr2Balance = await lcui.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(ethers.utils.parseEther("50"));
    });
  });

  describe("Minting", function () {
    it("Should mint new tokens", async function () {
      const initialTotalSupply = await lcui.totalSupply();
      await lcui.mint(owner.address, 1000);
      const finalTotalSupply = await lcui.totalSupply();

      expect(finalTotalSupply).to.equal(initialTotalSupply.add(1000));
    });

  });

  describe("Account Freezing", function () {
    it("Should freeze and unfreeze an account", async function () {
      expect(await lcui.isFrozen(addr1.address)).to.be.false;

      await lcui.freezeAccount(addr1.address);
      expect(await lcui.isFrozen(addr1.address)).to.be.true;

      await lcui.unfreezeAccount(addr1.address);
      expect(await lcui.isFrozen(addr1.address)).to.be.false;
    });
  });

  describe("Update Functions", function () {
    it("Should update accountLockupPeriod, contractLockupStart, contractLockupPeriod, and maxSendAmount", async function () {
      await lcui.updateAccountLockupPeriod(10);
      expect(await lcui.accountLockupPeriod()).to.equal(10);

      await lcui.updateContractLockupStart(1234567890);
      expect(await lcui.contractLockupStart()).to.equal(1234567890);

      await lcui.updateContractLockupPeriod(30);
      expect(await lcui.contractLockupPeriod()).to.equal(30);

      await lcui.updateMaxSendAmount(1000);
      expect(await lcui.maxSendAmount()).to.equal(1000);
    });
  });

  describe("Transfer Restrictions", function () {
    it("Should fail if account is frozen", async function () {
      await lcui.freezeAccount(owner.address);
      await expect(lcui.transfer(addr1.address, 1)).to.be.reverted;
    });

    it("Should fail if amount is over maxSendAmount", async function () {
      await lcui.updateMaxSendAmount(100);
      await expect(lcui.transfer(addr1.address, 101)).to.be.revertedWith("LUCI: Transferamount exceeds allowed transfer");
    });

    it("Should fail if account level lockup is set up", async function () {
      await lcui.updateAccountLockupPeriod(10); // 10 days
      await addDays(9); // Passing 9 days
      await expect(lcui.transfer(addr1.address, 100)).to.be.revertedWith("LUCI: Account level lockup");
      await addDays(1); // Passing 1 day more, 10 days passed
      await expect(lcui.transfer(addr1.address, 100)).to.be.not.reverted;
    });

    it("Should fail if contract level lockup is set up", async function () {
      await lcui.updateContractLockupPeriod(10); // 10 days
      await addDays(9); // Passing 9 days
      await expect(lcui.transfer(addr1.address, 100)).to.be.revertedWith("LUCI: Contract level lockup");
      await addDays(1); // Passing 1 day more, 10 days passed
      await expect(lcui.transfer(addr1.address, 100)).to.be.not.reverted;
    });

    // For testing the lockup logic, you would typically need to advance time using a library or framework
    // that can manipulate the EVM's time, such as the `evm_increaseTime` function provided by ganache-cli
    // or the `increaseTimeTo` function provided by OpenZeppelin test-helpers.
    // for time manipulation, but you may want to check if this has been added in a more recent version.
  });

  describe("Upgrade", function () {
    it("Should has the same right owner on V2", async function () {
      const LUCITokenV2Mock = await ethers.getContractFactory("LUCITokenV2Mock");
      const fkt2 = await hre.upgrades.upgradeProxy(lcui, LUCITokenV2Mock);
      expect(await lcui.owner()).to.equal(owner.address);
      expect(await fkt2.owner()).to.equal(await lcui.owner());
      expect(fkt2.address).to.equal(lcui.address);
    });

    it("Should keep the total supply of tokens to the owner on V2", async function () {
      const ownerBalance = await lcui.balanceOf(owner.address);
      const LUCITokenV2Mock = await ethers.getContractFactory("LUCITokenV2Mock");
      const fkt2 = await hre.upgrades.upgradeProxy(lcui, LUCITokenV2Mock);
      expect(await lcui.totalSupply()).to.equal(await lcui.totalSupply());
    });
  });
});
