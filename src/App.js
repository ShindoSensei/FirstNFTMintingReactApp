import './styles/App.css';
import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import myEpicNft from './utils/MyEpicNFT.json'; //This is the ABI file that's copy and pasted from the other NFTContract project's artifact directory. This ABI file helps this frontend app to talk to the contract.
require('dotenv').config();
// Constants
const CONTRACT_ADDRESS = process.env.REACT_APP_RINKEBY_CONTRACT_ADDRESS; //Deployed Rinkeby contract address. 
//ENV variables in create react app MUST start with REACT_APP_ https://stackoverflow.com/questions/49108136/importing-env-variable-react-front-end
//****REMEMBER, Everytime deploy new contract, remember to change the contract address here AND ALSO COPY the ABI file from Contract Project into the utils/MyEpicNFT.json file to ensure it is the latest copy of the ABI file!

const App = () => {

  //State variable we use to store our user's public wallet. Don't forget to import useState.
  const [ currentAccount, setCurrentAccount ] = useState("");
  //Make sure this is async
  const checkIfWalletIsConnected = async () => {
    //Check to see if we have access to window.ethereum (https://docs.metamask.io/guide/ethereum-provider.html#table-of-contents)
    const { ethereum } = window;

    if(!ethereum){
      console.log("Make sure you have metamask!");
      return;
    }else{
      console.log("We have the ethereum object", ethereum);
    }

    //Check if we're authorized to access the user's wallet
    const accounts = await ethereum.request({ method: 'eth_accounts'});
    
    //User can have multiple authorized accounts, we grab the first one if its there!
    if(accounts.length !== 0){
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)
      //Setup listener! This is for the case where a user comes to site and ALREADY had their wallet connected + authorized.
      setupEventListener()
    }else{
      console.log("No authorized account found")
    }

  }

  const connectWallet = async() => {
    try {
      const { ethereum } = window;

      if(!ethereum){
        alert("Get MetaMask!");
        return;
      }

      //Fancy method to request access to account
      const accounts = await ethereum.request({ method: "eth_requestAccounts"});

      //This should print out public address once we authorize Metamask.
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      //Setup listener! This is for the case where a user comes to site and connected their wallet for the first time.
      setupEventListener()
    } catch (error) {
      console.log(error)
    }
  }

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        //Now, we're going to setup the event where if the Solidity contract emits "NewEpicNFTMinted" (similar to webhook concept), we will capture it.
        //This event only happens after the actual Minting function in the contract is called and completed. We only emit the NFT minted event here because even though this MyEpicNFT contract may be mined, it does not necessarily mean that the NFT was actually minted (because function makeAnEpicNFT needs to have properly been executed for minting to be complete)
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {

    try {
      const { ethereum } = window;

      if(ethereum) {
        //Now we make sure user is on the correct network (i.e Rinkebey) by checking the chain ID. Note that ChainID is essential to differentiate between the old ETC (before 2016 fork) and new ETH see: https://ethereum.stackexchange.com/questions/37533/what-is-a-chainid-in-ethereum-how-is-it-different-than-networkid-and-how-is-it
        let chainId = await ethereum.request({ method: 'eth_chainId' });
        console.log("Connected to chain " + chainId);

        // String, hex code of the chainId of the Rinkebey test network
        const rinkebyChainId = "0x4"; 
        if (chainId !== rinkebyChainId) {
          //Prevent user from minting app if they are not connected properly to Rinkeby test network.
          alert("You are not connected to the Rinkeby Test Network! Change the network settings on your metamask wallet");
          return;
        }
        const provider = new ethers.providers.Web3Provider(ethereum); //ethers is a library that helps our frontend talk to our contract. 
        //A "Provider" is what we use to actually talk to Ethereum nodes. Remember how we were using Alchemy to deploy in the epic-nfts project? Well in this case we use nodes that Metamask provides in the background to send/receive data from our deployed contract.
        const signer = provider.getSigner(); // https://docs.ethers.io/v5/api/signer/#signers - A Signer in ethers is an abstraction of an Ethereum Account, which can be used to sign messages and transactions and send signed transactions to the Ethereum Network to execute state changing operations.
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer); //This line creates connection to the NFTcontract. It needs contract address, abi file and signer - 3 things always required to communicate with contracts on blockchain.
        //Everytime we compile smart contract, compiler spits out bunch of files needed to interact with contract which are found in the artifacts folder.
        //abi file is something that helps frontend talk to contract that's deployed on the blockchain. ABI file can be found in the NFTContract project in artifacts/contracts/MyEpicNFT.sol/MyEpicNFT.json -> Make sure to copy it from the NFTContract project into this frontend project at utils/MyEpicNFT.json
        //abi stands for application binary interface.

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.")
        await nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      }else{
        console.log("Ethereum object doesn't exist!");
      }
    }catch(err){
      console.log(err)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
      Mint NFT
    </button>
  )

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}
        </div>
        
      </div>
    </div>
  );
};

export default App;
