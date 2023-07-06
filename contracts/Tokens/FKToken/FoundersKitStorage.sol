// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../../utils/Ownable.sol";
import "../../interfaces/IERC20.sol";

abstract contract FoundersKitStorage is Ownable {
    // keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
    bytes32 public constant PERMIT_TYPEHASH =
        0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9;

    mapping(address => uint256) internal _balances;
    mapping(address => mapping(address => uint256)) internal _allowances;
    mapping(address => bool) internal _frozen;

    uint256 internal _totalSupply;
    string internal _name = "Founders Kit Token";
    string internal _symbol = "FKT";
    uint8 internal _decimals = 18;

    uint public minSendInterval;
    uint public maxSendAmount;
    mapping(address => uint) public userLastTransfer;

    mapping(address => uint) public nonces;
    uint256 internal _cap;
    uint256 public blockReward;

    event FreezeAccount(address indexed account);
    event UnfreezeAccount(address indexed account);
    event UpdateMinSendInterval(
        uint indexed previousMinSendInterval,
        uint indexed newMinSendInterval
    );
    event UpdateMaxSendAmount(
        uint indexed previousMaxSendAmount,
        uint indexed newMaxSendAmount
    );

    constructor(address _owner) Ownable(_owner) {}
}
