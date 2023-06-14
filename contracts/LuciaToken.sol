pragma solidity ^0.8.17;

import "./ERC20.sol";
import "./extensions/ERC20Capped.sol";
import 'hardhat/console.sol';

/* backlink: https://www.youtube.com/watch?v=gc7e90MHvl8 */ 
contract LuciaToken is ERC20Capped {
	address payable public owner;
	uint256 public blockReward;

	constructor(uint256 cap, uint256 reward) ERC20("LuciaToken","LUCI") ERC20Capped(cap * (10 ** decimals())) {
		owner = payable(msg.sender); // ensures owner is receiving payable address - need audit
		_mint(owner, 52000000 * (10 ** decimals())); //give tokens to caller of constructor
		blockReward = reward * (10 ** decimals()); ///The decimals() function should return the fungibility of the token in the number of decimals. For example, 18 means to divide the token amount by 1018 to get its whole value. The decimals() function is defined in the contract as follows or using the public state variable:
	}

	function _mintMinderReward() internal { // internal means can't be called from outside the contract
		_mint(block.coinbase, blockReward);
	}

	function setBlockReward(uint256 reward) public onlyOwner {
		blockReward = reward * (10 ** decimals());
	}

	modifier onlyOwner {
		require(msg.sender == owner, "Only the owner can call this function");
		_; // means rest of the function
	}
}