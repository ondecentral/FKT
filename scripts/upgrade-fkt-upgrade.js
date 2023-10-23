// scripts/upgrade.js

const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log(
        "Upgrading contracts with the account:",
        deployer.address
    );

    const LCITokenV2Mock = await hre.ethers.getContractFactory("LCITokenV2Mock");
    const fktAddress = "YOUR_EXISTING_CONTRACT_ADDRESS"; // Replace with your existing contract address

    console.log("Upgrading FoundersKitToken...");
    const fkt = await hre.upgrades.upgradeProxy(fktAddress, LCITokenV2Mock);

    console.log("FoundersKitToken upgraded at:", fkt.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
