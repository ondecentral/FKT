// import { ethers } from "hardhat";
const { ethers } = require("hardhat")
const { deployContract, getContract } = require('./helper');
const { eContractid } = require('../scripts/helpers/type');

const deployFKT = async () => {
    const [owner] = await ethers.getSigners();
    const contractFactory = await ethers.getContractFactory(eContractid.FKT);
    const contract = await deployContract(eContractid.FKT, []);
    const proxy = await deployContract(eContractid.FKTProxy, [owner.address, contract.address]);
    const contractConnected = contractFactory.attach(proxy.address);

    await contractConnected.initialize(
        owner.address,
        "Founders Kit Token",
        "FKT",
        0,
        10000
    );
    return [proxy, contractConnected];
};
const upgradeFKT = async (proxy, upgraded) => {
    const [owner] = await ethers.getSigners();
    await proxy.setTarget
    const contractConnected = contractFactory.attach(proxy.address);

    await contractConnected.initialize(
        owner.address,
        "Founders Kit Token",
        "FKT",
        0,
        10000
    );
};

module.exports = {
    deployFKT,
    upgradeFKT
};
