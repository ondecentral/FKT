pragma solidity ^0.8.17;

import "./ERC20.sol";
import "./extensions/ERC20Capped.sol";
import 'hardhat/console.sol';

/* backlink: https://www.youtube.com/watch?v=gc7e90MHvl8 */ 
contract LUSDT is ERC20Capped {
	address payable public owner;
	constructor(uint256 cap, uint256 reward) ERC20("LUSDToken","LUSDT") ERC20Capped(cap * (10 ** decimals())) {
		owner = payable(msg.sender); 
		_mint(owner, 100000000 * (10 ** decimals())); //give tokens to caller of constructor
	}
	
	modifier onlyOwner {
		require(msg.sender == owner, "Only the owner can call this function");
		_; // means rest of the function
	}
}
