# Initial State

Assuming: Git clone into a new development machine



## Installing Hardhat

```zsh
npm i --save-dev hardhat
```

## Using Hardhat in the Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Testing Hardhat 

```zsh
npx hardhat test
```

Try running some of the following tasks:

```shell
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

## Compiling contracts with Hard Hat

First if this is your first time running this, you'll need to install open zep dependencies

```zsh
npm i @openzeppelin/contracts
```

Now you can use import statements like

```js
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
```

Next this line should work

```zsh
npx hardhat compile
```

# Deployment

```zsh
npx hardhat run scripts/deploy.js --network sepolia
```