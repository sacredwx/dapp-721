import { Contract } from 'ethers';

declare global {
  interface Window {
    ethereum: import('ethers').providers.ExternalProvider;
  }
}

export type Address = string;

export interface Collection {
  collection: Address,
  name: string,
  symbol: string,
};

class Eth {
  constructor(private contract: Contract) { }

  public static async connectWallet(): Promise<string> {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    const [selectedAddress] = await window.ethereum.request!({ method: 'eth_requestAccounts' });

    // Once we have the address, we can initialize the application.

    return selectedAddress;
  }

  public deployCollection(name: string, symbol:string): Promise<any> {
    return this.contract.deployCollection(name, symbol);
  };

  public mint(collection: Address, tokenId: number, uri: string, to: Address): Promise<any> {
    return this.contract.mint(collection, tokenId, uri, to);
  };
}

export default Eth;
