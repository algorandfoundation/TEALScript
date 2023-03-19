/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from 'chai';
import { sandbox, clients } from 'beaker-ts';
import algosdk from 'algosdk';
import { ARC75 } from './arc75_client';

let appClient: ARC75;

function getBoxRef(id: number) {
  const keyType = algosdk.ABIType.from('(address,uint16)');

  return {
    appIndex: 0,
    name: keyType.encode([appClient.sender, BigInt(id)]),
  };
}

async function getBoxValue(id: number) {
  const valueType = algosdk.ABIType.from('uint64[]');
  return valueType.decode(await appClient.getApplicationBox(getBoxRef(id).name));
}

async function addCollection(mbr: number, id: number, collection: number) {
  const payment = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: appClient.sender,
    to: appClient.appAddress,
    amount: mbr,
    suggestedParams: await clients.sandboxAlgod().getTransactionParams().do(),
  });

  await appClient.addCollectionToWhiteList(
    {
      id: BigInt(id),
      collection: BigInt(collection),
      payment,
    },
    {
      boxes: [getBoxRef(id)],
    },
  );
}

async function setCollections(mbr: number, id: number, collections: number[]) {
  const suggestedParams = await appClient.client.getTransactionParams().do();
  const atc = new algosdk.AtomicTransactionComposer();

  if (mbr) {
    const payment = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: appClient.sender,
      to: appClient.appAddress,
      amount: mbr,
      suggestedParams,
    });

    atc.addTransaction({ txn: payment, signer: appClient.signer });
  }

  const sp = { ...suggestedParams, fee: 2_000, flatFee: true };
  atc.addMethodCall({
    appID: appClient.appId,
    method: algosdk.getMethodByName(appClient.methods, 'setCollectionWhitelist'),
    methodArgs: [BigInt(id), collections.map((c) => BigInt(c))],
    sender: appClient.sender,
    signer: appClient.signer,
    suggestedParams: sp,
    boxes: [getBoxRef(id)],
  });

  await atc.execute(appClient.client, 3);
}

let id = 0;

describe('ABI', function () {
  before(async function () {
    const acct = (await sandbox.getAccounts()).pop()!;

    appClient = new ARC75({
      client: clients.sandboxAlgod(),
      signer: acct.signer,
      sender: acct.addr,
    });

    await appClient.create();

    const atc = new algosdk.AtomicTransactionComposer();
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: acct.addr,
      to: appClient.appAddress,
      amount: 100_000,
      suggestedParams: await clients.sandboxAlgod().getTransactionParams().do(),
    });
    atc.addTransaction({ txn, signer: acct.signer });
    await atc.execute(clients.sandboxAlgod(), 3);
  });

  beforeEach(function () {
    id += 1;
  });

  it('initializeWithAdd', async function () {
    await addCollection(20100, id, 11);
    const boxValue = await getBoxValue(id);
    expect(boxValue).to.deep.equal([BigInt(11)]);
  });

  it('mutliAdd', async function () {
    await addCollection(20100, id, 11);
    await addCollection(3200, id, 22);
    const boxValue = await getBoxValue(id);
    expect(boxValue).to.deep.equal([BigInt(11), BigInt(22)]);
  });

  it('initializeWithSet', async function () {
    await setCollections(20100, id, [11]);

    const boxValue = await getBoxValue(id);
    expect(boxValue).to.deep.equal([BigInt(11)]);
  });

  it('addTwoWithSet', async function () {
    await setCollections(20100, id, [11]);
    await setCollections(3200 * 2, id, [11, 22, 33]);

    const boxValue = await getBoxValue(id);
    expect(boxValue).to.deep.equal([BigInt(11), BigInt(22), BigInt(33)]);
  });

  it('removeWithSet', async function () {
    await setCollections(20100 + 3200 * 2, id, [11, 22, 33]);

    const preBalance = (
      await clients.sandboxAlgod().accountInformation(appClient.sender).do()
    ).amount;

    await setCollections(0, id, [44]);

    const balance = (
      await clients.sandboxAlgod().accountInformation(appClient.sender).do()
    ).amount;

    const boxValue = await getBoxValue(id);
    expect(boxValue).to.deep.equal([BigInt(44)]);
    expect(balance - preBalance).to.equal(3200 * 2 - 2_000);
  });

  it('deleteWhitelist', async function () {
    const preBalance = (
      await clients.sandboxAlgod().accountInformation(appClient.sender).do()
    ).amount;

    await setCollections(20100 + 3200 * 2, id, [11, 22, 33]);

    await appClient.deleteWhitelist(
      { id: BigInt(id) },
      {
        boxes: [getBoxRef(id)],
        suggestedParams: {
          ...(await appClient.client.getTransactionParams().do()),
          fee: 2_000,
          flatFee: true,
        },
      },
    );

    const balance = (
      await clients.sandboxAlgod().accountInformation(appClient.sender).do()
    ).amount;

    expect(preBalance - balance).to.equal(5_000);
  });

  it('deleteCollection', async function () {
    await setCollections(20100 + 3200 * 2, id, [11, 22, 33]);

    const preBalance = (
      await clients.sandboxAlgod().accountInformation(appClient.sender).do()
    ).amount;

    await appClient.deleteCollectionFromWhitelist(
      { id: BigInt(id), collection: BigInt(22), index: BigInt(1) },
      {
        boxes: [getBoxRef(id)],
        suggestedParams: {
          ...(await appClient.client.getTransactionParams().do()),
          fee: 2_000,
          flatFee: true,
        },
      },
    );

    const balance = (
      await clients.sandboxAlgod().accountInformation(appClient.sender).do()
    ).amount;

    const boxValue = await getBoxValue(id);
    expect(boxValue).to.deep.equal([BigInt(11), BigInt(33)]);

    expect(balance - preBalance).to.equal(3_200 - 2_000);
  });
});
