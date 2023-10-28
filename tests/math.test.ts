/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { test, expect, describe } from '@jest/globals';
import * as algokit from '@algorandfoundation/algokit-utils';
import algosdk from 'algosdk';
import { compileAndCreate, runMethod, artifactsTest, algodClient, kmdClient } from './common';

const NAME = 'MathTest';
const PATH = 'tests/contracts/math.algo.ts';
const ARTIFACTS_DIR = 'tests/contracts/artifacts/';

describe('Math', function () {
  artifactsTest('tests/contracts/math.algo.ts', 'tests/contracts/artifacts/', 'MathTest');

  describe('E2E', function () {
    const sender = algokit.getLocalNetDispenserAccount(algodClient, kmdClient);

    const methods = {
      u64plus: 9n,
      u64minus: 3n,
      u64mul: 18n,
      u64div: 2n,
      u256plus: 9n,
      u256minus: 3n,
      u256mul: 18n,
      u256div: 2n,
      u64Return256: 9n,
      exponent: BigInt(6 ** 3),
      variableTypeHint: 9n,
    };

    Object.keys(methods).forEach((method) => {
      test(method, async function () {
        const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
        expect(await runMethod({ appClient, method, methodArgs: [6, 3] })).toBe(methods[method]);
      });
    });

    test('maxU64', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'maxU64' })).toBe(BigInt('18446744073709551615'));
    });

    // btobigintFirst
    test('btobigintFirst', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'btobigintFirst', methodArgs: [algosdk.encodeUint64(1000)] })).toBe(
        1000n
      );
    });

    test('btobigintSecond', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'btobigintSecond', methodArgs: [algosdk.encodeUint64(1)] })).toBe(
        1000n
      );
    });

    test('overflow', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);

      let msg: string;
      try {
        await runMethod({ appClient, method: 'uint8plus', methodArgs: [2 ** 8 - 1, 1] });
        msg = 'No error';
      } catch (e) {
        msg = e.message;
      }

      expect(msg).toMatch('pushint 8; <=; assert');
    });
  });

  describe('Compile Errors', function () {
    test('uint8exp', async function () {
      let msg: string;
      try {
        await compileAndCreate(
          algosdk.generateAccount(),
          'tests/contracts/math_compile_errors.algo.ts',
          ARTIFACTS_DIR,
          'Uint8Exp'
        );
        msg = 'No error';
      } catch (e) {
        msg = e.message;
      }

      expect(msg).toMatch('Exponent operator only supported for uint64, got uint8 and uint8');
    });
  });
});
