// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract BondToken is ERC1155 {

    constructor() ERC1155("https://ipfs.io/ipfs/bafkreicvhg7vwvej7dcsiechlooryblc6paiayoe2pnefdkizoa2xfa6uy") {
    }
    
}