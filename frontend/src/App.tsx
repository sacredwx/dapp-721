import React, { useRef, useState } from 'react';
import './App.css';

// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from "ethers";

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import Deployer721Artifact from "./contracts/Deployer721.json";
import contractAddress from "./contracts/contract-address.json";
import { NoWalletDetected } from './components/NoWalletDetected';
import { ConnectWallet } from './components/ConnectWallet';
import { TransactionErrorMessage } from './components/TransactionErrorMessage';
import { WaitingForTransactionMessage } from './components/WaitingForTransactionMessage';
import { Box, Button, Grid, LinearProgress, TextField } from '@mui/material';

import Eth, { Address, Collection } from './lib/Eth';

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;
const REFRESH_TIME = 8000;

declare global {
  interface Window {
    ethereum: import('ethers').providers.ExternalProvider;
  }
}

let eth: Eth;

// This is an utility method that turns an RPC error into a human readable
// message.
const getRpcErrorMessage = (error: any) => {
  if (error.error && error.error.data) {
    return error.error.data.message;
  }

  return error.message;
}

function App() {
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
  const [transactionError, setTransactionError] = useState<any | null>(null);
  const [txBeingSent, setTxBeingSent] = useState<string | null>(null);
  const [progress, setProgress] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<{ [key: Address]: Collection; }>({});

  const nameRef = useRef<any>();
  const symbolRef = useRef<any>();
  const tokenIdRef = useRef<any>();
  const uriRef = useRef<any>();

  // This method is for the user to vote.
  const sendTx = async (txAction: () => Promise<any>, postTxHook?: () => void) => {
    // Sending a transaction is a complex operation:
    //   - The user can reject it
    //   - It can fail before reaching the ethereum network (i.e. if the user
    //     doesn't have ETH for paying for the tx's gas)
    //   - It has to be mined, so it isn't immediately confirmed.
    //     Note that some testing networks, like Hardhat Network, do mine
    //     transactions immediately, but your dapp should be prepared for
    //     other networks.
    //   - It can fail once mined.
    //

    try {
      setProgress(true);
      // If a transaction fails, we save that error in the component's state.
      // We only save one such error, so before sending a second transaction, we
      // clear it.
      setTransactionError(null);

      // We send the transaction, and save its hash in the Dapp's state. This
      // way we can indicate that we are waiting for it to be mined.
      const tx = await txAction();
      setTxBeingSent(tx.hash);

      // We use .wait() to wait for the transaction to be mined. This method
      // returns the transaction's receipt.
      if (tx.wait) {
        const receipt = await tx.wait();

        // The receipt, contains a status flag, which is 0 to indicate an error.
        if (receipt.status === 0) {
          // We can't know the exact error that made the transaction fail when it
          // was mined, so we throw this generic one.
          throw new Error("Transaction failed");
        }
      }

      // Update related data on page
      if (postTxHook) {
        setTimeout(() => {
          postTxHook();
          setProgress(false);
        }, REFRESH_TIME);
      } else {
        refresh();
        setProgress(false);
      }
    } catch (error: any) {
      // We check the error code to see if this error was produced because the
      // user rejected a tx. If that's the case, we do nothing.
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }

      // Other errors are logged and stored in the Dapp's state. This is used to
      // show them to the user, and for debugging.
      console.error(error);
      setTransactionError(error);
      setProgress(false);
    } finally {
      // If we leave the try/catch, we aren't sending a tx anymore, so we clear
      // this part of the state.
      setTxBeingSent(null);
    }
  }

  const refresh = async () => {
    // TODO: Make ENV variable
    setCollections(await (await fetch('http://localhost/collections')).json());
  };

  // Ethereum wallets inject the window.ethereum object. If it hasn't been
  // injected, we instruct the user to install MetaMask.
  if (window.ethereum === undefined) {
    return <NoWalletDetected />;
  }

  // The next thing we need to do, is to ask the user to connect their wallet.
  // When the wallet gets connected, we are going to save the users's address
  // in the component's state. So, if it hasn't been saved yet, we have
  // to show the ConnectWallet component.
  //
  // Note that we pass it a callback that is going to be called when the user
  // clicks a button. This callback just calls the _connectWallet method.
  if (!selectedAddress) {
    return (
      <ConnectWallet
        connectWallet={async () => {
          try {
            const selAddress = await Eth.connectWallet();
            setSelectedAddress(selAddress);
            // We first initialize ethers by creating a provider using window.ethereum
            const _provider = new ethers.providers.Web3Provider(window.ethereum);

            // Then, we initialize the contract using that provider and the token's
            // artifact. You can do this same thing with your contracts.
            const _contract = new ethers.Contract(
              contractAddress.Deployer721,
              Deployer721Artifact.abi,
              _provider.getSigner(0)
            );

            eth = new Eth(_contract);
          } catch (e) {
            setError((e as Error).toString());
          }
        }}
        networkError={error}
        dismiss={() => setError(null)}
      />
    );
  } else {
    refresh();
  }

  return (
    <>
      <div className="App">
        <Grid container>
          <Grid item xs={12}>
            <Box m={1}>
              <TextField
                label="name"
                inputRef={nameRef}
              />
              <TextField
                label="symbol"
                inputRef={symbolRef}
              />
              <Button
                variant="contained"
                onClick={() => sendTx(() => eth.deployCollection(nameRef.current.value, symbolRef.current.value))}
              >New Collection</Button>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box m={1}>
              Mint: 
              <TextField
                label="tokenId"
                inputRef={tokenIdRef}
              />
              <TextField
                label="tokenURI"
                inputRef={uriRef}
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <div className="row">
              {Object.keys(collections).map((address: Address) => (
                <>
                  <div>
                    {collections[address].name} [{collections[address].symbol}]
                    &nbsp;
                    <Button
                      variant="contained"
                      onClick={() => sendTx(() => eth.mint(address, tokenIdRef.current.value, uriRef.current.value, selectedAddress))}
                    >Mint</Button>
                    &nbsp;
                    {address}
                  </div >
                </>
              ))}
            </div>
          </Grid>
        </Grid>
        <div className="row">
          <div className="col-12">
            {progress &&
              <Box sx={{ margin: '0 auto', width: '60%' }}>
                <LinearProgress />
              </Box>
            }
            {/* 
              Sending a transaction isn't an immediate action. You have to wait
              for it to be mined.
              If we are waiting for one, we show a message here.
            */}
            {txBeingSent && (
              <WaitingForTransactionMessage txHash={txBeingSent} />
            )}

            {/* 
              Sending a transaction can fail in multiple ways. 
              If that happened, we show a message here.
            */}
            {transactionError && (
              <TransactionErrorMessage
                message={getRpcErrorMessage(transactionError)}
                dismiss={() => setTransactionError(null)}
              />
            )}
          </div>
        </div>
      </div >
    </>
  );
}

export default App;
