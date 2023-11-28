/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { expect, describe, test, beforeAll } from '@jest/globals';
import * as algokit from '@algorandfoundation/algokit-utils';
// eslint-disable-next-line import/no-unresolved
import { ApplicationClient } from '@algorandfoundation/algokit-utils/types/app-client';
import { artifactsTest, algodClient, kmdClient } from './common';
import appSpec from './contracts/artifacts/LoopsTest.arc32.json';

let appClient: ApplicationClient;

describe('Loops', function () {
  artifactsTest('tests/contracts/loops.algo.ts', 'tests/contracts/artifacts/', 'LoopsTest');

  beforeAll(async function () {
    const sender = await algokit.getLocalNetDispenserAccount(algodClient, kmdClient);

    appClient = algokit.getAppClient(
      {
        app: JSON.stringify(appSpec),
        sender,
        resolveBy: 'id',
        id: 0,
      },
      algodClient
    );

    await appClient.create({
      method: 'createApplication',
      methodArgs: [],
      sendParams: { suppressLog: true },
    });
  });

  test('whileLoop', async function () {
    const ret = await appClient.call({ method: 'whileLoop', methodArgs: [], sendParams: { suppressLog: true } });
    expect(ret.return?.returnValue).toEqual(BigInt(10));
  });

  test('forLoop', async function () {
    const ret = await appClient.call({ method: 'forLoop', methodArgs: [], sendParams: { suppressLog: true } });
    expect(ret.return?.returnValue).toEqual(BigInt(10));
  });

  test('doWhileLoop', async function () {
    const ret = await appClient.call({ method: 'doWhileLoop', methodArgs: [], sendParams: { suppressLog: true } });
    expect(ret.return?.returnValue).toEqual(BigInt(10));
  });
});
