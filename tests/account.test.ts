/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { expect, test, describe } from '@jest/globals';
import { getMethodTeal, lowerFirstChar, artifactsTest } from './common';
import * as langspec from '../src/langspec.json';

async function getTeal(methodName: string) {
  return getMethodTeal('tests/contracts/account.algo.ts', 'AccountTest', methodName);
}

artifactsTest('AccountTest', 'tests/contracts/account.algo.ts', 'tests/contracts/artifacts/', 'AccountTest');

describe('Account', function () {
  langspec.Ops.find((op) => op.Name === 'acct_params_get')!.ArgEnum!.forEach((a) => {
    const fn = lowerFirstChar(a.replace('Acct', ''));
    test(fn, async function () {
      if (fn === 'authAddr') {
        expect(await getTeal(fn)).toEqual([
          `// log(a.${fn})`,
          'frame_dig -1 // a: account',
          `acct_params_get ${a}`,
          'assert',
          'log',
        ]);
      } else {
        expect(await getTeal(fn)).toEqual([
          `// assert(a.${fn})`,
          'frame_dig -1 // a: account',
          `acct_params_get ${a}`,
          'assert',
          'assert',
        ]);
      }
    });
  });

  test('assetBalance', async function () {
    expect(await getTeal('assetBalance')).toEqual([
      '// assert(a.assetBalance(Asset.fromID(123)))',
      'frame_dig -1 // a: account',
      'int 123',
      'asset_holding_get AssetBalance',
      'assert',
      'assert',
    ]);
  });

  test('assetFrozen', async function () {
    expect(await getTeal('assetFrozen')).toEqual([
      '// assert(a.assetFrozen(Asset.fromID(123)))',
      'frame_dig -1 // a: account',
      'int 123',
      'asset_holding_get AssetFrozen',
      'assert',
      'assert',
    ]);
  });

  test('hasAsset', async function () {
    expect(await getTeal('hasAsset')).toEqual([
      '// assert(a.hasAsset(Asset.fromID(123)))',
      'frame_dig -1 // a: account',
      'int 123',
      'asset_holding_get AssetBalance',
      'swap',
      'pop',
      'assert',
    ]);
  });
});
