/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { describe, test, expect, beforeAll } from '@jest/globals';
import * as algokit from '@algorandfoundation/algokit-utils';
import path from 'path';
// eslint-disable-next-line import/no-unresolved
import { ApplicationClient } from '@algorandfoundation/algokit-utils/types/app-client';
import algosdk from 'algosdk';
import { getMethodTeal, artifactsTest, algodClient, kmdClient, compileAndCreate, TESTS_PROJECT } from './common';
import Compiler from '../src/lib/compiler';

const ARTIFACTS_DIR = 'tests/contracts/artifacts/';

async function getTeal(methodName: string) {
  return getMethodTeal('tests/contracts/storage.algo.ts', 'StorageTest', methodName);
}

const SEND_PARAMS = { suppressLog: true, populateAppCallResources: true };

const ops: { [type: string]: { [method: string]: string } } = {
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

describe('Storage', function () {
  artifactsTest('tests/contracts/storage.algo.ts', 'tests/contracts/artifacts/', 'StorageTest');

  ['global', 'local', 'box'].forEach((storageType) => {
    ['Key', 'Map'].forEach((storageClass) => {
      describe(`${storageType}${storageClass}`, function () {
        ['Put', 'Get', 'Delete', 'Exists'].forEach((method) => {
          test(`${storageType}${storageClass}${method}`, async function () {
            const teal = await getTeal(`${storageType}${storageClass}${method}`);
            const expectedTeal: string[] = [];

            if (storageType === 'local') expectedTeal.push('frame_dig -1 // a: Address');

            if (['local', 'global'].includes(storageType) && method === 'Exists')
              expectedTeal.push('txna Applications 0');

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
              if (storageType === 'box' && storageClass === 'Key') {
                expectedTeal.push('// box value does not exist: this.boxKey.value', 'assert');
              }

              if (storageType === 'box' && storageClass === 'Map') {
                expectedTeal.push("// box value does not exist: this.boxMap('foo').value", 'assert');
              }
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
      const compiler = new Compiler({
        project: TESTS_PROJECT,
        className,
        cwd: process.cwd(),
        srcPath: sourcePath,
        disableWarnings: true,
      });
      await compiler.compile();
      await compiler.algodCompile();

      const sender = algokit.getLocalNetDispenserAccount(algodClient, kmdClient);

      appClient = algokit.getAppClient(
        {
          app: JSON.stringify(compiler.arc32Description()),
          sender: await sender,
          resolveBy: 'id',
          id: 0,
        },
        algodClient
      );

      await appClient.create({
        method: 'createApplication',
        methodArgs: [],
        sendParams: SEND_PARAMS,
      });
    });

    test('boxKeyCreate', async () => {
      await appClient.fundAppAccount({
        amount: algokit.microAlgos(513300),
        sendParams: SEND_PARAMS,
      });
      const box = new Uint8Array(Buffer.from('foo'));

      await appClient.call({
        method: 'boxKeyCreate',
        methodArgs: [],
        sendParams: SEND_PARAMS,
      });

      expect((await appClient.getBoxValue(box)).byteLength).toEqual(1024);
    });

    test('boxKeyLength', async () => {
      const result = await appClient.call({
        method: 'boxKeyLength',
        methodArgs: [],
        sendParams: SEND_PARAMS,
      });

      expect(result.return?.returnValue).toEqual(1024n);
    });

    test('boxKeyReplace', async () => {
      const box = new Uint8Array(Buffer.from('foo'));

      await appClient.call({
        method: 'boxKeyReplace',
        methodArgs: [],
        sendParams: SEND_PARAMS,
      });

      expect((await appClient.getBoxValue(box)).slice(0, 3)).toEqual(new Uint8Array(Buffer.from('abc')));
    });

    test('boxKeyExtract', async () => {
      const result = await appClient.call({
        method: 'boxKeyExtract',
        methodArgs: [],
        sendParams: SEND_PARAMS,
      });

      expect(result.return?.returnValue as string).toEqual('abc');
    });

    test('boxMapCreate', async () => {
      await appClient.fundAppAccount({
        amount: algokit.microAlgos(513300),
        sendParams: SEND_PARAMS,
      });
      const box = new Uint8Array(Buffer.from('bar'));

      await appClient.call({
        method: 'boxMapCreate',
        methodArgs: [],
        sendParams: SEND_PARAMS,
      });

      expect((await appClient.getBoxValue(box)).byteLength).toEqual(1024);
    });

    test('boxMapLength', async () => {
      const result = await appClient.call({
        method: 'boxMapLength',
        methodArgs: [],
        sendParams: SEND_PARAMS,
      });

      expect(result.return?.returnValue).toEqual(1024n);
    });

    test('boxMapReplace', async () => {
      const box = new Uint8Array(Buffer.from('bar'));

      await appClient.call({
        method: 'boxMapReplace',
        methodArgs: [],
        sendParams: SEND_PARAMS,
      });

      expect((await appClient.getBoxValue(box)).slice(0, 3)).toEqual(new Uint8Array(Buffer.from('abc')));
    });

    test('boxMapExtract', async () => {
      const result = await appClient.call({
        method: 'boxMapExtract',
        methodArgs: [],
        sendParams: SEND_PARAMS,
      });

      expect(result.return?.returnValue as string).toEqual('abc');
    });

    test('accessStaticValueInLargeBox', async () => {
      const box = new Uint8Array(Buffer.from('largeStaticArrayInBox'));
      await appClient.fundAppAccount({
        amount: algokit.microAlgos(3310900),
        sendParams: SEND_PARAMS,
      });

      const result = await appClient.call({
        method: 'accessStaticValueInLargeBox',
        methodArgs: [],
        boxes: [
          { appIndex: 0, name: box },
          { appIndex: 0, name: box },
          { appIndex: 0, name: box },
          { appIndex: 0, name: box },
          { appIndex: 0, name: box },
          { appIndex: 0, name: box },
          { appIndex: 0, name: box },
          { appIndex: 0, name: box },
        ],
        sendParams: SEND_PARAMS,
      });

      expect(result.return?.returnValue?.valueOf()).toEqual(456n);
    });

    test('dynamicAccessStaticValueInLargeBox', async () => {
      const box = new Uint8Array(Buffer.from('largeStaticArrayInBox'));
      await appClient.fundAppAccount({
        amount: algokit.microAlgos(3310900),
        sendParams: SEND_PARAMS,
      });

      const result = await appClient.call({
        method: 'dynamicAccessStaticValueInLargeBox',
        methodArgs: [123n],
        boxes: [
          { appIndex: 0, name: box },
          { appIndex: 0, name: box },
          { appIndex: 0, name: box },
          { appIndex: 0, name: box },
          { appIndex: 0, name: box },
          { appIndex: 0, name: box },
          { appIndex: 0, name: box },
          { appIndex: 0, name: box },
        ],
        sendParams: SEND_PARAMS,
      });

      expect(result.return?.returnValue?.valueOf()).toEqual(456n);
    });
  });

  describe('Compile Errors', function () {
    test('MapSizeCollision', async function () {
      let msg: string;
      try {
        await compileAndCreate(
          algosdk.generateAccount(),
          'tests/contracts/storage_compile_errors.algo.ts',
          ARTIFACTS_DIR,
          'MapSizeCollision'
        );
        msg = 'No error';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        msg = e.message;
      }

      expect(msg).toMatch('Prefix must be defined for "uint16" due to potential collision with "uint8s"');
    });

    test('KeyCollisionWithMap', async function () {
      let msg: string;
      try {
        await compileAndCreate(
          algosdk.generateAccount(),
          'tests/contracts/storage_compile_errors.algo.ts',
          ARTIFACTS_DIR,
          'KeyCollisionWithMap'
        );
        msg = 'No error';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        msg = e.message;
      }

      expect(msg).toMatch(
        '"globalKey" has a potential key collision with "globalMap". "globalMap" must have a prefix or "globalKey" must have a different key name'
      );
    });

    test('MapCollisionWithKey', async function () {
      let msg: string;
      try {
        await compileAndCreate(
          algosdk.generateAccount(),
          'tests/contracts/storage_compile_errors.algo.ts',
          ARTIFACTS_DIR,
          'MapCollisionWithKey'
        );
        msg = 'No error';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        msg = e.message;
      }

      expect(msg).toMatch('Prefix must be defined for "globalMap" due to potential collision with "globalKey"');
    });
  });
});
