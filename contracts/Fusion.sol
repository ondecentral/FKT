// check trademarks
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./LuciaToken.sol";

contract Fusion {

	event Deposit(
        address indexed _reserve,
        address indexed _user,
        uint256 _amount,
        uint256 _timestamp
    );

	/**
    * @dev deposits The underlying asset into the reserve. A corresponding amount of the overlying asset (luciTokens)
    * is minted.
    * @param _reserve the address of the reserve
    */
	function deposit(address _reserve, uint256 _amount)
        external
        payable
        nonReentrant
    {
    	

    }
}