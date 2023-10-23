// scripts/deploy.js

const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const LuciaLCIToken = await hre.ethers.getContractFactory("LuciaLCIToken");
    
    // Replace with your cap value and owner address
    const CAP_VALUE = 500000000;
    const OWNER_ADDRESS = deployer.address;
    
    console.log("Deploying LuciaToken...");
    const args = [OWNER_ADDRESS, CAP_VALUE];
    const lci = await hre.upgrades.deployProxy(LuciaLCIToken, args, {initializer: 'initialize', kind: 'uups'});

    await lci.deployed();
    console.log("LuciaToken deployed to:", lci.address);
    try {
        await run("verify:verify", {
            // address: lci.address,
            constructorArguments: [],
        });
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("\t Already verified!");
        } else {
            console.log(e);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
