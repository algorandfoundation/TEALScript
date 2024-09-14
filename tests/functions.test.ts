/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */

import * as algokit from '@algorandfoundation/algokit-utils';
import { describe, test, expect } from '@jest/globals';
import { artifactsTest, compileAndCreate, runMethod, algodClient, kmdClient } from './common';

const NAME = 'FunctionsTest';
const PATH = 'tests/contracts/functions.algo.ts';
const ARTIFACTS_DIR = 'tests/contracts/artifacts/';

describe('Functions', function () {
  artifactsTest(PATH, ARTIFACTS_DIR, NAME);

  describe('E2E', function () {
    const sender = algokit.getLocalNetDispenserAccount(algodClient, kmdClient);

    test('callNonClassFunction', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'callNonClassFunction', methodArgs: [1n, 2n] })).toBe(3n);
    });
  });
});
