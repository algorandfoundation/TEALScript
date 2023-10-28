/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */

import * as algokit from '@algorandfoundation/algokit-utils';
import { describe, test } from '@jest/globals';
import { artifactsTest, compileAndCreate, runMethod, algodClient, kmdClient } from './common';

const NAME = 'GeneralTest';
const PATH = 'tests/contracts/general.algo.ts';
const ARTIFACTS_DIR = 'tests/contracts/artifacts/';

describe('General', function () {
  artifactsTest(PATH, ARTIFACTS_DIR, NAME);

  describe('E2E', function () {
    const sender = algokit.getLocalNetDispenserAccount(algodClient, kmdClient);

    test('staticArray', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      await runMethod({ appClient, method: 'txnTypeEnum' });
    });
  });
});
