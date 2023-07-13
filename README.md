# DApp-721

The repository includes:

A Smart contract that is able to deploy NFT collections  
and mint NFTs on all the previously collections  

A backend server that listens to the emited events and caches them  
and provides the dApp with relevant data  

A dApp which features the creation of new collections and NFTs

## Quick start

The first things you need to do are cloning this repository and installing its
dependencies:

```sh
git clone https://github.com/sacredwx/dapp-721
cd dapp-721
npm install
```

Once installed, let's run Hardhat's testing network (Optional, if you run locally):

```sh
npx hardhat node --hostname 127.0.0.1
```

Then, on a new terminal, go to the repository's root folder and run this to
deploy your contract to the network of your choice (localhost / goerli):

```sh
npx hardhat run scripts/deploy.js --network {network}
```

A .env file is located in 'backend/.env'
shall be populated with proper values:

```
PORT=80
RPC_ENDPOINT=http://127.0.0.1:8545/
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

Then, we need to run the backend with:

```sh
cd backend
npm install
npm run dev
```

Finally, we can run the frontend with:

```sh
cd frontend
npm install
npm start
```

Open [http://localhost:3000/](http://localhost:3000/) to see your Dapp. You will
need to have [Metamask](https://metamask.io) installed and listening to
`localhost 8545`.

## Troubleshooting

- `Invalid nonce` errors: if you are seeing this error on the `npx hardhat node`
  console, try resetting your Metamask account. This will reset the account's
  transaction history and also the nonce. Open Metamask, click on your account
  followed by `Settings > Advanced > Reset Account`.
