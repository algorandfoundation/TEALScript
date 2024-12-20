/* eslint-disable no-bitwise */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { test, expect, describe } from '@jest/globals';
import * as algokit from '@algorandfoundation/algokit-utils';
import algosdk from 'algosdk';
import { compileAndCreate, runMethod, artifactsTest, algodClient, kmdClient, getErrorMessage } from './common';

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
      bigintPlus: 9n,
      bitwiseAnd: 6n & 3n,
      bitwiseOr: 6n | 3n,
      bitwiseXor: 6n ^ 3n,
      bitwiseAndU256: 6n & 3n,
      bitwiseOrU256: 6n | 3n,
      bitwiseXorU256: 6n ^ 3n,
      mulw: 6n * 3n,
      addw: 6n + 3n,
      expw: 6n ** 3n,
      divw: 6n / 3n,
      divmodw: 6n / 3n,
    };

    Object.keys(methods).forEach((method) => {
      test(method, async function () {
        const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(await runMethod({ appClient, method, methodArgs: [6, 3] })).toBe((methods as any)[method]);
      });
    });

    test('bitwiseNot', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'bitwiseNot', methodArgs: [6n] })).toBe(
        BigInt(`0b${'1'.repeat(61)}001`)
      );
    });

    test('bitwiseNotU256', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'bitwiseNotU256', methodArgs: [6n] })).toBe(
        BigInt(`0b${'1'.repeat(253)}001`)
      );
    });

    test('maxU64', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'maxU64' })).toBe(BigInt('18446744073709551615'));
    });

    test('uintFromHex', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'uintFromHex' })).toBe(BigInt('0xFF'));
    });

    test('overflow', async function () {
      const { appClient, compiler } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);

      let msg: string;
      try {
        await runMethod({ appClient, method: 'uint8plus', methodArgs: [2 ** 8 - 1, 1], skipEvalTrace: true });
        msg = 'No error';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        msg = getErrorMessage(e.message, compiler.sourceInfo);
      }

      expect(msg).toMatch('uint8plus return value overflowed 8 bits');
    });

    test('funcName', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);

      await runMethod({
        appClient,
        method: 'funcName',
        methodArgs: [3n],
      });
    });

    test('unsafeVariables', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);

      await runMethod({
        appClient,
        method: 'unsafeVariables',
      });
    });

    test('wideRatioTest', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'wideRatioTest' })).toBe(18446744073709551615n);
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
