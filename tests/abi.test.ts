/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import fs from 'fs';
import * as algokit from '@algorandfoundation/algokit-utils';
import { ApplicationClient } from '@algorandfoundation/algokit-utils/types/app-client';
import path from 'path';
import {
  describe, test, expect,
} from '@jest/globals';
import algosdk from 'algosdk';
import { algodClient, kmdClient } from './common';
import Compiler from '../src/lib/compiler';

const ARTIFACTS_PATH = path.join(__dirname, 'contracts', 'artifacts');

const sender = algokit.getLocalNetDispenserAccount(algodClient, kmdClient);

function formatTrace(input: string): string {
  const lines = input.replace(/ {2}/g, '').split('\n');
  const maxFirstColumnLength = 5;
  const maxSecondColumnLength = 5;
  const maxThirdColumnLength = 50;

  // Align the first two columns and join them back with the rest of the columns
  const alignedLines = lines.map((line) => {
    if (!line.includes('|')) return line;

    const columns = line.split('|');

    const firstColumn = columns[0]
      .trim()
      .padEnd(maxFirstColumnLength)
      .slice(0, maxFirstColumnLength);

    const secondColumn = columns[1]
      .trim()
      .padEnd(maxSecondColumnLength)
      .slice(0, maxSecondColumnLength);

    /*
    const pc = firstColumn.trim();

    const tealLine = undefined; // (srcMap as {[pc: string]: number})[pc];
    const approval = fs.readFileSync('./tests/contracts/artifacts/AbiTest.approval.teal', 'utf8');

    const srcLine = tealLine
   && (!columns[2].includes('!!')) ? approval.split('\n')[tealLine].trim() : columns[2];
   */

    const srcLine = columns[2];

    const thirdColumn = srcLine
      .trim()
      .padEnd(maxThirdColumnLength)
      .slice(0, maxThirdColumnLength);

    // remove long lines
    if (srcLine.startsWith('method')) return undefined;
    if (srcLine.startsWith('txna ApplicationArgs 0')) return undefined;
    if (srcLine.startsWith('match')) return undefined;

    return `${firstColumn} |${secondColumn} |${thirdColumn} |${columns.slice(4).join('|')}`;
  });

  return alignedLines.filter((l) => l !== undefined).join('\n');
}
// eslint-disable-next-line no-unused-vars
async function dryrun(
  appClient: ApplicationClient,
  appId: number,
  methodName: string,
  methodArgs?: algosdk.ABIArgument[],
) {
  const atc = new algosdk.AtomicTransactionComposer();
  atc.addMethodCall({
    appID: appId,
    method: appClient.getABIMethod(methodName)!,
    methodArgs,
    sender: (await sender).addr,
    signer: algosdk.makeBasicAccountTransactionSigner(await sender),
    suggestedParams: await algodClient.getTransactionParams().do(),
  });

  const txns = atc.buildGroup().map((t) => t.txn);
  const sigs = (await atc.gatherSignatures())
    .map((s) => (algosdk.decodeObj(s) as algosdk.SignedTransaction).sig);
  const dr = await algosdk.createDryrun({
    client: algodClient,
    txns: [{ txn: txns[0], sig: sigs[0] }],
  });

  const drrTxn = new algosdk.DryrunResult(await algodClient.dryrun(dr).do()).txns[0];

  // eslint-disable-next-line no-console
  console.log(formatTrace(drrTxn.appTrace({ maxValueWidth: -1, topOfStackFirst: true })));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function compileAndCreate(name: string): Promise<{
  appClient: ApplicationClient;
  appId: number | bigint;
}> {
  const className = `ABITest${name.charAt(0).toUpperCase() + name.slice(1)}`;

  const sourcePath = path.join('tests', 'contracts', 'abi.algo.ts');
  const content = fs.readFileSync(sourcePath, 'utf-8');
  const compiler = new Compiler(
    content,
    className,
    { filename: sourcePath, disableWarnings: true },
  );
  await compiler.compile();
  await compiler.algodCompile();

  expect(compiler.approvalProgram()).toEqual(fs.readFileSync(`${ARTIFACTS_PATH}/${className}.approval.teal`, 'utf-8'));
  expect(compiler.abi).toEqual(JSON.parse(fs.readFileSync(`${ARTIFACTS_PATH}/${className}.abi.json`, 'utf-8')));
  expect(compiler.appSpec()).toEqual(JSON.parse(fs.readFileSync(`${ARTIFACTS_PATH}/${className}.json`, 'utf-8')));

  const appClient = algokit.getAppClient(
    {
      app: JSON.stringify(compiler.appSpec()),
      sender: await sender,
      resolveBy: 'id',
      id: 0,
    },
    algodClient,
  );

  const { appId } = await appClient.create({ sendParams: { suppressLog: true } });

  return { appClient, appId };
}

async function runMethod(
  appClient: ApplicationClient,
  name: string,
  methodArgs: algosdk.ABIArgument[] = [],
) {
  const params = {
    method: name,
    methodArgs,
    boxes: [{ appIndex: 0, name: new Uint8Array(Buffer.from('bRef')) }, { appIndex: 0, name: new Uint8Array(Buffer.from('bMap')) }],
    sendParams: { suppressLog: true },
  };

  try {
    if (name.includes('Storage') || name.includes('RefAccount')) {
      await appClient.fundAppAccount({
        amount: algokit.microAlgos(127400),
        sendParams: { suppressLog: true },
      });
      return (await appClient.optIn(params)).return?.returnValue;
    }
    return (await appClient.call(params)).return?.returnValue;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e);
    throw e;
  }
}

describe('ABI', function () {
  test.concurrent('staticArray', async function () {
    const { appClient } = await compileAndCreate('staticArray');
    expect(await runMethod(appClient, 'staticArray')).toEqual(BigInt(22));
  });

  test.concurrent('returnStaticArray', async function () {
    const { appClient } = await compileAndCreate('returnStaticArray');
    expect(await runMethod(appClient, 'returnStaticArray')).toEqual([BigInt(11), BigInt(22), BigInt(33)]);
  });

  test.concurrent('staticArrayArg', async function () {
    const { appClient } = await compileAndCreate('staticArrayArg');
    const ret = await runMethod(appClient, 'staticArrayArg', [[BigInt(11), BigInt(22), BigInt(33)]]);
    expect(ret).toEqual(BigInt(22));
  });

  test.concurrent('nonLiteralStaticArrayElements', async function () {
    const { appClient } = await compileAndCreate('nonLiteralStaticArrayElements');
    expect(await runMethod(appClient, 'nonLiteralStaticArrayElements')).toEqual(BigInt(22));
  });

  test.concurrent('mixedStaticArrayElements', async function () {
    const { appClient } = await compileAndCreate('mixedStaticArrayElements');
    expect(await runMethod(appClient, 'mixedStaticArrayElements')).toEqual(BigInt(1 + 4 + 7));
  });

  test.concurrent('nonLiteralStaticArrayAccess', async function () {
    const { appClient } = await compileAndCreate('nonLiteralStaticArrayAccess');
    expect(await runMethod(appClient, 'nonLiteralStaticArrayAccess')).toEqual(BigInt(33));
  });

  test.concurrent('setStaticArrayElement', async function () {
    const { appClient } = await compileAndCreate('setStaticArrayElement');
    expect(await runMethod(appClient, 'setStaticArrayElement')).toEqual(BigInt(222));
  });

  test.concurrent('staticArrayInStorageRef', async function () {
    const { appClient } = await compileAndCreate('staticArrayInStorageRef');
    const ret = await runMethod(appClient, 'staticArrayInStorageRef');
    expect(ret).toEqual([BigInt(22), BigInt(22), BigInt(22)]);
  });

  test.concurrent('updateStaticArrayInStorageRef', async function () {
    const { appClient } = await compileAndCreate('updateStaticArrayInStorageRef');
    const ret = await runMethod(appClient, 'updateStaticArrayInStorageRef');
    expect(ret).toEqual([BigInt(111), BigInt(222), BigInt(333)]);
  });

  test.concurrent('staticArrayInStorageMap', async function () {
    const { appClient } = await compileAndCreate('staticArrayInStorageMap');
    const ret = await runMethod(appClient, 'staticArrayInStorageMap');
    expect(ret).toEqual([BigInt(22), BigInt(22), BigInt(22)]);
  });

  test.concurrent('updateStaticArrayInStorageMap', async function () {
    const { appClient } = await compileAndCreate('updateStaticArrayInStorageMap');
    const ret = await runMethod(appClient, 'updateStaticArrayInStorageMap');
    expect(ret).toEqual([BigInt(1111), BigInt(2222), BigInt(3333)]);
  });

  test.concurrent('nestedStaticArray', async function () {
    const { appClient } = await compileAndCreate('nestedStaticArray');
    expect(await runMethod(appClient, 'nestedStaticArray')).toEqual(BigInt(55));
  });

  test.concurrent('updateNestedStaticArrayElement', async function () {
    const { appClient } = await compileAndCreate('updateNestedStaticArrayElement');
    expect(await runMethod(appClient, 'updateNestedStaticArrayElement')).toEqual(BigInt(555));
  });

  test.concurrent('updateNestedStaticArray', async function () {
    const { appClient } = await compileAndCreate('updateNestedStaticArray');
    expect(await runMethod(appClient, 'updateNestedStaticArray')).toEqual(BigInt(555));
  });

  test.concurrent('threeDimensionalUint16Array', async function () {
    const { appClient } = await compileAndCreate('threeDimensionalUint16Array');
    expect(await runMethod(appClient, 'threeDimensionalUint16Array')).toEqual(BigInt(888));
  });

  test.concurrent('simpleTuple', async function () {
    const { appClient } = await compileAndCreate('simpleTuple');
    expect(await runMethod(appClient, 'simpleTuple')).toEqual(BigInt(44));
  });

  test.concurrent('arrayInTuple', async function () {
    const { appClient } = await compileAndCreate('arrayInTuple');
    expect(await runMethod(appClient, 'arrayInTuple')).toEqual(BigInt(44));
  });

  test.concurrent('tupleInArray', async function () {
    const { appClient } = await compileAndCreate('tupleInArray');
    expect(await runMethod(appClient, 'tupleInArray')).toEqual(BigInt(44));
  });

  test.concurrent('tupleInTuple', async function () {
    const { appClient } = await compileAndCreate('tupleInTuple');
    expect(await runMethod(appClient, 'tupleInTuple')).toEqual(BigInt(66));
  });

  test.concurrent('shortTypeNotation', async function () {
    const { appClient } = await compileAndCreate('shortTypeNotation');
    expect(await runMethod(appClient, 'shortTypeNotation')).toEqual(BigInt(66));
  });

  test.concurrent('disgusting', async function () {
    const { appClient } = await compileAndCreate('disgusting');
    expect(await runMethod(appClient, 'disgusting')).toEqual(BigInt(8888));
  });

  test.concurrent('returnTuple', async function () {
    const { appClient } = await compileAndCreate('returnTuple');
    expect(await runMethod(appClient, 'returnTuple')).toEqual([BigInt(11), BigInt(22), BigInt(33)]);
  });

  test.concurrent('tupleArg', async function () {
    const { appClient } = await compileAndCreate('tupleArg');
    const ret = await runMethod(appClient, 'tupleArg', [[BigInt(11), BigInt(22), BigInt(33)]]);
    expect(ret).toEqual(BigInt(22));
  });

  test.concurrent('dynamicArray', async function () {
    const { appClient } = await compileAndCreate('dynamicArray');
    expect(await runMethod(appClient, 'dynamicArray')).toEqual(BigInt(22));
  });

  test.concurrent('returnDynamicArray', async function () {
    const { appClient } = await compileAndCreate('returnDynamicArray');
    expect(await runMethod(appClient, 'returnDynamicArray')).toEqual([BigInt(11), BigInt(22), BigInt(33)]);
  });

  test.concurrent('dynamicArrayArg', async function () {
    const { appClient } = await compileAndCreate('dynamicArrayArg');
    const ret = await runMethod(appClient, 'dynamicArrayArg', [[BigInt(11), BigInt(22), BigInt(33)]]);
    expect(ret).toEqual(BigInt(22));
  });

  test.concurrent('updateDynamicArrayElement', async function () {
    const { appClient } = await compileAndCreate('updateDynamicArrayElement');
    expect(await runMethod(appClient, 'updateDynamicArrayElement')).toEqual(BigInt(222));
  });

  test.concurrent('dynamicTupleArray', async function () {
    const { appClient } = await compileAndCreate('dynamicTupleArray');
    expect(await runMethod(appClient, 'dynamicTupleArray')).toEqual(BigInt(44));
  });

  test.concurrent('returnTupleWithDyamicArray', async function () {
    const { appClient } = await compileAndCreate('returnTupleWithDyamicArray');
    expect(await runMethod(appClient, 'returnTupleWithDyamicArray')).toEqual(
      [BigInt(1), BigInt(2), [BigInt(3), BigInt(4)], [BigInt(5), BigInt(6)]],
    );
  });

  test.concurrent('returnDynamicArrayFromTuple', async function () {
    const { appClient } = await compileAndCreate('returnDynamicArrayFromTuple');
    expect(await runMethod(appClient, 'returnDynamicArrayFromTuple')).toEqual(
      [BigInt(7), BigInt(8)],
    );
  });

  test.concurrent('updateDynamicArrayInTuple', async function () {
    const { appClient } = await compileAndCreate('updateDynamicArrayInTuple');
    const a: {old: BigInt[] | BigInt, new: BigInt[] | BigInt}[] = [
      { old: BigInt(9), new: BigInt(99) },
      { old: [BigInt(8)], new: [BigInt(10), BigInt(11)] },
      { old: [BigInt(7)], new: [BigInt(12), BigInt(13)] },
      { old: [BigInt(6)], new: [BigInt(14), BigInt(15)] },
      { old: [BigInt(5)], new: [BigInt(16), BigInt(17)] },
    ];

    expect(await runMethod(appClient, 'updateDynamicArrayInTuple')).toEqual([a[0].new, a[1].new, a[2].new, a[3].new, a[4].new]);
  });

  test.concurrent('nonLiteralDynamicElementInTuple', async function () {
    const { appClient } = await compileAndCreate('nonLiteralDynamicElementInTuple');
    expect(await runMethod(appClient, 'nonLiteralDynamicElementInTuple')).toEqual(
      [
        BigInt(1),
        BigInt(2),
        [BigInt(3), BigInt(4)],
        [BigInt(5), BigInt(6)],
        [BigInt(7), BigInt(8)]],
    );
  });

  test.concurrent('arrayPush', async function () {
    const { appClient } = await compileAndCreate('arrayPush');
    expect(await runMethod(appClient, 'arrayPush')).toEqual(
      [BigInt(1), BigInt(2), BigInt(3)],
    );
  });

  test.concurrent('arrayPop', async function () {
    const { appClient } = await compileAndCreate('arrayPop');
    expect(await runMethod(appClient, 'arrayPop')).toEqual([BigInt(1), BigInt(2)]);
  });

  test.concurrent('arrayPopValue', async function () {
    const { appClient } = await compileAndCreate('arrayPopValue');
    expect(await runMethod(appClient, 'arrayPopValue')).toEqual(BigInt(3));
  });

  test.concurrent('arraySplice', async function () {
    const { appClient } = await compileAndCreate('arraySplice');
    expect(await runMethod(appClient, 'arraySplice')).toEqual([1, 3].map((n) => BigInt(n)));
  });

  test.concurrent('arraySpliceValue', async function () {
    const { appClient } = await compileAndCreate('arraySpliceValue');
    expect(await runMethod(appClient, 'arraySpliceValue')).toEqual([2, 3, 4, 5, 6, 7, 8].map((n) => BigInt(n)));
  });

  test.concurrent('dynamicArrayElements', async function () {
    const { appClient } = await compileAndCreate('dynamicArrayElements');
    expect(await runMethod(appClient, 'dynamicArrayElements')).toEqual([1, 2, 3].map((n) => BigInt(n)));
  });

  test.concurrent('spliceLastElement', async function () {
    const { appClient } = await compileAndCreate('spliceLastElement');
    expect(await runMethod(appClient, 'spliceLastElement')).toEqual([1, 2].map((n) => BigInt(n)));
  });

  test.concurrent('spliceLastElementValue', async function () {
    const { appClient } = await compileAndCreate('spliceLastElementValue');
    expect(await runMethod(appClient, 'spliceLastElementValue')).toEqual([3].map((n) => BigInt(n)));
  });

  test.concurrent('spliceFirstElement', async function () {
    const { appClient } = await compileAndCreate('spliceFirstElement');
    expect(await runMethod(appClient, 'spliceFirstElement')).toEqual([2, 3].map((n) => BigInt(n)));
  });

  test.concurrent('spliceFirstElementValue', async function () {
    const { appClient } = await compileAndCreate('spliceFirstElementValue');
    expect(await runMethod(appClient, 'spliceFirstElementValue')).toEqual([1].map((n) => BigInt(n)));
  });

  test.concurrent('stringReturn', async function () {
    const { appClient } = await compileAndCreate('stringReturn');
    const s = 'Hello World!';
    expect(await runMethod(appClient, 'stringReturn')).toEqual(s);
  });

  test.concurrent('stringArg', async function () {
    const { appClient } = await compileAndCreate('stringArg');
    const s = 'Hello World!';
    await runMethod(appClient, 'stringArg', [s]);
    // asert is in contract
  });

  test.concurrent('stringInTuple', async function () {
    const { appClient } = await compileAndCreate('stringInTuple');
    const s = 'Hello World!';
    expect(await runMethod(appClient, 'stringInTuple')).toEqual([BigInt(1), [BigInt(2)], s, [BigInt(3)]]);
  });

  test.concurrent('accesStringInTuple', async function () {
    const { appClient } = await compileAndCreate('accesStringInTuple');
    const s = 'Hello World!';
    expect(await runMethod(appClient, 'accesStringInTuple')).toEqual(s);
  });

  test.concurrent('updateStringInTuple', async function () {
    const { appClient } = await compileAndCreate('updateStringInTuple');
    const a = [
      { old: BigInt(9), new: BigInt(99) },
      { old: [BigInt(8)], new: [BigInt(10), BigInt(11)] },
      { old: 'Hi?', new: 'Hello World!' },
      { old: [BigInt(6)], new: [BigInt(14), BigInt(15)] },
      { old: [BigInt(5)], new: [BigInt(16), BigInt(17)] },
    ];

    expect(await runMethod(appClient, 'updateStringInTuple')).toEqual([a[0].new, a[1].new, a[2].new, a[3].new, a[4].new]);
  });

  test.concurrent('updateTupleWithOnlyDynamicTypes', async function () {
    const { appClient } = await compileAndCreate('updateTupleWithOnlyDynamicTypes');
    expect(await runMethod(appClient, 'updateTupleWithOnlyDynamicTypes')).toEqual(
      [
        [BigInt(4), BigInt(5)],
        [BigInt(6), BigInt(7)],
        [BigInt(8), BigInt(9)]],
    );
  });

  test.concurrent('shortenDynamicElementInTuple', async function () {
    const { appClient } = await compileAndCreate('shortenDynamicElementInTuple');
    expect(await runMethod(appClient, 'shortenDynamicElementInTuple')).toEqual(
      [
        [BigInt(5)],
        [BigInt(6)],
        [BigInt(7)]],
    );
  });

  test.concurrent('namedTuple', async function () {
    const { appClient } = await compileAndCreate('namedTuple');
    expect(await runMethod(appClient, 'namedTuple')).toEqual('Hello World!');
  });

  test.concurrent('updateNamedTuple', async function () {
    const { appClient } = await compileAndCreate('updateNamedTuple');
    expect(await runMethod(appClient, 'updateNamedTuple')).toEqual('Hello World!');
  });

  test.concurrent('customTypes', async function () {
    const { appClient } = await compileAndCreate('customTypes');
    expect(await runMethod(appClient, 'customTypes')).toEqual('Hello World!');
  });

  test.concurrent('staticStringArrayArg', async function () {
    const { appClient } = await compileAndCreate('staticStringArrayArg');
    const ret = await runMethod(appClient, 'staticStringArrayArg', [['Hello', 'World', '!']]);
    expect(ret).toEqual('World');
  });

  test.concurrent('dynamicAccessOfDynamicElementInStaticArray', async function () {
    const { appClient } = await compileAndCreate('dynamicAccessOfDynamicElementInStaticArray');
    const ret = await runMethod(appClient, 'dynamicAccessOfDynamicElementInStaticArray', [['Hello', 'World', '!']]);
    expect(ret).toEqual('World');
  });

  test.concurrent('dynamicArrayInMiddleOfTuple', async function () {
    const { appClient } = await compileAndCreate('dynamicArrayInMiddleOfTuple');
    expect(await runMethod(appClient, 'dynamicArrayInMiddleOfTuple')).toEqual(
      [
        BigInt(1),
        [BigInt(2)],
        BigInt(3),
      ],
    );
  });

  test.concurrent('accessDynamicArrayInMiddleOfTuple', async function () {
    const { appClient } = await compileAndCreate('accessDynamicArrayInMiddleOfTuple');
    expect(await runMethod(appClient, 'accessDynamicArrayInMiddleOfTuple')).toEqual(
      [BigInt(2)],
    );
  });

  test.concurrent('accessDynamicArrayElementInTuple', async function () {
    const { appClient } = await compileAndCreate('accessDynamicArrayElementInTuple');
    expect(await runMethod(appClient, 'accessDynamicArrayElementInTuple')).toEqual(
      BigInt(33),
    );
  });

  test.concurrent('updateDynamicArrayInMiddleOfTuple', async function () {
    const { appClient } = await compileAndCreate('updateDynamicArrayInMiddleOfTuple');
    expect(await runMethod(appClient, 'updateDynamicArrayInMiddleOfTuple')).toEqual(
      [
        BigInt(1),
        [BigInt(4), BigInt(5)],
        BigInt(3),
      ],
    );
  });

  test.concurrent('nestedTuple', async function () {
    const { appClient } = await compileAndCreate('nestedTuple');
    expect(await runMethod(appClient, 'nestedTuple')).toEqual([11n, [22n, 'foo'], [33n, 'bar']]);
  });

  test.concurrent('updateDynamicElementInTupleWithSameLength', async function () {
    const { appClient } = await compileAndCreate('updateDynamicElementInTupleWithSameLength');
    expect(await runMethod(appClient, 'updateDynamicElementInTupleWithSameLength')).toEqual(
      [
        1n,
        [10n, 11n, 12n],
        5n,
        [6n, 7n, 8n],
        9n,
      ],
    );
  });

  test.concurrent('accessDynamicStringArray', async function () {
    const { appClient } = await compileAndCreate('accessDynamicStringArray');
    expect(await runMethod(appClient, 'accessDynamicStringArray')).toEqual('World');
  });

  test.concurrent('txnTypes', async function () {
    await compileAndCreate('txnTypes');
  });

  test.concurrent('ufixed', async () => {
    const { appClient } = await compileAndCreate('ufixed');
    expect(await runMethod(appClient, 'ufixed')).toEqual(BigInt(123 + 456));
  });

  test.concurrent('arrayLength', async () => {
    const { appClient } = await compileAndCreate('arrayLength');
    expect(await runMethod(appClient, 'arrayLength')).toEqual(BigInt(5));
  });

  test.concurrent('stringLength', async () => {
    const { appClient } = await compileAndCreate('stringLength');
    expect(await runMethod(appClient, 'stringLength')).toEqual(BigInt(7));
  });
  test.concurrent('arrayRef', async () => {
    const { appClient } = await compileAndCreate('arrayRef');

    expect(await runMethod(appClient, 'arrayRef')).toEqual([1n, 4n, 3n]);
  });

  test.concurrent('nestedArrayRef', async () => {
    const { appClient } = await compileAndCreate('nestedArrayRef');

    expect(await runMethod(appClient, 'nestedArrayRef')).toEqual([[1n, 2n], [3n, 5n]]);
  });

  test.concurrent('nonLiteralNestedArrayRef', async () => {
    const { appClient } = await compileAndCreate('nonLiteralNestedArrayRef');

    expect(await runMethod(appClient, 'nonLiteralNestedArrayRef')).toEqual([[1n, 2n], [3n, 5n]]);
  });

  test.concurrent('multiNestedArrayRef', async () => {
    const { appClient } = await compileAndCreate('multiNestedArrayRef');

    expect(await runMethod(appClient, 'multiNestedArrayRef')).toEqual([[[1n, 2n], [3n, 4n]], [[5n, 6n], [7n, 9n]]]);
  });

  test.concurrent('objectArrayRef', async () => {
    const { appClient } = await compileAndCreate('objectArrayRef');

    expect(await runMethod(appClient, 'objectArrayRef')).toEqual([[[1n, 2n], [3n, 5n]]]);
  });

  test.concurrent('stringAccessor', async () => {
    const { appClient } = await compileAndCreate('stringAccessor');

    expect(await runMethod(appClient, 'stringAccessor')).toEqual('e');
  });

  test.concurrent('emptyStaticArray', async () => {
    const { appClient } = await compileAndCreate('emptyStaticArray');

    expect(await runMethod(appClient, 'emptyStaticArray')).toEqual([0n, 0n, 0n]);
  });

  test.concurrent('partialStaticArray', async () => {
    const { appClient } = await compileAndCreate('partialStaticArray');

    expect(await runMethod(appClient, 'partialStaticArray')).toEqual([1n, 0n, 0n]);
  });

  test.concurrent('emptyDynamicArray', async () => {
    const { appClient } = await compileAndCreate('emptyDynamicArray');

    expect(await runMethod(appClient, 'emptyDynamicArray')).toEqual([]);
  });
  test.concurrent('booleanArgAndReturn', async () => {
    const { appClient } = await compileAndCreate('booleanArgAndReturn');

    expect(await runMethod(appClient, 'booleanArgAndReturn', [true])).toEqual(true);

    expect(await runMethod(appClient, 'booleanArgAndReturn', [false])).toEqual(false);
  });

  test.concurrent('boolTuple', async () => {
    const { appClient } = await compileAndCreate('boolTuple');

    expect(await runMethod(appClient, 'boolTuple')).toEqual([true, false, true, true, false, false, true, false, false]);
  });

  test.concurrent('staticBoolArray', async () => {
    const { appClient } = await compileAndCreate('staticBoolArray');

    expect(await runMethod(appClient, 'staticBoolArray')).toEqual([true, false, true, true, false, false, true, false, false]);
  });

  test.concurrent('boolTupleAccess', async () => {
    const { appClient } = await compileAndCreate('boolTupleAccess');

    expect(await runMethod(appClient, 'boolTupleAccess')).toEqual(true);
  });

  test.concurrent('staticBoolArrayAccess', async () => {
    const { appClient } = await compileAndCreate('staticBoolArrayAccess');

    expect(await runMethod(appClient, 'staticBoolArrayAccess')).toEqual(false);
  });

  test.concurrent('dynamicBoolArray', async () => {
    const { appClient } = await compileAndCreate('dynamicBoolArray');

    expect(await runMethod(appClient, 'dynamicBoolArray')).toEqual([true, false, true, true, false, false, true, false, false]);
  });

  test.concurrent('dynamicBoolArrayAccess', async () => {
    const { appClient } = await compileAndCreate('dynamicBoolArrayAccess');

    expect(await runMethod(appClient, 'dynamicBoolArrayAccess')).toEqual(false);
  });

  test.concurrent('staticBoolArrayUpdate', async () => {
    const { appClient } = await compileAndCreate('staticBoolArrayUpdate');

    expect(await runMethod(appClient, 'staticBoolArrayUpdate')).toEqual([true, false, true, true, false, false, true, false, true]);
  });

  test.concurrent('dynamicBoolArrayUpdate', async () => {
    const { appClient } = await compileAndCreate('dynamicBoolArrayUpdate');

    expect(await runMethod(appClient, 'dynamicBoolArrayUpdate')).toEqual([true, false, true, true, false, false, true, false, true]);
  });

  test.concurrent('boolTupleUpdate', async () => {
    const { appClient } = await compileAndCreate('boolTupleUpdate');

    expect(await runMethod(appClient, 'boolTupleUpdate')).toEqual([true, false, true, true, false, false, true, false, true]);
  });

  test.concurrent('objectRef', async () => {
    const { appClient } = await compileAndCreate('objectRef');

    expect(await runMethod(appClient, 'objectRef')).toEqual([2n]);
  });

  test.concurrent('storageRefKey', async () => {
    const { appClient } = await compileAndCreate('storageRefKey');

    expect(await runMethod(appClient, 'storageRefKey')).toEqual(4n);
  });

  test.concurrent('storageRefAccount', async () => {
    const { appClient } = await compileAndCreate('storageRefAccount');

    expect(await runMethod(appClient, 'storageRefAccount')).toEqual(4n);
  });

  test.concurrent('angularCasting', async () => {
    const { appClient } = await compileAndCreate('angularCasting');

    expect(await runMethod(appClient, 'angularCasting')).toEqual(1337n);
  });
});
