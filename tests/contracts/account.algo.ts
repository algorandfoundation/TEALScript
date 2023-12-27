import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class AccountTest extends Contract {
  hasAsset(a: Address): void {
    assert(a.isOptedInToAsset(AssetID.fromID(123)));
  }

  assetBalance(a: Address): void {
    assert(a.assetBalance(AssetID.fromID(123)));
  }

  assetFrozen(a: Address): void {
    assert(a.assetFrozen(AssetID.fromID(123)));
  }

  hasBalance(a: Address): void {
    assert(a.isInLedger);
  }

  balance(a: Address): void {
    assert(a.balance);
  }

  minBalance(a: Address): void {
    assert(a.minBalance);
  }

  authAddr(a: Address): void {
    log(a.authAddr);
  }

  totalNumUint(a: Address): void {
    assert(a.totalNumUint);
  }

  totalNumByteSlice(a: Address): void {
    assert(a.totalNumByteSlice);
  }

  totalExtraAppPages(a: Address): void {
    assert(a.totalExtraAppPages);
  }

  totalAppsCreated(a: Address): void {
    assert(a.totalAppsCreated);
  }

  totalAppsOptedIn(a: Address): void {
    assert(a.totalAppsOptedIn);
  }

  totalAssetsCreated(a: Address): void {
    assert(a.totalAssetsCreated);
  }

  totalAssets(a: Address): void {
    assert(a.totalAssets);
  }

  totalBoxes(a: Address): void {
    assert(a.totalBoxes);
  }

  totalBoxBytes(a: Address): void {
    assert(a.totalBoxBytes);
  }
}
