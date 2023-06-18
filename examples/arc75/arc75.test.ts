/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  expect, test, describe, beforeAll, beforeEach,
} from '@jest/globals';
import { sandbox, clients } from 'beaker-ts';
import algosdk from 'algosdk';
import { ARC75 } from './arc75_client';

let appClient: ARC75;
const ARC = 'ARCX';

function getBoxRef(boxIndex: number, arc: string) {
  const keyType = algosdk.ABIType.from('(address,uint16,string)');

  return {
    appIndex: 0,
    name: keyType.encode([appClient.sender, BigInt(boxIndex), arc]),
  };
}

async function getBoxValue(boxIndex: number, arc: string) {
  const valueType = algosdk.ABIType.from('uint64[]');
  return valueType.decode(await appClient.getApplicationBox(getBoxRef(boxIndex, arc).name));
}

async function addApp(mbr: number, boxIndex: number, appID: number, arc: string) {
  const payment = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: appClient.sender,
    to: appClient.appAddress,
    amount: mbr,
    suggestedParams: await clients.sandboxAlgod().getTransactionParams().do(),
  });

  await appClient.addAppToWhiteList(
    {
      arc: ARC,
      boxIndex: BigInt(boxIndex),
      appID: BigInt(appID),
      payment,
    },
    {
      boxes: [getBoxRef(boxIndex, arc)],
    },
  );
}

async function setApps(mbr: number, boxIndex: number, appIDs: number[]) {
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
    method: algosdk.getMethodByName(appClient.methods, 'setAppWhitelist'),
    methodArgs: [ARC, BigInt(boxIndex), appIDs.map((c) => BigInt(c))],
    sender: appClient.sender,
    signer: appClient.signer,
    suggestedParams: sp,
    boxes: [getBoxRef(boxIndex, ARC)],
  });

  await atc.execute(appClient.client, 3);
}

let id = 0;

describe('ARC75', function () {
  beforeAll(async function () {
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

  test('initializeWithAdd', async function () {
    await addApp(23300, id, 11, ARC);
    const boxValue = await getBoxValue(id, ARC);
    expect(boxValue).toEqual([BigInt(11)]);
  });

  test('mutliAdd', async function () {
    await addApp(23300, id, 11, ARC);
    await addApp(3200, id, 22, ARC);
    const boxValue = await getBoxValue(id, ARC);
    expect(boxValue).toEqual([BigInt(11), BigInt(22)]);
  });

  test('initializeWithSet', async function () {
    await setApps(23300, id, [11]);

    const boxValue = await getBoxValue(id, ARC);
    expect(boxValue).toEqual([BigInt(11)]);
  });

  test('addTwoWithSet', async function () {
    await setApps(23300, id, [11]);
    await setApps(3200 * 2, id, [11, 22, 33]);

    const boxValue = await getBoxValue(id, ARC);
    expect(boxValue).toEqual([BigInt(11), BigInt(22), BigInt(33)]);
  });

  test('removeWithSet', async function () {
    await setApps(23300 + 3200 * 2, id, [11, 22, 33]);

    /*
    const preBalance = (
      await clients.sandboxAlgod().accountInformation(appClient.sender).do()
    ).amount;
    */

    await setApps(0, id, [44]);

    /*
    const balance = (
      await clients.sandboxAlgod().accountInformation(appClient.sender).do()
    ).amount;
    */

    const boxValue = await getBoxValue(id, ARC);
    expect(boxValue).toEqual([BigInt(44)]);
    // TODO: use new account to prevent balance race conditions
    // expect(balance - preBalance).toEqual(3200 * 2 - 2_000);
  });

  test('deleteWhitelist', async function () {
    const preBalance = (
      await clients.sandboxAlgod().accountInformation(appClient.sender).do()
    ).amount;

    await setApps(23300 + 3200 * 2, id, [11, 22, 33]);

    await appClient.deleteWhitelist(
      { arc: ARC, boxIndex: BigInt(id) },
      {
        boxes: [getBoxRef(id, ARC)],
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

    expect(preBalance - balance).toEqual(5_000);
  });

  test('deleteApp', async function () {
    await setApps(23300 + 3200 * 2, id, [11, 22, 33]);

    const preBalance = (
      await clients.sandboxAlgod().accountInformation(appClient.sender).do()
    ).amount;

    await appClient.deleteAppFromWhitelist(
      {
        arc: ARC, boxIndex: BigInt(id), appID: BigInt(22), index: BigInt(1),
      },
      {
        boxes: [getBoxRef(id, ARC)],
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

    const boxValue = await getBoxValue(id, ARC);
    expect(boxValue).toEqual([BigInt(11), BigInt(33)]);

    expect(balance - preBalance).toEqual(3_200 - 2_000);
  });
});
