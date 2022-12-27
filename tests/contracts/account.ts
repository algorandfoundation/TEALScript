/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

// eslint-disable-next-line no-unused-vars
class AccountTest extends Contract {
  assetBalance(a: Account): void {
    assert(a.assetBalance(123));
  }

  assets(a: Account): void {
    assert(a.assets);
  }

  balance(a: Account): void {
    assert(a.balance);
  }

  minBalance(a: Account): void {
    assert(a.minBalance);
  }

  hasBalance(a: Account): void {
    assert(a.hasBalance);
  }
}
