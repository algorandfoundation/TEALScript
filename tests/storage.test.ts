/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import {
  describe, test, expect, beforeAll,
} from '@jest/globals';
import * as algokit from '@algorandfoundation/algokit-utils';
import fs from 'fs';
import path from 'path';
import { ApplicationClient } from '@algorandfoundation/algokit-utils/types/app-client';
import {
  getMethodTeal, artifactsTest, algodClient, kmdClient,
} from './common';
import Compiler from '../src/lib/compiler';

async function getTeal(methodName: string) {
  return getMethodTeal('tests/contracts/storage.algo.ts', 'StorageTest', methodName);
}

artifactsTest('StorageTest', 'tests/contracts/storage.algo.ts', 'tests/contracts/artifacts/', 'StorageTest');
const SUPPRESS_LOG = { suppressLog: true };

const ops: {[type: string]: {[method: string]: string}} = {
  global: {
    Get: 'app_global_get',
    Put: 'app_global_put',
    Delete: 'app_global_del',
    Exists: 'app_global_get_ex',
  },
  local: {
    Get: 'app_local_get',
    Put: 'app_local_put',
    Delete: 'app_local_del',
    Exists: 'app_local_get_ex',
  },
  box: {
    Get: 'box_get',
    Put: 'box_put',
    Delete: 'box_del',
    Exists: 'box_len',
  },
};

['global', 'local', 'box'].forEach((storageType) => {
  ['Key', 'Map'].forEach((storageClass) => {
    describe(`${storageType}${storageClass}`, function () {
      ['Put', 'Get', 'Delete', 'Exists'].forEach((method) => {
        test(`${storageType}${storageClass}${method}`, async function () {
          const teal = await getTeal(`${storageType}${storageClass}${method}`);
          const expectedTeal: string[] = [];

          if (storageType === 'local') expectedTeal.push('frame_dig -1 // a: account');

          if (['local', 'global'].includes(storageType) && method === 'Exists') expectedTeal.push('txna Applications 0');

          expectedTeal.push('byte 0x666f6f // "foo"');

          if (method === 'Put') {
            expectedTeal.push('byte 0x626172 // "bar"');
          }

          expectedTeal.push(ops[storageType][method]);

          if (method === 'Exists') {
            expectedTeal.push('swap');
            expectedTeal.push('pop');
            expectedTeal.push('assert');
          }

          if (method === 'Get') {
            if (storageType === 'box') expectedTeal.push('assert');
            expectedTeal.push('byte 0x626172 // "bar"');
            expectedTeal.push('==');
            expectedTeal.push('assert');
          }

          expect(teal.slice(1)).toEqual(expectedTeal);
        });
      });
    });
  });
});

describe('Box Ops', () => {
  let appClient: ApplicationClient;

  beforeAll(async () => {
    const className = 'StorageTest';

    const sourcePath = path.join('tests', 'contracts', 'storage.algo.ts');
    const content = fs.readFileSync(sourcePath, 'utf-8');
    const compiler = new Compiler(content, className, {
      filename: sourcePath,
      disableWarnings: true,
    });
    await compiler.compile();
    await compiler.algodCompile();

    const sender = algokit.getLocalNetDispenserAccount(algodClient, kmdClient);

    appClient = algokit.getAppClient(
      {
        app: JSON.stringify(compiler.appSpec()),
        sender: await sender,
        resolveBy: 'id',
        id: 0,
      },
      algodClient,
    );

    await appClient.create({
      method: 'createApplication',
      methodArgs: [],
      sendParams: SUPPRESS_LOG,
    });
  });

  test('boxKeyCreate', async () => {
    await appClient.fundAppAccount({
      amount: algokit.microAlgos(513300),
      sendParams: SUPPRESS_LOG,
    });
    const box = new Uint8Array(Buffer.from('foo'));

    await appClient.call({
      method: 'boxKeyCreate',
      methodArgs: [],
      boxes: [{ appIndex: 0, name: box }],
      sendParams: SUPPRESS_LOG,
    });

    expect((await appClient.getBoxValue(box)).byteLength).toEqual(1024);
  });

  test('boxKeyLength', async () => {
    const box = new Uint8Array(Buffer.from('foo'));

    const result = await appClient.call({
      method: 'boxKeyLength',
      methodArgs: [],
      boxes: [{ appIndex: 0, name: box }],
      sendParams: SUPPRESS_LOG,
    });

    expect(result.return?.returnValue).toEqual(1024n);
  });

  test('boxKeyReplace', async () => {
    const box = new Uint8Array(Buffer.from('foo'));

    await appClient.call({
      method: 'boxKeyReplace',
      methodArgs: [],
      boxes: [{ appIndex: 0, name: box }],
      sendParams: SUPPRESS_LOG,
    });

    expect((await appClient.getBoxValue(box)).slice(0, 3)).toEqual(new Uint8Array(Buffer.from('abc')));
  });

  test('boxKeyExtract', async () => {
    const box = new Uint8Array(Buffer.from('foo'));

    const result = await appClient.call({
      method: 'boxKeyExtract',
      methodArgs: [],
      boxes: [{ appIndex: 0, name: box }],
      sendParams: SUPPRESS_LOG,
    });

    expect(result.return?.returnValue as string).toEqual('abc');
  });

  test('boxMapCreate', async () => {
    await appClient.fundAppAccount({
      amount: algokit.microAlgos(513300),
      sendParams: SUPPRESS_LOG,
    });
    const box = new Uint8Array(Buffer.from('bar'));

    await appClient.call({
      method: 'boxMapCreate',
      methodArgs: [],
      boxes: [{ appIndex: 0, name: box }],
      sendParams: SUPPRESS_LOG,
    });

    expect((await appClient.getBoxValue(box)).byteLength).toEqual(1024);
  });

  test('boxMapLength', async () => {
    const box = new Uint8Array(Buffer.from('bar'));

    const result = await appClient.call({
      method: 'boxMapLength',
      methodArgs: [],
      boxes: [{ appIndex: 0, name: box }],
      sendParams: SUPPRESS_LOG,
    });

    expect(result.return?.returnValue).toEqual(1024n);
  });

  test('boxMapReplace', async () => {
    const box = new Uint8Array(Buffer.from('bar'));

    await appClient.call({
      method: 'boxMapReplace',
      methodArgs: [],
      boxes: [{ appIndex: 0, name: box }],
      sendParams: SUPPRESS_LOG,
    });

    expect((await appClient.getBoxValue(box)).slice(0, 3)).toEqual(new Uint8Array(Buffer.from('abc')));
  });

  test('boxMapExtract', async () => {
    const box = new Uint8Array(Buffer.from('bar'));

    const result = await appClient.call({
      method: 'boxMapExtract',
      methodArgs: [],
      boxes: [{ appIndex: 0, name: box }],
      sendParams: SUPPRESS_LOG,
    });

    expect(result.return?.returnValue as string).toEqual('abc');
  });
});
