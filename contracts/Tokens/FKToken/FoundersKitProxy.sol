// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;

import "./FoundersKitStorage.sol";
import "../../utils/Ownable.sol";
import "../../utils/Address.sol";

contract FoundersKitProxy is FoundersKitStorage {
    address public target;

    constructor(
        address _newOwner,
        address _newTarget
    ) FoundersKitStorage(_newOwner) {
        _setTarget(_newTarget);
    }

    receive() external payable {}

    fallback() external payable {
        // if (gasleft() <= 2300) {
        //     return;
        // }
        address target_ = target;
        bytes memory data = msg.data;
        assembly {
            let result := delegatecall(
                gas(),
                target_,
                add(data, 0x20),
                mload(data),
                0,
                0
            )
            let size := returndatasize()
            let ptr := mload(0x40)
            returndatacopy(ptr, 0, size)
            switch result
            case 0 {
                revert(ptr, size)
            }
            default {
                return(ptr, size)
            }
        }
    }

    function setTarget(address _newTarget) public onlyOwner {
        _setTarget(_newTarget);
    }

    function _setTarget(address _newTarget) internal {
        require(Address.isContract(_newTarget), "target not a contract");
        target = _newTarget;
    }
}
