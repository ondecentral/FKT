require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

const ALCHEMY_API_KEY = process.env.ALCH_API_KEY_SEPOLIA;
const SEPOLIA_PRIVATE_KEY_01 = process.env.MAINNET_AND_SEPOLIA_PRIVATE_KEY_01;
const SEPOLIA_PRIVATE_KEY_02 = process.env.MAINNET_AND_SEPOLIA_PRIVATE_KEY_02;
const SEPOLIA_PRIVATE_KEY_03 = process.env.MAINNET_AND_SEPOLIA_PRIVATE_KEY_03;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY_01,SEPOLIA_PRIVATE_KEY_02,SEPOLIA_PRIVATE_KEY_03]
    }
  }
};
