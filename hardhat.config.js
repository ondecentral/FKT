/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-waffle");
// require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

require("hardhat-contract-sizer");
require("hardhat-gas-reporter");
require("dotenv").config();
// hardhat.config.js
require('@openzeppelin/hardhat-upgrades');

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      blockGasLimit: 352450000,
      allowUnlimitedContractSize: true
    },
    goerli: {
      url: process.env.GOERLI_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
    mumbai: {
      url: process.env.MUMBAI_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      goerli: process.env.ETHERSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
    },
  },
};
