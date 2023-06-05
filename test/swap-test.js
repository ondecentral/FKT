const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FKToken", function() {
	const TOKEN_CAP= 100000000;
	const TOKEN_BLOCK_REWARD = 500;
	let owner;
	let FKToken;
	let fkToken;
	let LuciaToken;
	let luciToken;

	beforeEach(async function() {
		[owner, addr1] = await ethers.getSigners();
		FKToken = await ethers.getContractFactory("FKToken");
		fkToken = await FKToken.deploy(100000000,TOKEN_BLOCK_REWARD);

		LuciaToken = await ethers.getContractFactory("LuciaToken");
		luciToken = await LuciaToken.deploy(100000000,TOKEN_BLOCK_REWARD)
		await fkToken.deployed();
		await luciToken.deployed();
	})

	it("Shold create 2 new token contracts for FKT and LUCI", async function () {
		expect(await fkToken.name()).to.equal("FKToken");
		expect(await fkToken.symbol()).to.equal("FKT");
		expect(await fkToken.owner()).to.equal(owner.address);
		await luciToken.transfer(addr1.address,50000000)
		expect(await luciToken.balanceOf(addr1.address)).to.equal(50000000)

		
	})

})
