const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FKToken", function() {
	const TOKEN_CAP= 100000000;
	const TOKEN_BLOCK_REWARD = 500;
	let owner;
	let FKToken;
	let fkToken;

	beforeEach(async function() {
		[owner] = await ethers.getSigners();
		FKToken = await ethers.getContractFactory("FKToken");
		fkToken = await FKToken.deploy(100000000,500);

		await fkToken.deployed()
	})

	it("Shold create a new contract", async function () {
		expect(await fkToken.name()).to.equal("FKToken");
		expect(await fkToken.symbol()).to.equal("FKT");
		expect(await fkToken.owner()).to.equal(owner.address);
		
	})

	it("Should set the max capped supply to the argument provided on deploy", async function () {
		let cap = await fkToken.cap();
		expect(Number(ethers.utils.formatEther(cap))).to.equal(TOKEN_CAP)
	})	


	it("Should set the blockReward to the arg provided on deploy", async function () {
		await fkToken.deployed()
		let blockReward = await fkToken.blockReward();
		expect(Number(ethers.utils.formatEther(blockReward))).to.equal(TOKEN_BLOCK_REWARD)
	})	


})

