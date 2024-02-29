/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */

import * as algokit from '@algorandfoundation/algokit-utils';
import { describe, test, expect } from '@jest/globals';
import { artifactsTest, compileAndCreate, runMethod, algodClient, kmdClient } from './common';

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
  });
});
