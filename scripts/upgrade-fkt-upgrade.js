// scripts/upgrade.js

const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log(
        "Upgrading contracts with the account:",
        deployer.address
    );

    const FoundersKitTokenV2 = await hre.ethers.getContractFactory("FoundersKitTokenV2");
    const fktAddress = "YOUR_EXISTING_CONTRACT_ADDRESS"; // Replace with your existing contract address

    console.log("Upgrading FoundersKitToken...");
    const fkt = await hre.upgrades.upgradeProxy(fktAddress, FoundersKitTokenV2, );

    console.log("FoundersKitToken upgraded at:", fkt.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
