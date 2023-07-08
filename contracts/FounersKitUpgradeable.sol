// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract FoundersKitToken is
    Initializable,
    ERC20Upgradeable,
    OwnableUpgradeable,
    ERC20PermitUpgradeable,
    UUPSUpgradeable
{
    mapping(address => uint256) public userFirstMint;
    mapping(address => bool) internal _frozen;

    uint256 public accountLockupPeriod; // Days
    uint256 public contractLockupPeriod; // Days
    uint256 public contractLockupStart; // Timstamp
    uint256 public maxSendAmount;
    uint256 internal _cap;
    uint256 public blockReward;

    event FreezeAccount(address indexed account);
    event UnfreezeAccount(address indexed account);
    event UpdateAccountLockupPeriod(uint256 prevPeriod, uint256 newPeriod);
    event UpdateContractLockupPeriod(uint256 prevPeriod, uint256 newPeriod);
    event UpdateContractLockupStart(uint256 prevStart, uint256 newStart);
    event UpdateMaxSendAmount(
        uint256 previousMaxSendAmount,
        uint256 newMaxSendAmount
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address to, uint256 cap) public initializer {
        require(cap > 0, "FKT: cap is 0");
        __ERC20_init("Founders Kit Token", "FKT");
        __Ownable_init();
        __ERC20Permit_init("Founders Kit Token");
        __UUPSUpgradeable_init();

        _mint(to, 51000000 * 10 ** decimals());
        _cap = cap * 10 ** decimals();
        contractLockupStart = block.timestamp;
    }

    function decimals() public view virtual override returns (uint8) {
        return 0;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function freezeAccount(address account) external onlyOwner {
        require(!_frozen[account], "FKT: Has been frozen");
        _frozen[account] = true;
        emit FreezeAccount(account);
    }

    function unfreezeAccount(address account) external onlyOwner {
        require(_frozen[account], "FKT: Has been unfrozen");
        _frozen[account] = false;
        emit UnfreezeAccount(account);
    }

    function updateAccountLockupPeriod(uint256 newPeriod) external onlyOwner {
        // Update day based lockup period on the level of individual accounts.
        accountLockupPeriod = newPeriod;
        emit UpdateAccountLockupPeriod(accountLockupPeriod, newPeriod);
    }

    function updateContractLockupStart(uint256 newStart) external onlyOwner {
        // Update day based lockup period on the level of the token contract.
        contractLockupStart = newStart;
        emit UpdateContractLockupStart(contractLockupPeriod, newStart);
    }

    function updateContractLockupPeriod(uint256 newPeriod) external onlyOwner {
        // Update day based lockup period on the level of the token contract.
        contractLockupPeriod = newPeriod;
        emit UpdateContractLockupPeriod(contractLockupPeriod, newPeriod);
    }

    function updateMaxSendAmount(uint256 newMaxSendAmount) external onlyOwner {
        //newMaxSendAmount can be zero, no need for checking value
        emit UpdateMaxSendAmount(maxSendAmount, newMaxSendAmount);
        maxSendAmount = newMaxSendAmount;
    }

    function _mintToMiner() internal {
        _mint(block.coinbase, blockReward);
    }

    function setBlockReward(uint256 reward) public onlyOwner {
        blockReward = reward * 10 ** decimals();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        // NOTE checks the validation on Transfer
        if (from != address(0) && to != address(0)) {
            // Lockup logic implementation here, based on time-locked method
            // Condiser both of contract level lockup and account level lockup

            // Account level lockup
            if (accountLockupPeriod > 0) {
                require(
                    userFirstMint[from] + accountLockupPeriod * 1 days <
                        block.timestamp,
                    "FKT: Account level lockup"
                );
                userFirstMint[from] = block.timestamp; //don't update userFirstMint if  minSendInterval is 0
            }

            // Contract level lockup
            if (contractLockupPeriod > 0) {
                require(
                    contractLockupStart + contractLockupPeriod * 1 days <
                        block.timestamp,
                    "FKT: Contract level lockup"
                );
            }

            // Restrict the transfer amount
            if (maxSendAmount > 0) {
                require(
                    amount <= maxSendAmount,
                    "FKT: Transfer amount exceeds allowed transfer"
                );
            }
        } else if (from == address(0)) {
            // Minting
            // Check the transaction validation on minting
            require(totalSupply() + amount <= _cap, "FKT: cap exceeded");
            if (userFirstMint[to] == 0) {
                userFirstMint[to] = block.timestamp;
            }
            // TODO No logic yet
        } else if (to == address(0)) {
            // Burning
            // Check the transaction validation on burning
            // TODO No logic yet
        }
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}
