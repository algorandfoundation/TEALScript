/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { expect, describe, test, beforeAll } from '@jest/globals';
import * as algokit from '@algorandfoundation/algokit-utils';
// eslint-disable-next-line import/no-unresolved
import { ApplicationClient } from '@algorandfoundation/algokit-utils/types/app-client';
import { artifactsTest, algodClient, kmdClient, compileAndCreate } from './common';

let appClient: ApplicationClient;

describe('Loops', function () {
  artifactsTest('tests/contracts/loops.algo.ts', 'tests/contracts/artifacts/', 'LoopsTest');

  beforeAll(async function () {
    const sender = await algokit.getLocalNetDispenserAccount(algodClient, kmdClient);
    const cc = await compileAndCreate(sender, 'tests/contracts/loops.algo.ts', '', 'LoopsTest');
    appClient = cc.appClient;
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

  test('breakWhileLoop', async function () {
    const ret = await appClient.call({ method: 'breakWhileLoop', methodArgs: [], sendParams: { suppressLog: true } });
    expect(ret.return?.returnValue).toEqual(BigInt(5));
  });

  test('continueWhileLoop', async function () {
    const ret = await appClient.call({
      method: 'continueWhileLoop',
      methodArgs: [],
      sendParams: { suppressLog: true },
    });
    expect(ret.return?.returnValue).toEqual(BigInt(1337));
  });

  test('breakForLoop', async function () {
    const ret = await appClient.call({ method: 'breakForLoop', methodArgs: [], sendParams: { suppressLog: true } });
    expect(ret.return?.returnValue).toEqual(BigInt(5));
  });

  test('continueForLoop', async function () {
    const ret = await appClient.call({
      method: 'continueForLoop',
      methodArgs: [],
      sendParams: { suppressLog: true },
    });
    expect(ret.return?.returnValue).toEqual(1341n);
  });

  test('breakDoWhileLoop', async function () {
    const ret = await appClient.call({ method: 'breakDoWhileLoop', methodArgs: [], sendParams: { suppressLog: true } });
    expect(ret.return?.returnValue).toEqual(BigInt(5));
  });

  test('continueDoWhileLoop', async function () {
    const ret = await appClient.call({
      method: 'continueDoWhileLoop',
      methodArgs: [],
      sendParams: { suppressLog: true },
    });
    expect(ret.return?.returnValue).toEqual(BigInt(1337));
  });
});
