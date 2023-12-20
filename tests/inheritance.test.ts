/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import * as algokit from '@algorandfoundation/algokit-utils';
import { describe, test } from '@jest/globals';
import { artifactsTest, compileAndCreate, runMethod, algodClient, kmdClient } from './common';

const PATH = 'tests/contracts/inheritance.algo.ts';
const ARTIFACTS_DIR = 'tests/contracts/artifacts/';

describe('Inheritance', function () {
  artifactsTest('tests/contracts/inheritance.algo.ts', 'tests/contracts/artifacts/', 'A');
  artifactsTest('tests/contracts/inheritance.algo.ts', 'tests/contracts/artifacts/', 'B');
  artifactsTest('tests/contracts/inheritance.algo.ts', 'tests/contracts/artifacts/', 'C');
  artifactsTest('tests/contracts/inheritance.algo.ts', 'tests/contracts/artifacts/', 'D');
  artifactsTest('tests/contracts/inheritance.algo.ts', 'tests/contracts/artifacts/', 'AD');

  describe('E2E', function () {
    const sender = algokit.getLocalNetDispenserAccount(algodClient, kmdClient);
    test('B extends A', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, 'B');
      await runMethod({ appClient, method: 'a', methodArgs: [] });
      await runMethod({ appClient, method: 'b', methodArgs: [] });
    });

    test('C extends B', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, 'C');
      await runMethod({ appClient, method: 'a', methodArgs: [] });
      await runMethod({ appClient, method: 'b', methodArgs: [] });
      await runMethod({ appClient, method: 'c', methodArgs: [] });
    });

    test('AD extends Contract.extend(A, D)', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, 'AD');
      await runMethod({ appClient, method: 'a', methodArgs: [] });
      await runMethod({ appClient, method: 'd', methodArgs: [] });
      await runMethod({ appClient, method: 'ad', methodArgs: [] });
    });
  });
});
