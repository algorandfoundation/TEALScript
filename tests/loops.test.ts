/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import {
  expect, describe, test, beforeAll,
} from '@jest/globals';
import { sandbox, clients } from 'beaker-ts';
import { LoopsTest } from './contracts/clients/loopstest_client';
import { artifactsTest } from './common';

let appClient: LoopsTest;

artifactsTest('LoopsTest', 'tests/contracts/loops.algo.ts', 'tests/contracts/artifacts/', 'LoopsTest');

describe('LoopsTest', function () {
  beforeAll(async function () {
    const acct = (await sandbox.getAccounts()).pop()!;

    appClient = new LoopsTest({
      client: clients.sandboxAlgod(),
      signer: acct.signer,
      sender: acct.addr,
    });

    await appClient.create();
  });

  test('whileLoop', async function () {
    const ret = await appClient.whileLoop();
    expect(ret.returnValue).toEqual(BigInt(10));
  });

  test('forLoop', async function () {
    const ret = await appClient.forLoop();
    expect(ret.returnValue).toEqual(BigInt(10));
  });
});
