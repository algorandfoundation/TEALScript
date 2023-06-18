/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { sandbox } from 'beaker-ts';
import fs from 'fs';
import * as algokit from '@algorandfoundation/algokit-utils';
import path from 'path';
import { describe, test, expect } from '@jest/globals';
import { algodClient } from './common';
import Compiler from '../src/lib/compiler';

const ARTIFACTS_PATH = path.join(__dirname, 'contracts', 'artifacts');

/*
function formatTrace(input: string): string {
  const lines = input.replace(/ {2}/g, '').split.concurrent('\n');
  const maxFirstColumnLength = 5;
  const maxSecondColumnLength = 5;
  const maxThirdColumnLength = 50;

  // Align the first two columns and join them back with the rest of the columns
  const alignedLines = lines.map((line) => {
    if (!line.includes('|')) return line;

    const columns = line.split.concurrent('|');

    const firstColumn = columns[0]
      .trim()
      .padEnd(maxFirstColumnLength)
      .slice(0, maxFirstColumnLength);

    const secondColumn = columns[1]
      .trim()
      .padEnd(maxSecondColumnLength)
      .slice(0, maxSecondColumnLength);

    const pc = firstColumn.trim();

    const tealLine = (srcMap as {[pc: string]: number})[pc];

    const approval = fs.readFileSync('./tests/contracts/artifacts/AbiTest.approval.teal', 'utf8');

    const srcLine = tealLine &&
      (!columns[2].includes('!!')) ? approval.split.concurrent('\n')[tealLine].trim() : columns[2];

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

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any
async function dryrun(methodName: string, methodArgs: any = []) {
  const atc = new algosdk.AtomicTransactionComposer();
  atc.addMethodCall({
    appID: appClient.appId,
    method: algosdk.getMethodByName(appClient.methods, methodName),
    methodArgs,
    sender: appClient.sender,
    signer: appClient.signer,
    suggestedParams: await appClient.getSuggestedParams(),
  });
  const txns = atc.buildGroup().map((t) => t.txn);
  const sigs = (await atc.gatherSignatures())
    .map((s) => (algosdk.decodeObj(s) as algosdk.SignedTransaction).sig);
  const dr = await algosdk.createDryrun({
    client: appClient.client,
    txns: [{ txn: txns[0], sig: sigs[0] }],
  });

  const drrTxn = new algosdk.DryrunResult(await appClient.client.dryrun(dr).do()).txns[0];

  // eslint-disable-next-line no-console
  console.log(formatTrace(drrTxn.appTrace({ maxValueWidth: -1, topOfStackFirst: true })));
}
artifactsTest('AbiTest', 'tests/contracts/abi.algo.ts', 'tests/contracts/artifacts', 'AbiTest');
*/

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runTests(name: string, methodArgs: any[] = []) {
  const className = `ABITest${name.charAt(0).toUpperCase() + name.slice(1)}`;

  const sender = (await sandbox.getAccounts()).pop()!;

  const sourcePath = path.join('tests', 'contracts', 'abi.algo.ts');
  const content = fs.readFileSync(sourcePath, 'utf-8');
  const compiler = new Compiler(content, className, sourcePath);
  await compiler.compile();
  await compiler.algodCompile();

  expect(compiler.approvalProgram()).toEqual(fs.readFileSync(`${ARTIFACTS_PATH}/${className}.approval.teal`, 'utf-8'));
  expect(compiler.pcToLine).toEqual(JSON.parse(fs.readFileSync(`${ARTIFACTS_PATH}/${className}.src_map.json`, 'utf-8')));
  expect(compiler.abi).toEqual(JSON.parse(fs.readFileSync(`${ARTIFACTS_PATH}/${className}.abi.json`, 'utf-8')));
  expect(compiler.appSpec()).toEqual(JSON.parse(fs.readFileSync(`${ARTIFACTS_PATH}/${className}.json`, 'utf-8')));

  const appClient = algokit.getAppClient(
    {
      app: JSON.stringify(compiler.appSpec()),
      sender,
      resolveBy: 'id',
      id: 0,
    },
    algodClient,
  );

  await appClient.create({ sendParams: { suppressLog: true } });

  const params = {
    method: name,
    methodArgs,
    boxes: [{ appIndex: 0, name: new Uint8Array(Buffer.from('bRef')) }, { appIndex: 0, name: new Uint8Array(Buffer.from('bMap')) }],
    sendParams: { suppressLog: true },
  };

  if (name.includes('Storage')) {
    await appClient.fundAppAccount({
      amount: algokit.microAlgos(127400),
      sendParams: { suppressLog: true },
    });
    return (await appClient.optIn(params)).return?.returnValue;
  }
  return (await appClient.call(params)).return?.returnValue;
}

describe('ABI', function () {
  test.concurrent('staticArray', async function () {
    expect(await runTests('staticArray')).toEqual(BigInt(22));
  });

  test.concurrent('returnStaticArray', async function () {
    expect(await runTests('returnStaticArray')).toEqual([BigInt(11), BigInt(22), BigInt(33)]);
  });

  test.concurrent('staticArrayArg', async function () {
    const ret = await runTests('staticArrayArg', [[BigInt(11), BigInt(22), BigInt(33)]]);
    expect(ret).toEqual(BigInt(22));
  });

  test.concurrent('nonLiteralStaticArrayElements', async function () {
    expect(await runTests('nonLiteralStaticArrayElements')).toEqual(BigInt(22));
  });

  test.concurrent('mixedStaticArrayElements', async function () {
    expect(await runTests('mixedStaticArrayElements')).toEqual(BigInt(1 + 4 + 7));
  });

  test.concurrent('nonLiteralStaticArrayAccess', async function () {
    expect(await runTests('nonLiteralStaticArrayAccess')).toEqual(BigInt(33));
  });

  test.concurrent('setStaticArrayElement', async function () {
    expect(await runTests('setStaticArrayElement')).toEqual(BigInt(222));
  });

  test.concurrent('staticArrayInStorageRef', async function () {
    const ret = await runTests('staticArrayInStorageRef');
    expect(ret).toEqual([BigInt(22), BigInt(22), BigInt(22)]);
  });

  test.concurrent('updateStaticArrayInStorageRef', async function () {
    const ret = await runTests('updateStaticArrayInStorageRef');
    expect(ret).toEqual([BigInt(111), BigInt(222), BigInt(333)]);
  });

  test.concurrent('staticArrayInStorageMap', async function () {
    const ret = await runTests('staticArrayInStorageMap');
    expect(ret).toEqual([BigInt(22), BigInt(22), BigInt(22)]);
  });

  test.concurrent('updateStaticArrayInStorageMap', async function () {
    const ret = await runTests('updateStaticArrayInStorageMap');
    expect(ret).toEqual([BigInt(1111), BigInt(2222), BigInt(3333)]);
  });

  test.concurrent('nestedStaticArray', async function () {
    expect(await runTests('nestedStaticArray')).toEqual(BigInt(55));
  });

  test.concurrent('updateNestedStaticArrayElement', async function () {
    expect(await runTests('updateNestedStaticArrayElement')).toEqual(BigInt(555));
  });

  test.concurrent('updateNestedStaticArray', async function () {
    expect(await runTests('updateNestedStaticArray')).toEqual(BigInt(555));
  });

  test.concurrent('threeDimensionalUint16Array', async function () {
    expect(await runTests('threeDimensionalUint16Array')).toEqual(BigInt(888));
  });

  test.concurrent('simpleTuple', async function () {
    expect(await runTests('simpleTuple')).toEqual(BigInt(44));
  });

  test.concurrent('arrayInTuple', async function () {
    expect(await runTests('arrayInTuple')).toEqual(BigInt(44));
  });

  test.concurrent('tupleInArray', async function () {
    expect(await runTests('tupleInArray')).toEqual(BigInt(44));
  });

  test.concurrent('tupleInTuple', async function () {
    expect(await runTests('tupleInTuple')).toEqual(BigInt(66));
  });

  test.concurrent('shortTypeNotation', async function () {
    expect(await runTests('shortTypeNotation')).toEqual(BigInt(66));
  });

  test.concurrent('disgusting', async function () {
    expect(await runTests('disgusting')).toEqual(BigInt(8888));
  });

  test.concurrent('returnTuple', async function () {
    expect(await runTests('returnTuple')).toEqual([BigInt(11), BigInt(22), BigInt(33)]);
  });

  test.concurrent('tupleArg', async function () {
    const ret = await runTests('tupleArg', [[BigInt(11), BigInt(22), BigInt(33)]]);
    expect(ret).toEqual(BigInt(22));
  });

  test.concurrent('dynamicArray', async function () {
    expect(await runTests('dynamicArray')).toEqual(BigInt(22));
  });

  test.concurrent('returnDynamicArray', async function () {
    expect(await runTests('returnDynamicArray')).toEqual([BigInt(11), BigInt(22), BigInt(33)]);
  });

  test.concurrent('dynamicArrayArg', async function () {
    const ret = await runTests('dynamicArrayArg', [[BigInt(11), BigInt(22), BigInt(33)]]);
    expect(ret).toEqual(BigInt(22));
  });

  test.concurrent('updateDynamicArrayElement', async function () {
    expect(await runTests('updateDynamicArrayElement')).toEqual(BigInt(222));
  });

  test.concurrent('dynamicTupleArray', async function () {
    expect(await runTests('dynamicTupleArray')).toEqual(BigInt(44));
  });

  test.concurrent('returnTupleWithDyamicArray', async function () {
    expect(await runTests('returnTupleWithDyamicArray')).toEqual(
      [BigInt(1), BigInt(2), [BigInt(3), BigInt(4)], [BigInt(5), BigInt(6)]],
    );
  });

  test.concurrent('returnDynamicArrayFromTuple', async function () {
    expect(await runTests('returnDynamicArrayFromTuple')).toEqual(
      [BigInt(7), BigInt(8)],
    );
  });

  test.concurrent('updateDynamicArrayInTuple', async function () {
    const a: {old: BigInt[] | BigInt, new: BigInt[] | BigInt}[] = [
      { old: BigInt(9), new: BigInt(99) },
      { old: [BigInt(8)], new: [BigInt(10), BigInt(11)] },
      { old: [BigInt(7)], new: [BigInt(12), BigInt(13)] },
      { old: [BigInt(6)], new: [BigInt(14), BigInt(15)] },
      { old: [BigInt(5)], new: [BigInt(16), BigInt(17)] },
    ];

    expect(await runTests('updateDynamicArrayInTuple')).toEqual([a[0].new, a[1].new, a[2].new, a[3].new, a[4].new]);
  });

  test.concurrent('nonLiteralDynamicElementInTuple', async function () {
    expect(await runTests('nonLiteralDynamicElementInTuple')).toEqual(
      [
        BigInt(1),
        BigInt(2),
        [BigInt(3), BigInt(4)],
        [BigInt(5), BigInt(6)],
        [BigInt(7), BigInt(8)]],
    );
  });

  test.concurrent('arrayPush', async function () {
    expect(await runTests('arrayPush')).toEqual(
      [BigInt(1), BigInt(2), BigInt(3)],
    );
  });

  test.concurrent('arrayPop', async function () {
    expect(await runTests('arrayPop')).toEqual([BigInt(1), BigInt(2)]);
  });

  test.concurrent('arrayPopValue', async function () {
    expect(await runTests('arrayPopValue')).toEqual(BigInt(3));
  });

  test.concurrent('arraySplice', async function () {
    expect(await runTests('arraySplice')).toEqual([1, 3].map((n) => BigInt(n)));
  });

  test.concurrent('arraySpliceValue', async function () {
    expect(await runTests('arraySpliceValue')).toEqual([2, 3, 4, 5, 6, 7, 8].map((n) => BigInt(n)));
  });

  test.concurrent('dynamicArrayElements', async function () {
    expect(await runTests('dynamicArrayElements')).toEqual([1, 2, 3].map((n) => BigInt(n)));
  });

  test.concurrent('spliceLastElement', async function () {
    expect(await runTests('spliceLastElement')).toEqual([1, 2].map((n) => BigInt(n)));
  });

  test.concurrent('spliceLastElementValue', async function () {
    expect(await runTests('spliceLastElementValue')).toEqual([3].map((n) => BigInt(n)));
  });

  test.concurrent('spliceFirstElement', async function () {
    expect(await runTests('spliceFirstElement')).toEqual([2, 3].map((n) => BigInt(n)));
  });

  test.concurrent('spliceFirstElementValue', async function () {
    expect(await runTests('spliceFirstElementValue')).toEqual([1].map((n) => BigInt(n)));
  });

  test.concurrent('stringReturn', async function () {
    const s = 'Hello World!';
    expect(await runTests('stringReturn')).toEqual(s);
  });

  test.concurrent('stringArg', async function () {
    const s = 'Hello World!';
    await runTests('stringArg', [s]);
    // asert is in contract
  });

  test.concurrent('stringInTuple', async function () {
    const s = 'Hello World!';
    expect(await runTests('stringInTuple')).toEqual([BigInt(1), [BigInt(2)], s, [BigInt(3)]]);
  });

  test.concurrent('accesStringInTuple', async function () {
    const s = 'Hello World!';
    expect(await runTests('accesStringInTuple')).toEqual(s);
  });

  test.concurrent('updateStringInTuple', async function () {
    const a = [
      { old: BigInt(9), new: BigInt(99) },
      { old: [BigInt(8)], new: [BigInt(10), BigInt(11)] },
      { old: 'Hi?', new: 'Hello World!' },
      { old: [BigInt(6)], new: [BigInt(14), BigInt(15)] },
      { old: [BigInt(5)], new: [BigInt(16), BigInt(17)] },
    ];

    expect(await runTests('updateStringInTuple')).toEqual([a[0].new, a[1].new, a[2].new, a[3].new, a[4].new]);
  });

  test.concurrent('updateTupleWithOnlyDynamicTypes', async function () {
    expect(await runTests('updateTupleWithOnlyDynamicTypes')).toEqual(
      [
        [BigInt(4), BigInt(5)],
        [BigInt(6), BigInt(7)],
        [BigInt(8), BigInt(9)]],
    );
  });

  test.concurrent('shortenDynamicElementInTuple', async function () {
    expect(await runTests('shortenDynamicElementInTuple')).toEqual(
      [
        [BigInt(5)],
        [BigInt(6)],
        [BigInt(7)]],
    );
  });

  test.concurrent('namedTuple', async function () {
    expect(await runTests('namedTuple')).toEqual('Hello World!');
  });

  test.concurrent('updateNamedTuple', async function () {
    expect(await runTests('updateNamedTuple')).toEqual('Hello World!');
  });

  test.concurrent('customTypes', async function () {
    expect(await runTests('customTypes')).toEqual('Hello World!');
  });

  test.concurrent('staticStringArrayArg', async function () {
    const ret = await runTests('staticStringArrayArg', [['Hello', 'World', '!']]);
    expect(ret).toEqual('World');
  });

  test.concurrent('dynamicAccessOfDynamicElementInStaticArray', async function () {
    const ret = await runTests('dynamicAccessOfDynamicElementInStaticArray', [['Hello', 'World', '!']]);
    expect(ret).toEqual('World');
  });

  test.concurrent('dynamicArrayInMiddleOfTuple', async function () {
    expect(await runTests('dynamicArrayInMiddleOfTuple')).toEqual(
      [
        BigInt(1),
        [BigInt(2)],
        BigInt(3),
      ],
    );
  });

  test.concurrent('accessDynamicArrayInMiddleOfTuple', async function () {
    expect(await runTests('accessDynamicArrayInMiddleOfTuple')).toEqual(
      [BigInt(2)],
    );
  });

  test.concurrent('accessDynamicArrayElementInTuple', async function () {
    expect(await runTests('accessDynamicArrayElementInTuple')).toEqual(
      BigInt(33),
    );
  });

  test.concurrent('updateDynamicArrayInMiddleOfTuple', async function () {
    expect(await runTests('updateDynamicArrayInMiddleOfTuple')).toEqual(
      [
        BigInt(1),
        [BigInt(4), BigInt(5)],
        BigInt(3),
      ],
    );
  });

  test.concurrent('nestedTuple', async function () {
    expect(await runTests('nestedTuple')).toEqual([11n, [22n, 'foo'], [33n, 'bar']]);
  });

  test.concurrent('updateDynamicElementInTupleWithSameLength', async function () {
    expect(await runTests('updateDynamicElementInTupleWithSameLength')).toEqual(
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
    expect(await runTests('accessDynamicStringArray')).toEqual('World');
  });
});
