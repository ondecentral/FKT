const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Greeter", function() {
	it("Shold return the new greeting once it's changed", async function () {
		const Greeter = await ethers.getContractFactory("Greeter");
		const greeter = await Greeter.deploy("Hello,, world");
		await greeter.deployed()

		expect(await greeter.greet()).to.equal("Hello,, world");
		const setGreetingTx = await greeter.setGreeting("Hola, mondo!");

		// wait until the tx is mined
		await setGreetingTx.wait();
		expect(await greeter.greet()).to.equal("Hola, mondo!");
	})
})