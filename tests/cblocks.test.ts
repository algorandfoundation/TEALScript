/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */

import * as algokit from '@algorandfoundation/algokit-utils';
import { describe, test, expect } from '@jest/globals';
import { artifactsTest, compileAndCreate, runMethod, algodClient, kmdClient, getErrorMessage } from './common';

const PATH = 'tests/contracts/cblocks.algo.ts';
const ARTIFACTS_DIR = 'tests/contracts/artifacts/';

describe('bytecblock', function () {
  const NAME = 'BytecblockTest';
  artifactsTest(PATH, ARTIFACTS_DIR, NAME);

  describe('E2E', function () {
    const sender = algokit.getLocalNetDispenserAccount(algodClient, kmdClient);

    test('largeBytecblock', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'largeBytecblock', fee: 2_000 })).toBe('1257');
    });
  });
});

describe('intcblock', function () {
  const NAME = 'IntcblockTest';
  artifactsTest(PATH, ARTIFACTS_DIR, NAME);

  describe('E2E', function () {
    const sender = algokit.getLocalNetDispenserAccount(algodClient, kmdClient);

    test('largeBytecblock', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'largeIntcblock' })).toBe(258n);
    });
  });
});
