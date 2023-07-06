
// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;

/**
   Open Zeppelin's Ownable contract fork (commit 0db76e9):
   remove using Context, add two step ownership verification
   https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
*/

abstract contract Ownable {
    address internal _owner;
    address internal _newOwner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor (address ownerAddress) {
        require(ownerAddress != address(0), "Ownable: zero address");
        _owner = ownerAddress;
        emit OwnershipTransferred(address(0), ownerAddress);
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    function newOwner() public view virtual returns (address) {
        return _newOwner;
    }

    modifier onlyOwner() {
        require(owner() == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    function renounceOwnership() public virtual onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    function transferOwnership(address transferOwner) public onlyOwner {
        require(transferOwner != newOwner());
        _newOwner = transferOwner;
    }

    function acceptOwnership() virtual public {
        require(msg.sender == newOwner(), "Ownable: caller is not the new owner");
        emit OwnershipTransferred(_owner, _newOwner);
        _owner = _newOwner;
        _newOwner = address(0);
    }
}
