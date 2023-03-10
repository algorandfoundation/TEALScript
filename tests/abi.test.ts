/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { expect } from 'chai';
import { sandbox, clients } from 'beaker-ts';
import algosdk from 'algosdk';
import { AbiTest } from './contracts/clients/abitest_client';

let appClient: AbiTest;

describe('ABI', function () {
  before(async function () {
    const acct = (await sandbox.getAccounts()).pop()!;

    appClient = new AbiTest({
      client: clients.sandboxAlgod(),
      signer: acct.signer,
      sender: acct.addr,
    });

    await appClient.create({ extraPages: 2 });
    await appClient.optIn();

    const atc = new algosdk.AtomicTransactionComposer();

    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: acct.addr,
      to: appClient.appAddress,
      amount: 127400,
      suggestedParams: await clients.sandboxAlgod().getTransactionParams().do(),
    });

    atc.addTransaction({ txn, signer: acct.signer });
    await atc.execute(clients.sandboxAlgod(), 3);
  });

  it('staticArray', async function () {
    const ret = await appClient.staticArray();
    expect(ret.returnValue).to.equal(BigInt(22));
  });

  it('returnStaticArray', async function () {
    const ret = await appClient.returnStaticArray();
    expect(ret.returnValue).to.deep.equal([BigInt(11), BigInt(22), BigInt(33)]);
  });

  it('staticArrayArg', async function () {
    const ret = await appClient.staticArrayArg({
      a: [BigInt(11), BigInt(22), BigInt(33)],
    });
    expect(ret.returnValue).to.deep.equal(BigInt(22));
  });

  it('nonLiteralStaticArrayElements', async function () {
    const ret = await appClient.nonLiteralStaticArrayElements();
    expect(ret.returnValue).to.equal(BigInt(22));
  });

  it('mixedStaticArrayElements', async function () {
    const ret = await appClient.mixedStaticArrayElements();
    expect(ret.returnValue).to.equal(BigInt(1 + 4 + 7));
  });

  it('nonLiteralStaticArrayAccess', async function () {
    const ret = await appClient.nonLiteralStaticArrayAccess();
    expect(ret.returnValue).to.equal(BigInt(33));
  });

  it('setStaticArrayElement', async function () {
    const ret = await appClient.setStaticArrayElement();
    expect(ret.returnValue).to.equal(BigInt(222));
  });

  it('staticArrayInStorageRef', async function () {
    const ret = await appClient.staticArrayInStorageRef(
      { boxes: [{ appIndex: 0, name: new Uint8Array(Buffer.from('bRef')) }] },
    );
    expect(ret.returnValue).to.deep.equal([BigInt(22), BigInt(22), BigInt(22)]);
  });

  it('updateStaticArrayInStorageRef', async function () {
    const ret = await appClient.updateStaticArrayInStorageRef(
      { boxes: [{ appIndex: 0, name: new Uint8Array(Buffer.from('bRef')) }] },
    );

    expect(ret.returnValue).to.deep.equal([BigInt(111), BigInt(222), BigInt(333)]);
  });

  it('staticArrayInStorageMap', async function () {
    const ret = await appClient.staticArrayInStorageMap(
      { boxes: [{ appIndex: 0, name: new Uint8Array(Buffer.from('bMap')) }] },
    );
    expect(ret.returnValue).to.deep.equal([BigInt(22), BigInt(22), BigInt(22)]);
  });

  it('updateStaticArrayInStorageMap', async function () {
    const ret = await appClient.updateStaticArrayInStorageMap(
      { boxes: [{ appIndex: 0, name: new Uint8Array(Buffer.from('bMap')) }] },
    );

    expect(ret.returnValue).to.deep.equal([BigInt(1111), BigInt(2222), BigInt(3333)]);
  });

  it('nestedStaticArray', async function () {
    const ret = await appClient.nestedStaticArray();
    expect(ret.returnValue).to.equal(BigInt(55));
  });

  it('updateNestedStaticArrayElement', async function () {
    const ret = await appClient.updateNestedStaticArrayElement();
    expect(ret.returnValue).to.equal(BigInt(555));
  });

  it('updateNestedStaticArray', async function () {
    const ret = await appClient.updateNestedStaticArray();
    expect(ret.returnValue).to.equal(BigInt(555));
  });

  it('threeDimensionalUint16Array', async function () {
    const ret = await appClient.threeDimensionalUint16Array();
    expect(ret.returnValue).to.equal(BigInt(888));
  });

  it('simpleTuple', async function () {
    const ret = await appClient.simpleTuple();
    expect(ret.returnValue).to.equal(BigInt(44));
  });

  it('arrayInTuple', async function () {
    const ret = await appClient.arrayInTuple();
    expect(ret.returnValue).to.equal(BigInt(44));
  });

  it('tupleInArray', async function () {
    const ret = await appClient.tupleInArray();
    expect(ret.returnValue).to.equal(BigInt(44));
  });

  it('tupleInTuple', async function () {
    const ret = await appClient.tupleInTuple();
    expect(ret.returnValue).to.equal(BigInt(66));
  });

  it('shortTypeNotation', async function () {
    const ret = await appClient.shortTypeNotation();
    expect(ret.returnValue).to.equal(BigInt(66));
  });

  it('disgusting', async function () {
    const ret = await appClient.disgusting();
    expect(ret.returnValue).to.equal(BigInt(8888));
  });

  it('returnTuple', async function () {
    const ret = await appClient.returnTuple();
    expect(ret.returnValue).to.deep.equal([BigInt(11), BigInt(22), BigInt(33)]);
  });

  it('tupleArg', async function () {
    const ret = await appClient.tupleArg({
      a: [BigInt(11), BigInt(22), BigInt(33)],
    });
    expect(ret.returnValue).to.deep.equal(BigInt(22));
  });

  it('dynamicArray', async function () {
    const ret = await appClient.dynamicArray();
    expect(ret.returnValue).to.equal(BigInt(22));
  });

  it('returnDynamicArray', async function () {
    const ret = await appClient.returnDynamicArray();
    expect(ret.returnValue).to.deep.equal([BigInt(11), BigInt(22), BigInt(33)]);
  });

  it('dynamicArrayArg', async function () {
    const ret = await appClient.dynamicArrayArg({
      a: [BigInt(11), BigInt(22), BigInt(33)],
    });
    expect(ret.returnValue).to.deep.equal(BigInt(22));
  });

  it('updateDynamicArrayElement', async function () {
    const ret = await appClient.updateDynamicArrayElement();
    expect(ret.returnValue).to.equal(BigInt(222));
  });

  it('dynamicTupleArray', async function () {
    const ret = await appClient.dynamicTupleArray();
    expect(ret.returnValue).to.equal(BigInt(44));
  });

  it('returnTupleWithDyamicArray', async function () {
    const ret = await appClient.returnTupleWithDyamicArray();
    expect(ret.returnValue).to.deep.equal(
      [BigInt(1), BigInt(2), [BigInt(3), BigInt(4)], [BigInt(5), BigInt(6)]],
    );
  });

  it('returnDynamicArrayFromTuple', async function () {
    const ret = await appClient.returnDynamicArrayFromTuple();
    expect(ret.returnValue).to.deep.equal(
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

    const ret = await appClient.updateDynamicArrayInTuple();
    expect(ret.returnValue).to.deep.equal([a[0].new, a[1].new, a[2].new, a[3].new, a[4].new]);
  });

  it('nonLiteralDynamicElementInTuple', async function () {
    const ret = await appClient.nonLiteralDynamicElementInTuple();
    expect(ret.returnValue).to.deep.equal(
      [
        BigInt(1),
        BigInt(2),
        [BigInt(3), BigInt(4)],
        [BigInt(5), BigInt(6)],
        [BigInt(7), BigInt(8)]],
    );
  });
});
