const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FKToken", function() {
	const TOKEN_CAP= 100000000000000;
	const TOKEN_BLOCK_REWARD = 500;
	let owner;
	let addr1;
	let FKToken;
	let fkToken;
	let LuciaToken;
	let luciToken;
	let TokenSwap;
	
	beforeEach(async function() {
		[owner, addr1] = await ethers.getSigners();
		FKToken = await ethers.getContractFactory("FKToken");
		fkToken = await FKToken.deploy(TOKEN_CAP,TOKEN_BLOCK_REWARD);

		LuciaToken = await ethers.getContractFactory("LuciaToken");
		luciToken = await LuciaToken.deploy(TOKEN_CAP,TOKEN_BLOCK_REWARD)
		await fkToken.deployed();
		await luciToken.deployed();
	})

	it("Should create 2 new token contracts for FKT and LUCI", async function () {
		expect(await fkToken.name()).to.equal("FKToken");
		expect(await fkToken.symbol()).to.equal("FKT");
		expect(await fkToken.owner()).to.equal(owner.address);
		await luciToken.transfer(addr1.address,50000000)
		expect(await luciToken.balanceOf(addr1.address)).to.equal(50000000)
		expect(await luciToken.owner()).to.equal(owner.address);
	})
	
	it("Should approve transactions and see in allownace", async function () {
		[owner, addr1, addr2] = await ethers.getSigners();
		await luciToken.transfer(addr1.address,50000000)
		TokenSwap = await ethers.getContractFactory("TokenSwap");
		tokenSwap = await TokenSwap.deploy(
			fkToken.address,
			addr1.address,
			22200000000000, 
			luciToken.address,
			addr2.address,
			11100000000000  
		);
		await tokenSwap.deployed()


		await fkToken.transfer(addr1.address,22200000000000)
		await luciToken.transfer(addr2.address,11100000000000)
		expect(await fkToken.balanceOf(addr1.address)).to.equal(22200000000000)
		expect(await luciToken.balanceOf(addr2.address)).to.equal(11100000000000)

		await fkToken.connect(addr1).approve(tokenSwap.address, 22200000000000);
		await luciToken.connect(addr2).approve(tokenSwap.address, 11100000000000);
		let allowedTokensSCFKT = await fkToken.allowance(addr1.address, tokenSwap.address);
		let allowedTokensSCLuci = await luciToken.allowance(addr2.address, tokenSwap.address);
		expect(ethers.utils.formatEther(allowedTokensSCFKT)).to.equal('0.0000222');
		expect(ethers.utils.formatEther(allowedTokensSCLuci)).to.equal('0.0000111');

		// anyone can call the swap function
		await tokenSwap.connect(addr2).swap()

		expect(await fkToken.balanceOf(addr2.address)).to.equal(22200000000000);
		expect(await luciToken.balanceOf(addr1.address)).to.equal(11100050000000);
		expect(await fkToken.balanceOf(addr1.address)).to.equal(0)
		expect(await luciToken.balanceOf(addr2.address)).to.equal(0)		

	})

	it("Should get hard coded price of eth", async function () {
		[owner, addr1, addr2] = await ethers.getSigners();
		await luciToken.transfer(addr1.address,50000000)
		TokenSwap = await ethers.getContractFactory("TokenSwap");
		tokenSwap = await TokenSwap.deploy(
			fkToken.address,
			addr1.address,
			22200000000000, 
			luciToken.address,
			addr2.address,
			11100000000000  
		);
		await tokenSwap.deployed()

		expect(await tokenSwap.getPrice("ETH/USD")).to.equal(1648);
		expect(await tokenSwap.getPrice("AVAX/USD")).to.equal(11);
		expect(await tokenSwap.getPrice("DAI/USD")).to.equal(1);
		expect(await tokenSwap.getPrice("UNI/USD")).to.equal(4);
	})

	it('should get converted amount of stablecoin when deposits an amount of eth', async function (){
		[owner, addr1, addr2] = await ethers.getSigners();
		await luciToken.transfer(addr1.address,50000000)
		TokenSwap = await ethers.getContractFactory("TokenSwap");
		tokenSwap = await TokenSwap.deploy(
			fkToken.address,
			addr1.address,
			22200000000000, 
			luciToken.address,
			addr2.address,
			11100000000000  
		);
		await tokenSwap.deployed()
		// console.log("fkToken.address: ",fkToken.address);
		tokenSwap.connect(owner).deposit(fkToken.address)

	})

})
