// scripts/deploy.js

const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const FoundersKitToken = await hre.ethers.getContractFactory("FoundersKitToken");
    
    // Replace with your cap value and owner address
    const CAP_VALUE = 500000000;
    const OWNER_ADDRESS = "YOUR_OWNER_ADDRESS";
    
    console.log("Deploying FoundersKitToken...");
    const fkt = await hre.upgrades.deployProxy(FoundersKitToken, [OWNER_ADDRESS, CAP_VALUE], { initializer: 'initialize' });

    await fkt.deployed();
    console.log("FoundersKitToken deployed to:", fkt.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
