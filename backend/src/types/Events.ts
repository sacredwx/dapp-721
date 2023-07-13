export type Address = string;
export type TokenId = number;
export type TokenURI = string;

export interface Collection {
  collection: Address,
  name: string,
  symbol: string,
};

export interface Token {
  tokenUri: TokenURI,
  recipient: Address,
};
