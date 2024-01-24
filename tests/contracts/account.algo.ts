import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class AccountTest extends Contract {
  hasAsset(a: Account): void {
    assert(a.isOptedInToAsset(Asset.fromID(123)));
  }

  assetBalance(a: Account): void {
    assert(a.assetBalance(Asset.fromID(123)));
  }

  assetFrozen(a: Account): void {
    assert(a.assetFrozen(Asset.fromID(123)));
  }

  hasBalance(a: Account): void {
    assert(a.isInLedger);
  }

  balance(a: Account): void {
    assert(a.balance);
  }

  minBalance(a: Account): void {
    assert(a.minBalance);
  }

  authAddr(a: Account): void {
    log(a.authAddr);
  }

  totalNumUint(a: Account): void {
    assert(a.totalNumUint);
  }

  totalNumByteSlice(a: Account): void {
    assert(a.totalNumByteSlice);
  }

  totalExtraAppPages(a: Account): void {
    assert(a.totalExtraAppPages);
  }

  totalAppsCreated(a: Account): void {
    assert(a.totalAppsCreated);
  }

  totalAppsOptedIn(a: Account): void {
    assert(a.totalAppsOptedIn);
  }

  totalAssetsCreated(a: Account): void {
    assert(a.totalAssetsCreated);
  }

  totalAssets(a: Account): void {
    assert(a.totalAssets);
  }

  totalBoxes(a: Account): void {
    assert(a.totalBoxes);
  }

  totalBoxBytes(a: Account): void {
    assert(a.totalBoxBytes);
  }
}
