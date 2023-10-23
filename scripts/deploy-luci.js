// scripts/deploy.js

const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const LuciaLUCIToken = await hre.ethers.getContractFactory("LuciaLUCIToken");
    
    const OWNER_ADDRESS = deployer.address;
    
    console.log("Deploying LuciaToken...");
    const args = [OWNER_ADDRESS];
    const luci = await hre.upgrades.deployProxy(LuciaLUCIToken, args, {initializer: 'initialize', kind: 'uups'});

    await luci.deployed();
    console.log("LuciaToken deployed to:", luci.address);
    try {
        await run("verify:verify", {
            address: luci.address,
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
