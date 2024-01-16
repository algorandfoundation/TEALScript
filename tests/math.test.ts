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
      uint8exp: BigInt(6 ** 3),
      plusEquals: 9n,
      plusEqualsFromGlobal: 9n,
      unsafeMethodArgs: 9n,
      squareRoot64: 4n,
      squareRoot256: 4n,
    };

    Object.keys(methods).forEach((method) => {
      test(method, async function () {
        const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(await runMethod({ appClient, method, methodArgs: [6, 3] })).toBe((methods as any)[method]);
      });
    });

    test('maxU64', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'maxU64' })).toBe(BigInt('18446744073709551615'));
    });

    test('overflow', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);

      let msg: string;
      try {
        await runMethod({ appClient, method: 'uint8plus', methodArgs: [2 ** 8 - 1, 1] });
        msg = 'No error';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        msg = e.message;
      }

      expect(msg).toMatch('// 8; <=; assert');
    });

    test('ufixedLiteralMul', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);

      expect(await runMethod({ appClient, method: 'ufixedLiteralMul' })).toBe(BigInt(Math.floor(12.34 * 12.34 * 100)));
    });

    test('ufixedMul', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);

      expect(
        await runMethod({
          appClient,
          method: 'ufixedMul',
          methodArgs: [1234n, 1234n],
        })
      ).toBe(BigInt(Math.floor(12.34 * 12.34 * 100)));
    });

    test('BigUfixedMul', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);

      expect(
        await runMethod({
          appClient,
          method: 'BigUfixedMul',
          methodArgs: [1234n, 1234n],
        })
      ).toBe(BigInt(Math.floor(12.34 * 12.34 * 100)));
    });

    test('TripleBigUfixedMul', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);

      const ab = Math.floor(1.23 * 4.56 * 100);
      const abc = Math.floor(ab * 7.89 * 100);
      expect(
        await runMethod({
          appClient,
          method: 'TripleBigUfixedMul',
          methodArgs: [123n, 456n, 789n],
        })
      ).toBe(BigInt(abc) / BigInt(100));
    });

    test('funcName', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);

      await runMethod({
        appClient,
        method: 'funcName',
        methodArgs: [3n],
      });
    });
  });

  describe('Compile Errors', function () {
    test('uint256exp', async function () {
      let msg: string;
      try {
        await compileAndCreate(
          algosdk.generateAccount(),
          'tests/contracts/math_compile_errors.algo.ts',
          ARTIFACTS_DIR,
          'Uint8Exp'
        );
        msg = 'No error';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        msg = e.message;
      }

      expect(msg).toMatch('Exponent operator only supported for uintN <= 64, got uint256 and uint256');
    });

    test('bytesComparison', async function () {
      let msg: string;
      try {
        await compileAndCreate(
          algosdk.generateAccount(),
          'tests/contracts/math_compile_errors.algo.ts',
          ARTIFACTS_DIR,
          'BytesComparison'
        );
        msg = 'No error';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        msg = e.message;
      }

      expect(msg).toMatch(
        'TEALScript only supports number comparison. If you want to compare these values as numbers, use btobigint'
      );
    });
  });
});
