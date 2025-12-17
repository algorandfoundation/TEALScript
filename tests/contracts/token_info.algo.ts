import { Contract } from '../../src/lib/index';

export type TokenInfo = {
  tokenCreator: Address;
  p0: uint64;
  pQ: uint64;
  Q: uint64;
  k: uint64;
  launchQ: uint64;

  feeBpsPlatform: uint64;
  feeBpsCreator: uint64;

  currentBonding: uint64;

  bondingOn: uint64;

  assetId: AssetID;
  symbol: bytes<8>;
  name: bytes<32>;
  assetUrl: bytes<96>;
  description: bytes<1024>;
  socialWebsite: bytes<256>;
  socialX: bytes<64>;
  socialTelegram: bytes<64>;
  socialDiscord: bytes<64>;
};

const BOND_PLATFORM_UNBONDED = 123;
const P0: uint64 = 1000;
const PQ: uint64 = 500;

// eslint-disable-next-line no-unused-vars
class TokenInfoContract extends Contract {
  tokenMap = BoxMap<AssetID, TokenInfo>({ prefix: 't' });

  bondSupply = GlobalStateKey<uint64>();

  createSupply = GlobalStateKey<uint64>();

  feeBpsPlatform = GlobalStateKey<uint64>();

  feeBpsCreator = GlobalStateKey<uint64>();

  doMath(
    k: uint64,
    symbol: string,
    name: string,
    assetUrl: string,
    description: string,
    socialWebsite: string,
    socialTelegram: string,
    socialDiscord: string,
    socialX: string,
    mintedAsset: AssetID
  ): void {
    const tokenData: TokenInfo = {
      tokenCreator: this.txn.sender,
      currentBonding: 0,
      bondingOn: BOND_PLATFORM_UNBONDED,
      p0: P0,
      pQ: PQ,
      k: k,
      Q: this.bondSupply.value,
      launchQ: this.createSupply.value,
      feeBpsPlatform: this.feeBpsPlatform.value,
      feeBpsCreator: this.feeBpsCreator.value,
      assetId: AssetID.fromUint64(mintedAsset.id),
      symbol: symbol as bytes<8>,
      name: name as bytes<32>,
      assetUrl: assetUrl as bytes<96>,
      description: description as bytes<1024>,
      socialWebsite: socialWebsite as bytes<256>,
      socialX: socialX as bytes<64>,
      socialTelegram: socialTelegram as bytes<64>,
      socialDiscord: socialDiscord as bytes<64>,
    };
    this.tokenMap(mintedAsset).value = tokenData;
  }
}
