// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;

import "../../interfaces/IERC20.sol";
import "../../interfaces/IERC20Permit.sol";
import "../../utils/Ownable.sol";
import "./FoundersKitStorage.sol";

contract FoundersKit is FoundersKitStorage, IERC20, IERC20Permit {
    address public target;

    constructor() FoundersKitStorage(address(0x1)) {}

    receive() external payable {
        require(false, "FKT: Receive not allowed");
    }

    fallback() external {
        require(false, "FKT: Fallback not allowed");
    }

    function initialize(
        address receiver,
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 cap_
    ) external onlyOwner {
        require(_totalSupply == 0, "FKT: Already initialized");
        require(cap_ > 0, "FKT: cap is 0");
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
        _mint(receiver, 51000000 * (10 ** decimals_));
        _cap = cap_ * (10 ** _decimals);
    }

    function DOMAIN_SEPARATOR() public view returns (bytes32) {
        uint chainId;
        assembly {
            chainId := chainid()
        }
        return
            keccak256(
                abi.encode(
                    keccak256(
                        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                    ),
                    keccak256(bytes(_name)),
                    keccak256(bytes("1")),
                    chainId,
                    address(this)
                )
            );
    }

    function name() external view override returns (string memory) {
        return _name;
    }

    function symbol() external view override returns (string memory) {
        return _symbol;
    }

    function decimals() external view override returns (uint8) {
        return _decimals;
    }

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(
        address account
    ) external view override returns (uint256) {
        return _balances[account];
    }

    function isFrozen(address account) public view returns (bool) {
        return _frozen[account];
    }

    function transfer(
        address recipient,
        uint256 amount
    ) external override returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function allowance(
        address owner,
        address spender
    ) public view override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(
        address spender,
        uint256 amount
    ) external override returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external override returns (bool) {
        _transfer(sender, recipient, amount);
        uint allowed = _allowances[sender][msg.sender];
        require(allowed >= amount, "FKT: Transfer amount exceeds allowance");
        if (allowed < type(uint).max) {
            _approve(sender, msg.sender, allowed - amount);
        }
        return true;
    }

    function increaseAllowance(
        address spender,
        uint256 addedValue
    ) external override returns (bool) {
        _approve(
            msg.sender,
            spender,
            _allowances[msg.sender][spender] + addedValue
        );
        return true;
    }

    function decreaseAllowance(
        address spender,
        uint256 subtractedValue
    ) external override returns (bool) {
        _approve(
            msg.sender,
            spender,
            _allowances[msg.sender][spender] - subtractedValue
        );
        return true;
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function burnFrom(address account, uint256 amount) external {
        uint256 currentAllowance = allowance(account, msg.sender);
        require(
            currentAllowance >= amount,
            "FKT: Burn amount exceeds allowance"
        );
        unchecked {
            _approve(account, msg.sender, currentAllowance - amount);
        }
        _burn(account, amount);
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal {
        require(sender != address(0), "FKT: Transfer from the zero address");
        require(recipient != address(0), "FKT: Transfer to the zero address");
        require(!isFrozen(sender), "FKT: Sender's account is frozen");
        require(!isFrozen(recipient), "FKT: Recipient's account is frozen");
        require(_balances[sender] >= amount, "FKT: Transfer exceeds balance");

        if (maxSendAmount > 0) {
            require(
                amount <= maxSendAmount,
                "FKT: Transfer amount exceeds allowed transfer"
            );
        }

        if (minSendInterval > 0) {
            require(
                userLastTransfer[sender] + minSendInterval >= block.timestamp,
                "FKT: Allowed transfer interval hasn't passed yet"
            );
            userLastTransfer[sender] = block.timestamp; //don't update userLastTransfer if  minSendInterval is 0
        }

        unchecked {
            _balances[sender] -= amount;
            _balances[recipient] += amount;
        }
        emit Transfer(sender, recipient, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "FKT: Approve from the zero address");
        require(spender != address(0), "FKT: Approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "FKT: Burn from the zero address");

        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "FKT: Burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - amount;
        }
        _totalSupply -= amount;

        emit Transfer(account, address(0), amount);
    }

    function permit(
        address owner,
        address spender,
        uint value,
        uint deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external override {
        require(deadline >= block.timestamp, "FKT: Expired");
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR(),
                keccak256(
                    abi.encode(
                        PERMIT_TYPEHASH,
                        owner,
                        spender,
                        value,
                        nonces[owner]++,
                        deadline
                    )
                )
            )
        );
        address recoveredAddress = ecrecover(digest, v, r, s);
        require(
            recoveredAddress != address(0) && recoveredAddress == owner,
            "FKT: invalid signature"
        );
        _approve(owner, spender, value);
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

    function updateMinSendInterval(uint newMinSendInterval) external onlyOwner {
        //newMinSendInterval can be zero, no need for checking value
        emit UpdateMinSendInterval(minSendInterval, newMinSendInterval);
        minSendInterval = newMinSendInterval;
    }

    function updateMaxSendAmount(uint newMaxSendAmount) external onlyOwner {
        //newMaxSendAmount can be zero, no need for checking value
        emit UpdateMinSendInterval(maxSendAmount, newMaxSendAmount);
        maxSendAmount = newMaxSendAmount;
    }

    function _mintToMiner() internal {
        _mint(block.coinbase, blockReward);
    }

    function setBlockReward(uint256 reward) public onlyOwner {
        blockReward = reward * (10 ** _decimals);
    }

    /** @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     */
    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        _totalSupply += amount;
        unchecked {
            // Overflow not possible: balance + amount is at most totalSupply + amount, which is checked above.
            _balances[account] += amount;
        }
        emit Transfer(address(0), account, amount);

        _afterTokenTransfer(address(0), account, amount);
    }

    /**
     * @dev Hook that is called before any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
     * will be transferred to `to`.
     * - when `from` is zero, `amount` tokens will be minted for `to`.
     * - when `to` is zero, `amount` of ``from``'s tokens will be burned.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}

    /**
     * @dev Hook that is called after any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
     * has been transferred to `to`.
     * - when `from` is zero, `amount` tokens have been minted for `to`.
     * - when `to` is zero, `amount` of ``from``'s tokens have been burned.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}
}
