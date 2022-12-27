/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { expect } from 'chai';
// eslint-disable-next-line import/no-unresolved, import/extensions
import getMethodTeal from './common';

async function getTeal(methodName: string, length: number) {
  return getMethodTeal('tests/contracts/account.ts', 'AccountTest', methodName, length);
}

describe('Account', function () {
  it('assetBalance', async function () {
    expect(await getTeal('assetBalance', 5)).to.deep.equal([
      '// assert(a.assetBalance(123))',
      'frame_dig -1 // a: Account',
      'int 123',
      'asset_holding_get AssetBalance',
      'assert',
    ]);
  });

  it('assets', async function () {
    expect(await getTeal('assets', 4)).to.deep.equal([
      '// assert(a.assets)',
      'frame_dig -1 // a: Account',
      'acct_params_get AcctTotalAssets',
      'assert',
    ]);
  });

  it('balance', async function () {
    expect(await getTeal('balance', 4)).to.deep.equal([
      '// assert(a.balance)',
      'frame_dig -1 // a: Account',
      'acct_params_get AcctBalance',
      'assert',
    ]);
  });

  it('hasBalance', async function () {
    expect(await getTeal('hasBalance', 5)).to.deep.equal([
      '// assert(a.hasBalance)',
      'frame_dig -1 // a: Account',
      'acct_params_get AcctBalance',
      'swap',
      'pop',
    ]);
  });

  it('minBalance', async function () {
    expect(await getTeal('minBalance', 4)).to.deep.equal([
      '// assert(a.minBalance)',
      'frame_dig -1 // a: Account',
      'acct_params_get AcctMinBalance',
      'assert',
    ]);
  });
});
