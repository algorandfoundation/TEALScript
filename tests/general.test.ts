/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */

import * as algokit from '@algorandfoundation/algokit-utils';
import { describe, test, expect } from '@jest/globals';
import { artifactsTest, compileAndCreate, runMethod, algodClient, kmdClient, getErrorMessage } from './common';

const NAME = 'GeneralTest';
const PATH = 'tests/contracts/general.algo.ts';
const ARTIFACTS_DIR = 'tests/contracts/artifacts/';

describe('General', function () {
  artifactsTest(PATH, ARTIFACTS_DIR, NAME);

  describe('E2E', function () {
    const sender = algokit.getLocalNetDispenserAccount(algodClient, kmdClient);

    test('vrfVerifyOp', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      await runMethod({ appClient, method: 'vrfVerifyOp', fee: 10_000 });
    });

    [
      'txnTypeEnum',
      'txnGroupLength',
      'verifyTxnFromTxnGroup',
      'verifyTxnCondition',
      'verifyTxnIncludedIn',
      'verifyTxnNotIncludedIn',
      'shift',
      'bzeroFunction',
      'numberToString',
      'methodOnParens',
      'stringSubstring',
      'stringPlusEquals',
      'callInternalPublicMethod',
      'opUp',
      'dynamicScratchSlot',
      'incrementScratchSlot',
      'incrementDynamicScratchSlot',
      'fromAddress',
    ].forEach((method) => {
      test(method, async function () {
        const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
        await runMethod({ appClient, method, fee: 2000 });
      });
    });

    test('returnValueOnAssignment', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'returnValueOnAssignment' })).toBe('bye');
    });

    test('returnArrayValueOnAssignment', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'returnArrayValueOnAssignment' })).toBe(4n);
    });

    test('returnStorageValueOnAssignment', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'returnStorageValueOnAssignment' })).toBe(2n);
    });

    test('returnOperatorAssignmentValue', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'returnOperatorAssignmentValue' })).toBe(3n);
    });

    test('returnArrayValueOnOperatorAssignment', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'returnArrayValueOnOperatorAssignment' })).toBe(5n);
    });

    test('returnArrayInStorageValueOnOperatorAssignment', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'returnArrayInStorageValueOnOperatorAssignment' })).toBe(5n);
    });

    test('submitPendingGroup', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      await runMethod({ appClient, method: 'submitPendingGroup', fee: 3000 });
    });

    test('readSchema', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      await runMethod({ appClient, method: 'readSchema' });
    });

    test('earlyReturn', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      const result1 = await runMethod({ appClient, method: 'earlyReturn', methodArgs: [1] });
      expect(result1).toBe(2n);

      const result2 = await runMethod({ appClient, method: 'earlyReturn', methodArgs: [2] });
      expect(result2).toBe(3n);
    });

    test('assertComment', async function () {
      const { appClient, compiler } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      let msg = 'No error';
      try {
        await runMethod({ appClient, method: 'assertComment', skipEvalTrace: true });
      } catch (e) {
        msg = getErrorMessage(e.message, compiler.sourceInfo);
      }

      expect(msg).toMatch('this is false');
    });

    test('throwErrorMessage', async function () {
      const { appClient, compiler } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      let msg = 'No error';
      try {
        await runMethod({ appClient, method: 'throwErrorMessage', skipEvalTrace: true });
      } catch (e) {
        msg = getErrorMessage(e.message, compiler.sourceInfo);
      }

      expect(msg).toMatch('this is an error');
    });
  });
});
