/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import * as algokit from '@algorandfoundation/algokit-utils';
import { describe, test } from '@jest/globals';
import { artifactsTest, compileAndCreate, runMethod, algodClient, kmdClient } from './common';

const PATH = 'tests/contracts/inheritance.algo.ts';

describe('Inheritance', function () {
  artifactsTest('tests/contracts/inheritance.algo.ts', 'A');
  artifactsTest('tests/contracts/inheritance.algo.ts', 'B');
  artifactsTest('tests/contracts/inheritance.algo.ts', 'C');
  artifactsTest('tests/contracts/inheritance.algo.ts', 'D');
  artifactsTest('tests/contracts/inheritance.algo.ts', 'AD');
  artifactsTest('tests/contracts/inheritance.algo.ts', 'E');

  describe('E2E', function () {
    const sender = algokit.getLocalNetDispenserAccount(algodClient, kmdClient);
    test('B extends A', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, 'B');
      await runMethod({ appClient, method: 'a', methodArgs: [] });
      await runMethod({ appClient, method: 'b', methodArgs: [] });
    });

    test('C extends B', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, 'C');
      await runMethod({ appClient, method: 'a', methodArgs: [] });
      await runMethod({ appClient, method: 'b', methodArgs: [] });
      await runMethod({ appClient, method: 'c', methodArgs: [] });
    });

    test('AD extends Contract.extend(A, D)', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, 'AD');
      await runMethod({ appClient, method: 'a', methodArgs: [] });
      await runMethod({ appClient, method: 'd', methodArgs: [] });
      await runMethod({ appClient, method: 'ad', methodArgs: [] });
    });

    test('E extends ExternalContract', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, 'E');
      await runMethod({ appClient, method: 'externalMethod', methodArgs: [] });
      await runMethod({ appClient, method: 'e', methodArgs: [] });
    });

    test('G extends F (protected)', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, 'G');
      await runMethod({ appClient, method: 'g', methodArgs: [] });
    });
  });
});
