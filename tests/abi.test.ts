/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { expect } from 'chai';
import { sandbox } from 'beaker-ts';
import fs from 'fs';
import * as algokit from '@algorandfoundation/algokit-utils';
import path from 'path';
import { artifactsTest, algodClient } from './common';
import Compiler from '../src/lib/compiler';

const ARTIFACTS_PATH = path.join(__dirname, 'contracts', 'artifacts');

/*
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

    const pc = firstColumn.trim();

    const tealLine = (srcMap as {[pc: string]: number})[pc];

    const approval = fs.readFileSync('./tests/contracts/artifacts/AbiTest.approval.teal', 'utf8');

    const srcLine = tealLine && (!columns[2].includes('!!')) ? approval.split('\n')[tealLine].trim() : columns[2];

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

  expect(compiler.approvalProgram()).to.equal(fs.readFileSync(`${ARTIFACTS_PATH}/${className}.approval.teal`, 'utf-8'));
  expect(compiler.pcToLine).to.deep.equal(JSON.parse(fs.readFileSync(`${ARTIFACTS_PATH}/${className}.src_map.json`, 'utf-8')));
  expect(compiler.abi).to.deep.equal(JSON.parse(fs.readFileSync(`${ARTIFACTS_PATH}/${className}.abi.json`, 'utf-8')));
  expect(compiler.appSpec()).to.deep.equal(JSON.parse(fs.readFileSync(`${ARTIFACTS_PATH}/${className}.json`, 'utf-8')));

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
  it('staticArray', async function () {
    expect(await runTests('staticArray')).to.equal(BigInt(22));
  });

  it('returnStaticArray', async function () {
    expect(await runTests('returnStaticArray')).to.deep.equal([BigInt(11), BigInt(22), BigInt(33)]);
  });

  it('staticArrayArg', async function () {
    const ret = await runTests('staticArrayArg', [[BigInt(11), BigInt(22), BigInt(33)]]);
    expect(ret).to.deep.equal(BigInt(22));
  });

  it('nonLiteralStaticArrayElements', async function () {
    expect(await runTests('nonLiteralStaticArrayElements')).to.equal(BigInt(22));
  });

  it('mixedStaticArrayElements', async function () {
    expect(await runTests('mixedStaticArrayElements')).to.equal(BigInt(1 + 4 + 7));
  });

  it('nonLiteralStaticArrayAccess', async function () {
    expect(await runTests('nonLiteralStaticArrayAccess')).to.equal(BigInt(33));
  });

  it('setStaticArrayElement', async function () {
    expect(await runTests('setStaticArrayElement')).to.equal(BigInt(222));
  });

  it('staticArrayInStorageRef', async function () {
    const ret = await runTests('staticArrayInStorageRef');
    expect(ret).to.deep.equal([BigInt(22), BigInt(22), BigInt(22)]);
  });

  it('updateStaticArrayInStorageRef', async function () {
    const ret = await runTests('updateStaticArrayInStorageRef');
    expect(ret).to.deep.equal([BigInt(111), BigInt(222), BigInt(333)]);
  });

  it('staticArrayInStorageMap', async function () {
    const ret = await runTests('staticArrayInStorageMap');
    expect(ret).to.deep.equal([BigInt(22), BigInt(22), BigInt(22)]);
  });

  it('updateStaticArrayInStorageMap', async function () {
    const ret = await runTests('updateStaticArrayInStorageMap');
    expect(ret).to.deep.equal([BigInt(1111), BigInt(2222), BigInt(3333)]);
  });

  it('nestedStaticArray', async function () {
    expect(await runTests('nestedStaticArray')).to.equal(BigInt(55));
  });

  it('updateNestedStaticArrayElement', async function () {
    expect(await runTests('updateNestedStaticArrayElement')).to.equal(BigInt(555));
  });

  it('updateNestedStaticArray', async function () {
    expect(await runTests('updateNestedStaticArray')).to.equal(BigInt(555));
  });

  it('threeDimensionalUint16Array', async function () {
    expect(await runTests('threeDimensionalUint16Array')).to.equal(BigInt(888));
  });

  it('simpleTuple', async function () {
    expect(await runTests('simpleTuple')).to.equal(BigInt(44));
  });

  it('arrayInTuple', async function () {
    expect(await runTests('arrayInTuple')).to.equal(BigInt(44));
  });

  it('tupleInArray', async function () {
    expect(await runTests('tupleInArray')).to.equal(BigInt(44));
  });

  it('tupleInTuple', async function () {
    expect(await runTests('tupleInTuple')).to.equal(BigInt(66));
  });

  it('shortTypeNotation', async function () {
    expect(await runTests('shortTypeNotation')).to.equal(BigInt(66));
  });

  it('disgusting', async function () {
    expect(await runTests('disgusting')).to.equal(BigInt(8888));
  });

  it('returnTuple', async function () {
    expect(await runTests('returnTuple')).to.deep.equal([BigInt(11), BigInt(22), BigInt(33)]);
  });

  it('tupleArg', async function () {
    const ret = await runTests('tupleArg', [[BigInt(11), BigInt(22), BigInt(33)]]);
    expect(ret).to.deep.equal(BigInt(22));
  });

  it('dynamicArray', async function () {
    expect(await runTests('dynamicArray')).to.equal(BigInt(22));
  });

  it('returnDynamicArray', async function () {
    expect(await runTests('returnDynamicArray')).to.deep.equal([BigInt(11), BigInt(22), BigInt(33)]);
  });

  it('dynamicArrayArg', async function () {
    const ret = await runTests('dynamicArrayArg', [[BigInt(11), BigInt(22), BigInt(33)]]);
    expect(ret).to.deep.equal(BigInt(22));
  });

  it('updateDynamicArrayElement', async function () {
    expect(await runTests('updateDynamicArrayElement')).to.equal(BigInt(222));
  });

  it('dynamicTupleArray', async function () {
    expect(await runTests('dynamicTupleArray')).to.equal(BigInt(44));
  });

  it('returnTupleWithDyamicArray', async function () {
    expect(await runTests('returnTupleWithDyamicArray')).to.deep.equal(
      [BigInt(1), BigInt(2), [BigInt(3), BigInt(4)], [BigInt(5), BigInt(6)]],
    );
  });

  it('returnDynamicArrayFromTuple', async function () {
    expect(await runTests('returnDynamicArrayFromTuple')).to.deep.equal(
      [BigInt(7), BigInt(8)],
    );
  });

  it('updateDynamicArrayInTuple', async function () {
    const a: {old: BigInt[] | BigInt, new: BigInt[] | BigInt}[] = [
      { old: BigInt(9), new: BigInt(99) },
      { old: [BigInt(8)], new: [BigInt(10), BigInt(11)] },
      { old: [BigInt(7)], new: [BigInt(12), BigInt(13)] },
      { old: [BigInt(6)], new: [BigInt(14), BigInt(15)] },
      { old: [BigInt(5)], new: [BigInt(16), BigInt(17)] },
    ];

    expect(await runTests('updateDynamicArrayInTuple')).to.deep.equal([a[0].new, a[1].new, a[2].new, a[3].new, a[4].new]);
  });

  it('nonLiteralDynamicElementInTuple', async function () {
    expect(await runTests('nonLiteralDynamicElementInTuple')).to.deep.equal(
      [
        BigInt(1),
        BigInt(2),
        [BigInt(3), BigInt(4)],
        [BigInt(5), BigInt(6)],
        [BigInt(7), BigInt(8)]],
    );
  });

  it('arrayPush', async function () {
    expect(await runTests('arrayPush')).to.deep.equal(
      [BigInt(1), BigInt(2), BigInt(3)],
    );
  });

  it('arrayPop', async function () {
    expect(await runTests('arrayPop')).to.deep.equal([BigInt(1), BigInt(2)]);
  });

  it('arrayPopValue', async function () {
    expect(await runTests('arrayPopValue')).to.equal(BigInt(3));
  });

  it('arraySplice', async function () {
    expect(await runTests('arraySplice')).to.deep.equal([1, 3].map((n) => BigInt(n)));
  });

  it('arraySpliceValue', async function () {
    expect(await runTests('arraySpliceValue')).to.deep.equal([2, 3, 4, 5, 6, 7, 8].map((n) => BigInt(n)));
  });

  it('dynamicArrayElements', async function () {
    expect(await runTests('dynamicArrayElements')).to.deep.equal([1, 2, 3].map((n) => BigInt(n)));
  });

  it('spliceLastElement', async function () {
    expect(await runTests('spliceLastElement')).to.deep.equal([1, 2].map((n) => BigInt(n)));
  });

  it('spliceLastElementValue', async function () {
    expect(await runTests('spliceLastElementValue')).to.deep.equal([3].map((n) => BigInt(n)));
  });

  it('spliceFirstElement', async function () {
    expect(await runTests('spliceFirstElement')).to.deep.equal([2, 3].map((n) => BigInt(n)));
  });

  it('spliceFirstElementValue', async function () {
    expect(await runTests('spliceFirstElementValue')).to.deep.equal([1].map((n) => BigInt(n)));
  });

  it('stringReturn', async function () {
    const s = 'Hello World!';
    expect(await runTests('stringReturn')).to.equal(s);
  });

  it('stringArg', async function () {
    const s = 'Hello World!';
    await runTests('stringArg', [s]);
    // asert is in contract
  });

  it('stringInTuple', async function () {
    const s = 'Hello World!';
    expect(await runTests('stringInTuple')).to.deep.equal([BigInt(1), [BigInt(2)], s, [BigInt(3)]]);
  });

  it('accesStringInTuple', async function () {
    const s = 'Hello World!';
    expect(await runTests('accesStringInTuple')).to.equal(s);
  });

  it('updateStringInTuple', async function () {
    const a = [
      { old: BigInt(9), new: BigInt(99) },
      { old: [BigInt(8)], new: [BigInt(10), BigInt(11)] },
      { old: 'Hi?', new: 'Hello World!' },
      { old: [BigInt(6)], new: [BigInt(14), BigInt(15)] },
      { old: [BigInt(5)], new: [BigInt(16), BigInt(17)] },
    ];

    expect(await runTests('updateStringInTuple')).to.deep.equal([a[0].new, a[1].new, a[2].new, a[3].new, a[4].new]);
  });

  it('updateTupleWithOnlyDynamicTypes', async function () {
    expect(await runTests('updateTupleWithOnlyDynamicTypes')).to.deep.equal(
      [
        [BigInt(4), BigInt(5)],
        [BigInt(6), BigInt(7)],
        [BigInt(8), BigInt(9)]],
    );
  });

  it('shortenDynamicElementInTuple', async function () {
    expect(await runTests('shortenDynamicElementInTuple')).to.deep.equal(
      [
        [BigInt(5)],
        [BigInt(6)],
        [BigInt(7)]],
    );
  });

  it('namedTuple', async function () {
    expect(await runTests('namedTuple')).to.equal('Hello World!');
  });

  it('updateNamedTuple', async function () {
    expect(await runTests('updateNamedTuple')).to.equal('Hello World!');
  });

  it('customTypes', async function () {
    expect(await runTests('customTypes')).to.equal('Hello World!');
  });

  it('staticStringArrayArg', async function () {
    const ret = await runTests('staticStringArrayArg', [['Hello', 'World', '!']]);
    expect(ret).to.deep.equal('World');
  });

  it('dynamicAccessOfDynamicElementInStaticArray', async function () {
    const ret = await runTests('dynamicAccessOfDynamicElementInStaticArray', [['Hello', 'World', '!']]);
    expect(ret).to.deep.equal('World');
  });

  it('dynamicArrayInMiddleOfTuple', async function () {
    expect(await runTests('dynamicArrayInMiddleOfTuple')).to.deep.equal(
      [
        BigInt(1),
        [BigInt(2)],
        BigInt(3),
      ],
    );
  });

  it('accessDynamicArrayInMiddleOfTuple', async function () {
    expect(await runTests('accessDynamicArrayInMiddleOfTuple')).to.deep.equal(
      [BigInt(2)],
    );
  });

  it('accessDynamicArrayElementInTuple', async function () {
    expect(await runTests('accessDynamicArrayElementInTuple')).to.deep.equal(
      BigInt(33),
    );
  });

  it('updateDynamicArrayInMiddleOfTuple', async function () {
    expect(await runTests('updateDynamicArrayInMiddleOfTuple')).to.deep.equal(
      [
        BigInt(1),
        [BigInt(4), BigInt(5)],
        BigInt(3),
      ],
    );
  });

  it('nestedTuple', async function () {
    expect(await runTests('nestedTuple')).to.deep.equal([11n, [22n, 'foo'], [33n, 'bar']]);
  });

  it('updateDynamicElementInTupleWithSameLength', async function () {
    expect(await runTests('updateDynamicElementInTupleWithSameLength')).to.deep.equal(
      [
        1n,
        [10n, 11n, 12n],
        5n,
        [6n, 7n, 8n],
        9n,
      ],
    );
  });

  it('accessDynamicStringArray', async function () {
    expect(await runTests('accessDynamicStringArray')).to.deep.equal('World');
  });
});
