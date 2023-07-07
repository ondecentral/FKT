
const { ethers } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const PRICE_PRECISION = 100_000_000;

const WHALE_ACCOUNT = "0x5E583B6a1686f7Bc09A6bBa66E852A7C80d36F00";

const impersonatedSginer = async (address) => {
    await helpers.setBalance(address, 100n ** 18n);
    await helpers.impersonateAccount(address);
    const signer = await ethers.getSigner(address);
    return signer;
}
const getFirstSigner = async () => (await getEthersSigners())[0];

const getEthersSigners = async () => {
    const ethersSigners = await Promise.all(await ethers.getSigners());
    return ethersSigners;
};
const parse = (amount, dec) => {
    return ethers.utils.parseUnits(amount.toString(), dec);
};

const deployContract = async (contractName, args, signer = null) => {
    const contract = (await (await ethers.getContractFactory(contractName))
        .connect(signer == null ? await getFirstSigner() : signer)
        .deploy(...args));
    await contract.deployed();
    return contract;
};

const getContract = async (contractName, address) => {
    return await ethers.getContractAt(contractName, address);
}

module.exports = {
    WETH,
    DAI,
    USDC,
    PRICE_PRECISION,
    WHALE_ACCOUNT,
    parse,
    deployContract,
    getContract,
    impersonatedSginer
}
