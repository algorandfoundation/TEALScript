/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { expect } from 'chai';
// eslint-disable-next-line import/no-unresolved, import/extensions
import { getMethodTeal, lowerFirstChar, artifactsTest } from './common';
import * as langspec from '../src/langspec.json';

async function getTeal(methodName: string) {
  return getMethodTeal('tests/contracts/account.ts', 'AccountTest', methodName);
}

artifactsTest('AccountTest', 'tests/contracts/account.ts', 'tests/contracts/', 'AccountTest');

describe('Account', function () {
  // eslint-disable-next-line mocha/no-setup-in-describe
  langspec.Ops.find((op) => op.Name === 'acct_params_get')!.ArgEnum!.forEach((a) => {
    const fn = lowerFirstChar(a.replace('Acct', ''));
    it(fn, async function () {
      if (fn === 'authAddr') {
        expect(await getTeal(fn)).to.deep.equal([
          `// log(a.${fn})`,
          'frame_dig -1 // a: account',
          `acct_params_get ${a}`,
          'assert',
          'log',
        ]);
      } else {
        expect(await getTeal(fn)).to.deep.equal([
          `// assert(a.${fn})`,
          'frame_dig -1 // a: account',
          `acct_params_get ${a}`,
          'assert',
          'assert',
        ]);
      }
    });
  });

  it('assetBalance', async function () {
    expect(await getTeal('assetBalance')).to.deep.equal([
      '// assert(a.assetBalance(new Asset(123)))',
      'frame_dig -1 // a: account',
      'int 123',
      'asset_holding_get AssetBalance',
      'assert',
      'assert',
    ]);
  });

  it('assetFrozen', async function () {
    expect(await getTeal('assetFrozen')).to.deep.equal([
      '// assert(a.assetFrozen(new Asset(123)))',
      'frame_dig -1 // a: account',
      'int 123',
      'asset_holding_get AssetFrozen',
      'assert',
      'assert',
    ]);
  });

  it('hasAsset', async function () {
    expect(await getTeal('hasAsset')).to.deep.equal([
      '// assert(a.hasAsset(new Asset(123)))',
      'frame_dig -1 // a: account',
      'int 123',
      'asset_holding_get AssetBalance',
      'swap',
      'pop',
      'assert',
    ]);
  });
});
