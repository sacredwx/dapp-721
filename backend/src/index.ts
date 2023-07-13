import { BigNumber, Contract, Wallet, ethers } from 'ethers';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { Address, Collection, Token, TokenId, TokenURI } from "./types/Events";
import Deployer721Artifact from "../contracts/Deployer721.json";
import contractAddress from "../contracts/contract-address.json";

dotenv.config();

/**
 * Cache Configuration
 */

const collections = new Map<Address, Collection>(); // Collection => Properties
const tokens = new Map<Address, Map<TokenId, Token>>(); // Collection => Tokens

/**
 * Contract Configuration
 */

(() => { // Init Function
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_ENDPOINT);
  const signer = new Wallet(process.env.PRIVATE_KEY!, provider);
  console.log('Connected to ethereum on: ', process.env.RPC_ENDPOINT);

  const contract = new Contract(contractAddress.Deployer721, Deployer721Artifact.abi, signer);

  contract.on("CollectionCreated", (collection: Address, name: string, symbol: string) => {
    console.log('Received event CollectionCreated: ', collection, name, symbol);
    if(!collections.has(collection)) {
      collections.set(collection, {
        collection,
        name,
        symbol,
      });
    }
  });

  contract.on("TokenMinted", (collection: Address, recipient: Address, tokenId: TokenId, tokenUri: TokenURI) => {
    console.log('Received event TokenMinted: ', collection, recipient, tokenId, tokenUri);
    if(!tokens.has(collection)) {
      tokens.set(collection, new Map());
    }
    tokens.get(collection)!.set(tokenId, {
      tokenUri,
      recipient,
    });
  });
})();

/**
 * Server Configuration
 */

const app: Express = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Get Requests
 */

// TODO: Need to be paginated
app.get('/collections', (req: Request, res: Response) => {
  try {
    return res.json(Object.fromEntries(collections));
  } catch (e) {
    return res.status(500).json({ error: e });
  }
});

// TODO: Need to be paginated
app.get('/tokens', (req: Request, res: Response) => {
  try {
    return res.json(Object.fromEntries(tokens));
  } catch (e) {
    return res.status(500).json({ error: e });
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
