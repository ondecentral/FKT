// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  let [owner, addr1, addr2] = await ethers.getSigners();
  console.log("[owner, addr1, addr2]: ",[owner, addr1, addr2]);
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const unlockTime = currentTimestampInSeconds + 60;

  const lockedAmount = hre.ethers.utils.parseEther("0.001");
  const Lock = await hre.ethers.getContractFactory("Lock");
  const lock = await Lock.deploy(unlockTime, { value: lockedAmount });
  await lock.deployed();

  const TOKEN_CAP= 100000000;
  const TOKEN_BLOCK_REWARD = 500;
  const FKToken = await hre.ethers.getContractFactory("FKToken");
  const fkToken = await FKToken.deploy(TOKEN_CAP,TOKEN_BLOCK_REWARD)
  await fkToken.deployed();

  const LuciaToken = await hre.ethers.getContractFactory("LuciaToken");
  const luciToken = await LuciaToken.deploy(TOKEN_CAP,TOKEN_BLOCK_REWARD);
  await luciToken.deployed();

  let TokenSwap = await ethers.getContractFactory("TokenSwap");
  let tokenSwap = await TokenSwap.deploy(
    fkToken.address,
    addr1.address,
    22200000000000, 
    luciToken.address,
    addr2.address,
    11100000000000  
  );
  await tokenSwap.deployed();

  console.log(
    `Lock with ${ethers.utils.formatEther(
      lockedAmount
    )}ETH and unlock timestamp ${unlockTime} deployed to ${lock.address}`
  );
  console.log(`FKToken deployed to ${fkToken.address}`);
  console.log(`LuciaToken deployed to ${luciToken.address}`);
  

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });


