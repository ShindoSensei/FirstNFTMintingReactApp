# NFT Quotes Minting Frontend app
Mint a quote on the Rinkeby Test Blockchain forever

# Requirements
1) Metamask wallet chrome extension
2) Rinkeby ETH (https://www.geeksforgeeks.org/ethereum-blockchain-getting-free-test-ethers-for-rinkeby-test-network/)

# To get started

1. Run `npm install` at the root of your directory
2. Run `npm start` to start the project
3. Start coding!

# Note 

Whenever solidity contract code is updated, the following 3 steps need to be taken,

1) On the separate Solidity app, redeploy with npx hardhat run scripts/deploy.js --network rinkeby → So that the new smart contract logic is pushed to the blockchain 

2) Update contract address

3) Copy the latest ABI file from solidity app (artifacts folder) to this web app (src/utils/MyEpicNFT.json)

