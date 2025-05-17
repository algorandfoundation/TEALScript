/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import * as algokit from '@algorandfoundation/algokit-utils';
// eslint-disable-next-line import/no-unresolved
import { ApplicationClient } from '@algorandfoundation/algokit-utils/types/app-client';
import path from 'path';
import { describe, test, expect } from '@jest/globals';
import algosdk from 'algosdk';
import {
  algodClient,
  kmdClient,
  compileAndCreate as commonCompileAndCreate,
  runMethod as commonRunMethod,
} from './common';

const ARTIFACTS_PATH = path.join(__dirname, 'contracts', 'artifacts');

const sender = algokit.getLocalNetDispenserAccount(algodClient, kmdClient);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function compileAndCreate(name: string): Promise<{
  appClient: ApplicationClient;
  appId: number | bigint;
}> {
  const className = `ABITest${name.charAt(0).toUpperCase() + name.slice(1)}`;

  return commonCompileAndCreate(await sender, `tests/contracts/abi.algo.ts`, ARTIFACTS_PATH, className);
}

async function runMethod(appClient: ApplicationClient, name: string, methodArgs: algosdk.ABIArgument[] = []) {
  let fundAmount = 0;
  let callType: 'call' | 'optIn' = 'call';

  if (name.includes('Storage') || name.includes('RefAccount') || name.includes('InBox')) {
    fundAmount = 1780900;
    if (name.includes('Storage') || name.includes('RefAccount')) callType = 'optIn';
  }

  return commonRunMethod({ appClient, method: name, methodArgs, fundAmount, callType, fee: 2_000 });
}

describe('ABI', function () {
  describe('E2E', function () {
    test('staticArray', async function () {
      const { appClient } = await compileAndCreate('staticArray');
      expect(await runMethod(appClient, 'staticArray')).toEqual(BigInt(22));
    });

    test('returnStaticArray', async function () {
      const { appClient } = await compileAndCreate('returnStaticArray');
      expect(await runMethod(appClient, 'returnStaticArray')).toEqual([BigInt(11), BigInt(22), BigInt(33)]);
    });

    test('staticArrayArg', async function () {
      const { appClient } = await compileAndCreate('staticArrayArg');
      const ret = await runMethod(appClient, 'staticArrayArg', [[BigInt(11), BigInt(22), BigInt(33)]]);
      expect(ret).toEqual(BigInt(22));
    });

    test('nonLiteralStaticArrayElements', async function () {
      const { appClient } = await compileAndCreate('nonLiteralStaticArrayElements');
      expect(await runMethod(appClient, 'nonLiteralStaticArrayElements')).toEqual(BigInt(22));
    });

    test('mixedStaticArrayElements', async function () {
      const { appClient } = await compileAndCreate('mixedStaticArrayElements');
      expect(await runMethod(appClient, 'mixedStaticArrayElements')).toEqual(BigInt(1 + 4 + 7));
    });

    test('nonLiteralStaticArrayAccess', async function () {
      const { appClient } = await compileAndCreate('nonLiteralStaticArrayAccess');
      expect(await runMethod(appClient, 'nonLiteralStaticArrayAccess')).toEqual(BigInt(33));
    });

    test('setStaticArrayElement', async function () {
      const { appClient } = await compileAndCreate('setStaticArrayElement');
      expect(await runMethod(appClient, 'setStaticArrayElement')).toEqual(BigInt(222));
    });

    test('staticArrayInStorageRef', async function () {
      const { appClient } = await compileAndCreate('staticArrayInStorageRef');
      const ret = await runMethod(appClient, 'staticArrayInStorageRef');
      expect(ret).toEqual([BigInt(22), BigInt(22), BigInt(22)]);
    });

    test('updateStaticArrayInStorageRef', async function () {
      const { appClient } = await compileAndCreate('updateStaticArrayInStorageRef');
      const ret = await runMethod(appClient, 'updateStaticArrayInStorageRef');
      expect(ret).toEqual([BigInt(111), BigInt(222), BigInt(333)]);
    });

    test('staticArrayInStorageMap', async function () {
      const { appClient } = await compileAndCreate('staticArrayInStorageMap');
      const ret = await runMethod(appClient, 'staticArrayInStorageMap');
      expect(ret).toEqual([BigInt(22), BigInt(22), BigInt(22)]);
    });

    test('updateStaticArrayInStorageMap', async function () {
      const { appClient } = await compileAndCreate('updateStaticArrayInStorageMap');
      const ret = await runMethod(appClient, 'updateStaticArrayInStorageMap');
      expect(ret).toEqual([BigInt(1111), BigInt(2222), BigInt(3333)]);
    });

    test('nestedStaticArray', async function () {
      const { appClient } = await compileAndCreate('nestedStaticArray');
      expect(await runMethod(appClient, 'nestedStaticArray')).toEqual(BigInt(55));
    });

    test('updateNestedStaticArrayElement', async function () {
      const { appClient } = await compileAndCreate('updateNestedStaticArrayElement');
      expect(await runMethod(appClient, 'updateNestedStaticArrayElement')).toEqual(BigInt(555));
    });

    test('updateNestedStaticArray', async function () {
      const { appClient } = await compileAndCreate('updateNestedStaticArray');
      expect(await runMethod(appClient, 'updateNestedStaticArray')).toEqual(BigInt(555));
    });

    test('threeDimensionalUint16Array', async function () {
      const { appClient } = await compileAndCreate('threeDimensionalUint16Array');
      expect(await runMethod(appClient, 'threeDimensionalUint16Array')).toEqual(BigInt(888));
    });

    test('simpleTuple', async function () {
      const { appClient } = await compileAndCreate('simpleTuple');
      expect(await runMethod(appClient, 'simpleTuple')).toEqual(BigInt(44));
    });

    test('arrayInTuple', async function () {
      const { appClient } = await compileAndCreate('arrayInTuple');
      expect(await runMethod(appClient, 'arrayInTuple')).toEqual(BigInt(44));
    });

    test('tupleInArray', async function () {
      const { appClient } = await compileAndCreate('tupleInArray');
      expect(await runMethod(appClient, 'tupleInArray')).toEqual(BigInt(44));
    });

    test('tupleInTuple', async function () {
      const { appClient } = await compileAndCreate('tupleInTuple');
      expect(await runMethod(appClient, 'tupleInTuple')).toEqual(BigInt(66));
    });

    test('shortTypeNotation', async function () {
      const { appClient } = await compileAndCreate('shortTypeNotation');
      expect(await runMethod(appClient, 'shortTypeNotation')).toEqual(BigInt(66));
    });

    test('disgusting', async function () {
      const { appClient } = await compileAndCreate('disgusting');
      expect(await runMethod(appClient, 'disgusting')).toEqual(BigInt(8888));
    });

    test('returnTuple', async function () {
      const { appClient } = await compileAndCreate('returnTuple');
      expect(await runMethod(appClient, 'returnTuple')).toEqual([BigInt(11), BigInt(22), BigInt(33)]);
    });

    test('tupleArg', async function () {
      const { appClient } = await compileAndCreate('tupleArg');
      const ret = await runMethod(appClient, 'tupleArg', [[BigInt(11), BigInt(22), BigInt(33)]]);
      expect(ret).toEqual(BigInt(22));
    });

    test('dynamicArray', async function () {
      const { appClient } = await compileAndCreate('dynamicArray');
      expect(await runMethod(appClient, 'dynamicArray')).toEqual(BigInt(22));
    });

    test('returnDynamicArray', async function () {
      const { appClient } = await compileAndCreate('returnDynamicArray');
      expect(await runMethod(appClient, 'returnDynamicArray')).toEqual([BigInt(11), BigInt(22), BigInt(33)]);
    });

    test('dynamicArrayArg', async function () {
      const { appClient } = await compileAndCreate('dynamicArrayArg');
      const ret = await runMethod(appClient, 'dynamicArrayArg', [[BigInt(11), BigInt(22), BigInt(33)]]);
      expect(ret).toEqual(BigInt(22));
    });

    test('updateDynamicArrayElement', async function () {
      const { appClient } = await compileAndCreate('updateDynamicArrayElement');
      expect(await runMethod(appClient, 'updateDynamicArrayElement')).toEqual(BigInt(222));
    });

    test('dynamicTupleArray', async function () {
      const { appClient } = await compileAndCreate('dynamicTupleArray');
      expect(await runMethod(appClient, 'dynamicTupleArray')).toEqual(BigInt(44));
    });

    test('returnTupleWithDyamicArray', async function () {
      const { appClient } = await compileAndCreate('returnTupleWithDyamicArray');
      expect(await runMethod(appClient, 'returnTupleWithDyamicArray')).toEqual([
        BigInt(1),
        BigInt(2),
        [BigInt(3), BigInt(4)],
        [BigInt(5), BigInt(6)],
      ]);
    });

    test('returnDynamicArrayFromTuple', async function () {
      const { appClient } = await compileAndCreate('returnDynamicArrayFromTuple');
      expect(await runMethod(appClient, 'returnDynamicArrayFromTuple')).toEqual([BigInt(7), BigInt(8)]);
    });

    test('updateDynamicArrayInTuple', async function () {
      const { appClient } = await compileAndCreate('updateDynamicArrayInTuple');
      const a: { old: BigInt[] | BigInt; new: BigInt[] | BigInt }[] = [
        { old: BigInt(9), new: BigInt(99) },
        { old: [BigInt(8)], new: [BigInt(10), BigInt(11)] },
        { old: [BigInt(7)], new: [BigInt(12), BigInt(13)] },
        { old: [BigInt(6)], new: [BigInt(14), BigInt(15)] },
        { old: [BigInt(5)], new: [BigInt(16), BigInt(17)] },
      ];

      expect(await runMethod(appClient, 'updateDynamicArrayInTuple')).toEqual([
        a[0].new,
        a[1].new,
        a[2].new,
        a[3].new,
        a[4].new,
      ]);
    });

    test('nonLiteralDynamicElementInTuple', async function () {
      const { appClient } = await compileAndCreate('nonLiteralDynamicElementInTuple');
      expect(await runMethod(appClient, 'nonLiteralDynamicElementInTuple')).toEqual([
        BigInt(1),
        BigInt(2),
        [BigInt(3), BigInt(4)],
        [BigInt(5), BigInt(6)],
        [BigInt(7), BigInt(8)],
      ]);
    });

    test('arrayPush', async function () {
      const { appClient } = await compileAndCreate('arrayPush');
      expect(await runMethod(appClient, 'arrayPush')).toEqual([BigInt(1), BigInt(2), BigInt(3)]);
    });

    test('arrayPop', async function () {
      const { appClient } = await compileAndCreate('arrayPop');
      expect(await runMethod(appClient, 'arrayPop')).toEqual([BigInt(1), BigInt(2)]);
    });

    test('arrayPopValue', async function () {
      const { appClient } = await compileAndCreate('arrayPopValue');
      expect(await runMethod(appClient, 'arrayPopValue')).toEqual(BigInt(3));
    });

    test('arraySplice', async function () {
      const { appClient } = await compileAndCreate('arraySplice');
      expect(await runMethod(appClient, 'arraySplice')).toEqual([1, 3].map((n) => BigInt(n)));
    });

    test('arraySpliceValue', async function () {
      const { appClient } = await compileAndCreate('arraySpliceValue');
      expect(await runMethod(appClient, 'arraySpliceValue')).toEqual([2, 3, 4, 5, 6, 7, 8].map((n) => BigInt(n)));
    });

    test('dynamicArrayElements', async function () {
      const { appClient } = await compileAndCreate('dynamicArrayElements');
      expect(await runMethod(appClient, 'dynamicArrayElements')).toEqual([1, 2, 3].map((n) => BigInt(n)));
    });

    test('spliceLastElement', async function () {
      const { appClient } = await compileAndCreate('spliceLastElement');
      expect(await runMethod(appClient, 'spliceLastElement')).toEqual([1, 2].map((n) => BigInt(n)));
    });

    test('spliceLastElementValue', async function () {
      const { appClient } = await compileAndCreate('spliceLastElementValue');
      expect(await runMethod(appClient, 'spliceLastElementValue')).toEqual([3].map((n) => BigInt(n)));
    });

    test('spliceFirstElement', async function () {
      const { appClient } = await compileAndCreate('spliceFirstElement');
      expect(await runMethod(appClient, 'spliceFirstElement')).toEqual([2, 3].map((n) => BigInt(n)));
    });

    test('spliceFirstElementValue', async function () {
      const { appClient } = await compileAndCreate('spliceFirstElementValue');
      expect(await runMethod(appClient, 'spliceFirstElementValue')).toEqual([1].map((n) => BigInt(n)));
    });

    test('stringReturn', async function () {
      const { appClient } = await compileAndCreate('stringReturn');
      const s = 'Hello World!';
      expect(await runMethod(appClient, 'stringReturn')).toEqual(s);
    });

    test('stringArg', async function () {
      const { appClient } = await compileAndCreate('stringArg');
      const s = 'Hello World!';
      await runMethod(appClient, 'stringArg', [s]);
      // asert is in contract
    });

    test('stringInTuple', async function () {
      const { appClient } = await compileAndCreate('stringInTuple');
      const s = 'Hello World!';
      expect(await runMethod(appClient, 'stringInTuple')).toEqual([BigInt(1), [BigInt(2)], s, [BigInt(3)]]);
    });

    test('accesStringInTuple', async function () {
      const { appClient } = await compileAndCreate('accesStringInTuple');
      const s = 'Hello World!';
      expect(await runMethod(appClient, 'accesStringInTuple')).toEqual(s);
    });

    test('updateStringInTuple', async function () {
      const { appClient } = await compileAndCreate('updateStringInTuple');
      const a = [
        { old: BigInt(9), new: BigInt(99) },
        { old: [BigInt(8)], new: [BigInt(10), BigInt(11)] },
        { old: 'Hi?', new: 'Hello World!' },
        { old: [BigInt(6)], new: [BigInt(14), BigInt(15)] },
        { old: [BigInt(5)], new: [BigInt(16), BigInt(17)] },
      ];

      expect(await runMethod(appClient, 'updateStringInTuple')).toEqual([
        a[0].new,
        a[1].new,
        a[2].new,
        a[3].new,
        a[4].new,
      ]);
    });

    test('updateTupleWithOnlyDynamicTypes', async function () {
      const { appClient } = await compileAndCreate('updateTupleWithOnlyDynamicTypes');
      expect(await runMethod(appClient, 'updateTupleWithOnlyDynamicTypes')).toEqual([
        [BigInt(4), BigInt(5)],
        [BigInt(6), BigInt(7)],
        [BigInt(8), BigInt(9)],
      ]);
    });

    test('shortenDynamicElementInTuple', async function () {
      const { appClient } = await compileAndCreate('shortenDynamicElementInTuple');
      expect(await runMethod(appClient, 'shortenDynamicElementInTuple')).toEqual([
        [BigInt(5)],
        [BigInt(6)],
        [BigInt(7)],
      ]);
    });

    test('namedTuple', async function () {
      const { appClient } = await compileAndCreate('namedTuple');
      expect(await runMethod(appClient, 'namedTuple')).toEqual('Hello World!');
    });

    test('updateNamedTuple', async function () {
      const { appClient } = await compileAndCreate('updateNamedTuple');
      expect(await runMethod(appClient, 'updateNamedTuple')).toEqual('Hello World!');
    });

    test('customTypes', async function () {
      const { appClient } = await compileAndCreate('customTypes');
      expect(await runMethod(appClient, 'customTypes')).toEqual('Hello World!');
    });

    test('staticStringArrayArg', async function () {
      const { appClient } = await compileAndCreate('staticStringArrayArg');
      const ret = await runMethod(appClient, 'staticStringArrayArg', [['Hello', 'World', '!']]);
      expect(ret).toEqual('World');
    });

    test('dynamicAccessOfDynamicElementInStaticArray', async function () {
      const { appClient } = await compileAndCreate('dynamicAccessOfDynamicElementInStaticArray');
      const ret = await runMethod(appClient, 'dynamicAccessOfDynamicElementInStaticArray', [['Hello', 'World', '!']]);
      expect(ret).toEqual('World');
    });

    test('dynamicArrayInMiddleOfTuple', async function () {
      const { appClient } = await compileAndCreate('dynamicArrayInMiddleOfTuple');
      expect(await runMethod(appClient, 'dynamicArrayInMiddleOfTuple')).toEqual([BigInt(1), [BigInt(2)], BigInt(3)]);
    });

    test('accessDynamicArrayInMiddleOfTuple', async function () {
      const { appClient } = await compileAndCreate('accessDynamicArrayInMiddleOfTuple');
      expect(await runMethod(appClient, 'accessDynamicArrayInMiddleOfTuple')).toEqual([BigInt(2)]);
    });

    test('accessDynamicArrayElementInTuple', async function () {
      const { appClient } = await compileAndCreate('accessDynamicArrayElementInTuple');
      expect(await runMethod(appClient, 'accessDynamicArrayElementInTuple')).toEqual(BigInt(33));
    });

    test('updateDynamicArrayInMiddleOfTuple', async function () {
      const { appClient } = await compileAndCreate('updateDynamicArrayInMiddleOfTuple');
      expect(await runMethod(appClient, 'updateDynamicArrayInMiddleOfTuple')).toEqual([
        BigInt(1),
        [BigInt(4), BigInt(5)],
        BigInt(3),
      ]);
    });

    test('nestedTuple', async function () {
      const { appClient } = await compileAndCreate('nestedTuple');
      expect(await runMethod(appClient, 'nestedTuple')).toEqual([11n, [22n, 'foo'], [33n, 'bar']]);
    });

    test('updateDynamicElementInTupleWithSameLength', async function () {
      const { appClient } = await compileAndCreate('updateDynamicElementInTupleWithSameLength');
      expect(await runMethod(appClient, 'updateDynamicElementInTupleWithSameLength')).toEqual([
        1n,
        [10n, 11n, 12n],
        5n,
        [6n, 7n, 8n],
        9n,
      ]);
    });

    test('accessDynamicStringArray', async function () {
      const { appClient } = await compileAndCreate('accessDynamicStringArray');
      expect(await runMethod(appClient, 'accessDynamicStringArray')).toEqual('World');
    });

    test('txnTypes', async function () {
      await compileAndCreate('txnTypes');
    });

    test('arrayLength', async () => {
      const { appClient } = await compileAndCreate('arrayLength');
      expect(await runMethod(appClient, 'arrayLength')).toEqual(BigInt(5));
    });

    test('stringLength', async () => {
      const { appClient } = await compileAndCreate('stringLength');
      expect(await runMethod(appClient, 'stringLength')).toEqual(BigInt(7));
    });
    test('arrayRef', async () => {
      const { appClient } = await compileAndCreate('arrayRef');

      expect(await runMethod(appClient, 'arrayRef')).toEqual([1n, 4n, 3n]);
    });

    test('nestedArrayRef', async () => {
      const { appClient } = await compileAndCreate('nestedArrayRef');

      expect(await runMethod(appClient, 'nestedArrayRef')).toEqual([
        [1n, 2n],
        [3n, 5n],
      ]);
    });

    test('nonLiteralNestedArrayRef', async () => {
      const { appClient } = await compileAndCreate('nonLiteralNestedArrayRef');

      expect(await runMethod(appClient, 'nonLiteralNestedArrayRef')).toEqual([
        [1n, 2n],
        [3n, 5n],
      ]);
    });

    test('multiNestedArrayRef', async () => {
      const { appClient } = await compileAndCreate('multiNestedArrayRef');

      expect(await runMethod(appClient, 'multiNestedArrayRef')).toEqual([
        [
          [1n, 2n],
          [3n, 4n],
        ],
        [
          [5n, 6n],
          [7n, 9n],
        ],
      ]);
    });

    test('objectArrayRef', async () => {
      const { appClient } = await compileAndCreate('objectArrayRef');

      expect(await runMethod(appClient, 'objectArrayRef')).toEqual([
        [
          [1n, 2n],
          [3n, 5n],
        ],
      ]);
    });

    test('stringAccessor', async () => {
      const { appClient } = await compileAndCreate('stringAccessor');

      expect(await runMethod(appClient, 'stringAccessor')).toEqual('e');
    });

    test('emptyStaticArray', async () => {
      const { appClient } = await compileAndCreate('emptyStaticArray');

      expect(await runMethod(appClient, 'emptyStaticArray')).toEqual([0n, 0n, 0n]);
    });

    test('partialStaticArray', async () => {
      const { appClient } = await compileAndCreate('partialStaticArray');

      expect(await runMethod(appClient, 'partialStaticArray')).toEqual([1n, 0n, 0n]);
    });

    test('emptyDynamicArray', async () => {
      const { appClient } = await compileAndCreate('emptyDynamicArray');

      expect(await runMethod(appClient, 'emptyDynamicArray')).toEqual([]);
    });
    test('booleanArgAndReturn', async () => {
      const { appClient } = await compileAndCreate('booleanArgAndReturn');

      expect(await runMethod(appClient, 'booleanArgAndReturn', [true])).toEqual(true);

      expect(await runMethod(appClient, 'booleanArgAndReturn', [false])).toEqual(false);
    });

    test('boolTuple', async () => {
      const { appClient } = await compileAndCreate('boolTuple');

      expect(await runMethod(appClient, 'boolTuple')).toEqual([
        true,
        false,
        true,
        true,
        false,
        false,
        true,
        false,
        false,
      ]);
    });

    test('staticBoolArray', async () => {
      const { appClient } = await compileAndCreate('staticBoolArray');

      expect(await runMethod(appClient, 'staticBoolArray')).toEqual([
        true,
        false,
        true,
        true,
        false,
        false,
        true,
        false,
        false,
      ]);
    });

    test('boolTupleAccess', async () => {
      const { appClient } = await compileAndCreate('boolTupleAccess');

      expect(await runMethod(appClient, 'boolTupleAccess')).toEqual(true);
    });

    test('staticBoolArrayAccess', async () => {
      const { appClient } = await compileAndCreate('staticBoolArrayAccess');

      expect(await runMethod(appClient, 'staticBoolArrayAccess')).toEqual(false);
    });

    test('dynamicBoolArray', async () => {
      const { appClient } = await compileAndCreate('dynamicBoolArray');

      expect(await runMethod(appClient, 'dynamicBoolArray')).toEqual([
        true,
        false,
        true,
        true,
        false,
        false,
        true,
        false,
        false,
      ]);
    });

    test('dynamicBoolArrayAccess', async () => {
      const { appClient } = await compileAndCreate('dynamicBoolArrayAccess');

      expect(await runMethod(appClient, 'dynamicBoolArrayAccess')).toEqual(false);
    });

    test('staticBoolArrayUpdate', async () => {
      const { appClient } = await compileAndCreate('staticBoolArrayUpdate');

      expect(await runMethod(appClient, 'staticBoolArrayUpdate')).toEqual([
        true,
        false,
        true,
        true,
        false,
        false,
        true,
        false,
        true,
      ]);
    });

    test('dynamicBoolArrayUpdate', async () => {
      const { appClient } = await compileAndCreate('dynamicBoolArrayUpdate');

      expect(await runMethod(appClient, 'dynamicBoolArrayUpdate')).toEqual([
        true,
        false,
        true,
        true,
        false,
        false,
        true,
        false,
        true,
      ]);
    });

    test('boolTupleUpdate', async () => {
      const { appClient } = await compileAndCreate('boolTupleUpdate');

      expect(await runMethod(appClient, 'boolTupleUpdate')).toEqual([
        true,
        false,
        true,
        true,
        false,
        false,
        true,
        false,
        true,
      ]);
    });

    test('objectRef', async () => {
      const { appClient } = await compileAndCreate('objectRef');

      expect(await runMethod(appClient, 'objectRef')).toEqual([2n]);
    });

    test('storageRefKey', async () => {
      const { appClient } = await compileAndCreate('storageRefKey');

      expect(await runMethod(appClient, 'storageRefKey')).toEqual(4n);
    });

    test('storageRefAccount', async () => {
      const { appClient } = await compileAndCreate('storageRefAccount');

      expect(await runMethod(appClient, 'storageRefAccount')).toEqual(4n);
    });

    test('angularCasting', async () => {
      const { appClient } = await compileAndCreate('angularCasting');

      expect(await runMethod(appClient, 'angularCasting')).toEqual(1337n);
    });

    test('castBytesFunction', async () => {
      const { appClient } = await compileAndCreate('castBytesFunction');

      expect(await runMethod(appClient, 'castBytesFunction')).toEqual([1n, 2n, 3n]);
    });

    test('rawBytesFunction', async () => {
      const { appClient } = await compileAndCreate('rawBytesFunction');

      expect(await runMethod(appClient, 'rawBytesFunction')).toEqual(Buffer.from('010203', 'hex').toString());
    });

    test('globalMethodInChain', async () => {
      const { appClient } = await compileAndCreate('globalMethodInChain');

      expect(await runMethod(appClient, 'globalMethodInChain')).toEqual(0n);
    });

    test('opcodeParamFromObject', async () => {
      const { appClient, appId } = await compileAndCreate('opcodeParamFromObject');

      expect(await runMethod(appClient, 'opcodeParamFromObject')).toEqual(algosdk.getApplicationAddress(appId));
    });

    test('arrayInObjectInState', async () => {
      const { appClient } = await compileAndCreate('arrayInObjectInState');

      expect(await runMethod(appClient, 'arrayInObjectInState')).toEqual(3n);
    });

    test('nestedObject', async () => {
      const { appClient } = await compileAndCreate('nestedObject');

      expect(await runMethod(appClient, 'nestedObject')).toEqual(2n);
    });

    test('updateArrayRefInBoxStorage', async () => {
      const { appClient } = await compileAndCreate('updateArrayRefInBoxStorage');

      expect(await runMethod(appClient, 'updateArrayRefInBoxStorage')).toEqual([3n, 2n]);
    });

    test('extractUint', async () => {
      const { appClient } = await compileAndCreate('extractUint');

      expect(await runMethod(appClient, 'extractUint', [1])).toEqual(1n);
    });

    test('bytesReturn', async () => {
      const { appClient } = await compileAndCreate('bytesReturn');

      expect(await runMethod(appClient, 'bytesReturn')).toEqual([...Buffer.from('foo')]);
    });

    test('nestedTypesInSignature', async () => {
      const { appClient } = await compileAndCreate('nestedTypesInSignature');

      expect(await runMethod(appClient, 'nestedTypesInSignature')).toEqual([[0n, 0n], 0n]);
    });

    test('maxUfixed', async () => {
      const { appClient } = await compileAndCreate('maxUfixed');

      expect(await runMethod(appClient, 'maxUfixed')).toEqual(1234n);
    });

    test('chainedPropertyAfterTuple', async () => {
      const { appClient } = await compileAndCreate('chainedPropertyAfterTuple');

      await runMethod(appClient, 'chainedPropertyAfterTuple', [1337]);
    });

    test('uintCasting', async () => {
      const { appClient } = await compileAndCreate('uintCasting');

      expect(await runMethod(appClient, 'uintCasting', [7])).toBe(7n);
    });

    test('uint64Casting', async () => {
      const { appClient } = await compileAndCreate('uint64Casting');

      expect(await runMethod(appClient, 'uint64Casting', [7])).toBe(7n);
    });

    test('bytesCasting', async () => {
      const { appClient } = await compileAndCreate('bytesCasting');

      expect(await runMethod(appClient, 'bytesCasting', [[1]])).toEqual([1, 0]);
    });

    test('biggerByteCasting', async () => {
      const { appClient } = await compileAndCreate('biggerByteCasting');

      expect(await runMethod(appClient, 'biggerByteCasting', [[1, 1]])).toEqual([1, 1, 0, 0]);
    });

    test('smallerByteCasting', async () => {
      const { appClient } = await compileAndCreate('smallerByteCasting');

      expect(await runMethod(appClient, 'smallerByteCasting', [[1, 0, 0, 0]])).toEqual([1, 0]);
    });

    test('multiBytesTuple', async () => {
      const { appClient } = await compileAndCreate('multiBytesTuple');

      expect(await runMethod(appClient, 'multiBytesTuple')).toEqual([[1], [2]]);
    });

    test('boolInObj', async () => {
      const { appClient } = await compileAndCreate('boolInObj');

      await runMethod(appClient, 'boolInObj');
    });

    test('plusEqualsArrayValue', async () => {
      const { appClient } = await compileAndCreate('plusEqualsArrayValue');

      expect(await runMethod(appClient, 'plusEqualsArrayValue')).toEqual([1n, 3n]);
    });

    test('plusEqualsObjValue', async () => {
      const { appClient } = await compileAndCreate('plusEqualsObjValue');

      expect(await runMethod(appClient, 'plusEqualsObjValue')).toEqual([3n, 5n]);
    });

    test('plusEqualsObjValueInBox', async () => {
      const { appClient } = await compileAndCreate('plusEqualsObjValueInBox');

      expect(await runMethod(appClient, 'plusEqualsObjValueInBox')).toEqual([3n, 5n]);
    });

    test('uintNComparison', async () => {
      const { appClient } = await compileAndCreate('uintNComparison');

      expect(await runMethod(appClient, 'uintNComparison', [2n, 2n])).toEqual(true);
      expect(await runMethod(appClient, 'uintNComparison', [1n, 2n])).toEqual(false);
      expect(await runMethod(appClient, 'uintNComparison', [2n, 1n])).toEqual(true);
    });

    test('booleanLastInObj', async () => {
      const { appClient } = await compileAndCreate('booleanLastInObj');

      expect(await runMethod(appClient, 'booleanLastInObj')).toEqual([1n, false]);
    });

    test('nestedStructInBoxMap', async () => {
      const { appClient } = await compileAndCreate('nestedStructInBoxMap');

      expect(await runMethod(appClient, 'nestedStructInBoxMap')).toEqual([[2n]]);
    });

    test('staticForEach', async () => {
      const { appClient } = await compileAndCreate('staticForEach');

      expect(await runMethod(appClient, 'staticForEach')).toEqual(6n);
    });

    test('nestedStaticForEach', async () => {
      const { appClient } = await compileAndCreate('nestedStaticForEach');

      expect(await runMethod(appClient, 'nestedStaticForEach')).toEqual(15n);
    });

    test('nestedStaticForEachInBox', async () => {
      const { appClient } = await compileAndCreate('nestedStaticForEachInBox');

      expect(await runMethod(appClient, 'nestedStaticForEachInBox')).toEqual(15n);
    });

    test('largeNestedStaticForEachInBox', async () => {
      const { appClient } = await compileAndCreate('largeNestedStaticForEachInBox');

      expect(await runMethod(appClient, 'largeNestedStaticForEachInBox')).toEqual(65n);
    });

    test('forEachReturn', async () => {
      const { appClient } = await compileAndCreate('forEachReturn');

      expect(await runMethod(appClient, 'forEachReturn')).toEqual(3n);
    });

    test('staticArrayLength', async () => {
      const { appClient } = await compileAndCreate('staticArrayLength');

      expect(await runMethod(appClient, 'staticArrayLength')).toEqual(5n);
    });

    test('objectInArgs', async () => {
      const { appClient } = await compileAndCreate('objectInArgs');

      expect(await runMethod(appClient, 'objectInArgs')).toEqual(3n);
    });

    test('nestedStaticArrayLength', async () => {
      const { appClient } = await compileAndCreate('nestedStaticArrayLength');

      expect(await runMethod(appClient, 'nestedStaticArrayLength')).toEqual(5n);
    });

    test('nestedArrayLengthInObjectVariable', async () => {
      const { appClient } = await compileAndCreate('nestedArrayLengthInObjectVariable');

      expect(await runMethod(appClient, 'nestedArrayLengthInObjectVariable')).toEqual(5n);
    });
  });

  test('staticForOf', async () => {
    const { appClient } = await compileAndCreate('staticForOf');

    expect(await runMethod(appClient, 'staticForOf')).toEqual(6n);
  });

  test('largeNestedStaticForOfInBox', async () => {
    const { appClient } = await compileAndCreate('largeNestedStaticForOfInBox');

    expect(await runMethod(appClient, 'largeNestedStaticForOfInBox')).toEqual(65n);
  });

  test('forOfContinue', async () => {
    const { appClient } = await compileAndCreate('forOfContinue');

    expect(await runMethod(appClient, 'forOfContinue')).toEqual(3n);
  });

  test('forOfBreak', async () => {
    const { appClient } = await compileAndCreate('forOfBreak');

    expect(await runMethod(appClient, 'forOfBreak')).toEqual(3n);
  });

  test('accessStaticArrayInBoxInVariable', async () => {
    const { appClient } = await compileAndCreate('accessStaticArrayInBoxInVariable');

    expect(await runMethod(appClient, 'accessStaticArrayInBoxInVariable')).toEqual(1n);
  });

  test('staticTypeInBox', async () => {
    const { appClient } = await compileAndCreate('staticTypeInBox');

    await runMethod(appClient, 'staticTypeInBox');
  });

  test('storagePropertyReferenceInBox', async () => {
    const { appClient } = await compileAndCreate('storagePropertyReferenceInBox');

    expect(await runMethod(appClient, 'storagePropertyReferenceInBox')).toEqual(1337n);
  });

  test('pushToArrayInBox', async () => {
    const { appClient } = await compileAndCreate('pushToArrayInBox');

    expect(await runMethod(appClient, 'pushToArrayInBox')).toEqual([1n, 2n, 3n, 4n]);
  });

  test('updateStaticFieldInDynamicObjectInBox', async () => {
    const { appClient } = await compileAndCreate('updateStaticFieldInDynamicObjectInBox');

    expect(await runMethod(appClient, 'updateStaticFieldInDynamicObjectInBox')).toEqual('Hello World!');
  });

  test('dynamicArrayLength', async () => {
    const { appClient } = await compileAndCreate('dynamicArrayLength');

    expect(await runMethod(appClient, 'dynamicArrayLength')).toEqual(6n);
  });

  test('dynamicArrayIteration', async () => {
    const { appClient } = await compileAndCreate('dynamicArrayIteration');

    expect(await runMethod(appClient, 'dynamicArrayIteration')).toEqual('Hello World!');
  });

  test('postBoolTupleOffset', async () => {
    const { appClient } = await compileAndCreate('postBoolTupleOffset');

    expect(await runMethod(appClient, 'postBoolTupleOffset')).toEqual([true, 1n, 2n]);
  });

  test('nestedArrayInBox', async () => {
    const { appClient } = await compileAndCreate('nestedArrayInBox');

    expect(await runMethod(appClient, 'nestedArrayInBox')).toEqual([
      [[...Buffer.from('abcd')], [...Buffer.from('efgh')]],
      1n,
      2n,
      3n,
      false,
    ]);
  });

  test('nestedArrayInBoxLast', async () => {
    const { appClient } = await compileAndCreate('nestedArrayInBoxLast');

    expect(await runMethod(appClient, 'nestedArrayInBoxLast')).toEqual([
      1n,
      2n,
      3n,
      false,
      [[...Buffer.from('abcd')], [...Buffer.from('efgh')]],
    ]);
  });

  test('nestedArrayInBoxWithoutBool', async () => {
    const { appClient } = await compileAndCreate('nestedArrayInBoxWithoutBool');

    expect(await runMethod(appClient, 'nestedArrayInBoxWithoutBool')).toEqual([
      [[...Buffer.from('abcd')], [...Buffer.from('efgh')]],
      1n,
      2n,
      3n,
    ]);
  });

  test('nestedArrayAlongsideBoolean', async () => {
    const { appClient } = await compileAndCreate('nestedArrayAlongsideBoolean');

    expect(await runMethod(appClient, 'nestedArrayAlongsideBoolean')).toEqual([
      [[...Buffer.from('abcd')], [...Buffer.from('efgh')]],
      1n,
      2n,
      3n,
      false,
    ]);
  });

  test('boolUpdateInObjectInBox', async () => {
    const { appClient } = await compileAndCreate('boolUpdateInObjectInBox');

    expect(await runMethod(appClient, 'boolUpdateInObjectInBox')).toEqual(true);
  });
  test('mutableRefInVariableDeclaration', async () => {
    const { appClient } = await compileAndCreate('mutableRefInVariableDeclaration');

    expect(await runMethod(appClient, 'mutableRefInVariableDeclaration')).toEqual([7n, 8n]);
  });
});
