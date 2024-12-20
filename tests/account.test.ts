/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { expect, test, describe } from '@jest/globals';
import { getMethodTeal, lowerFirstChar, artifactsTest } from './common';
import langspec from '../src/static/langspec.json';

async function getTeal(methodName: string) {
  return getMethodTeal('tests/contracts/account.algo.ts', 'AccountTest', methodName);
}

describe('Account', function () {
  artifactsTest('tests/contracts/account.algo.ts', 'tests/contracts/artifacts/', 'AccountTest');

  langspec.Ops.find((op) => op.Name === 'acct_params_get')!.ArgEnum!.forEach((a) => {
    const fn = lowerFirstChar(a.replace('Acct', ''));

    if (['incentiveEligible', 'lastProposed', 'lastHeartbeat'].includes(fn)) return;

    test(fn, async function () {
      if (fn === 'authAddr') {
        expect(await getTeal(fn)).toEqual([
          `// log(a.${fn})`,
          'frame_dig -1 // a: Address',
          `acct_params_get ${a}`,
          'pop',
          'log',
        ]);
      } else {
        expect(await getTeal(fn)).toEqual([
          `// assert(a.${fn})`,
          'frame_dig -1 // a: Address',
          `acct_params_get ${a}`,
          'pop',
          'assert',
        ]);
      }
    });
  });

  test('assetBalance', async function () {
    expect(await getTeal('assetBalance')).toEqual([
      '// assert(a.assetBalance(AssetID.fromUint64(123)))',
      'frame_dig -1 // a: Address',
      'intc 2 // 123',
      'asset_holding_get AssetBalance',
      'pop',
      'assert',
    ]);
  });

  test('assetFrozen', async function () {
    expect(await getTeal('assetFrozen')).toEqual([
      '// assert(a.assetFrozen(AssetID.fromUint64(123)))',
      'frame_dig -1 // a: Address',
      'intc 2 // 123',
      'asset_holding_get AssetFrozen',
      'pop',
      'assert',
    ]);
  });

  test('isOptedIntoAsset', async function () {
    expect(await getTeal('hasAsset')).toEqual([
      '// assert(a.isOptedInToAsset(AssetID.fromUint64(123)))',
      'frame_dig -1 // a: Address',
      'intc 2 // 123',
      'asset_holding_get AssetBalance',
      'swap',
      'pop',
      'assert',
    ]);
  });
});
