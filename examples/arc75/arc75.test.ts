/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { expect, test, describe, beforeAll, beforeEach } from '@jest/globals';
import algosdk from 'algosdk';
import * as algokit from '@algorandfoundation/algokit-utils';
import { Arc75Client } from './ARC75Client';

let arc75: Arc75Client;
const ARC = 'ARCX';
let senderAddr: string;
let appId: number | bigint;
let appAddress: string;
let signer: algosdk.TransactionSigner;

const algodClient = new algosdk.Algodv2('a'.repeat(64), 'http://localhost', 4001);
const kmdClient = new algosdk.Kmd('a'.repeat(64), 'http://localhost', 4002);

function getBoxRef(boxIndex: number, arc: string) {
  const keyType = algosdk.ABIType.from('(address,uint16,string)');

  return {
    appIndex: 0,
    name: keyType.encode([senderAddr, BigInt(boxIndex), arc]),
  };
}

async function getBoxValue(boxIndex: number, arc: string) {
  const valueType = algosdk.ABIType.from('uint64[]');
  return valueType.decode(await arc75.appClient.getBoxValue(getBoxRef(boxIndex, arc).name));
}

async function addApp(mbr: number, boxIndex: number, appID: number, arc: string) {
  const payment = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: senderAddr,
    to: appAddress,
    amount: mbr,
    suggestedParams: await algodClient.getTransactionParams().do(),
  });

  await arc75.addAppToWhiteList(
    {
      arc: ARC,
      boxIndex,
      appID: BigInt(appID),
      payment,
    },
    {
      boxes: [getBoxRef(boxIndex, arc)],
      sendParams: { suppressLog: true },
    }
  );
}

async function setApps(mbr: number, boxIndex: number, appIDs: number[]) {
  const suggestedParams = await algodClient.getTransactionParams().do();
  const atc = new algosdk.AtomicTransactionComposer();

  if (mbr) {
    const payment = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: senderAddr,
      to: appAddress,
      amount: mbr,
      suggestedParams,
    });

    atc.addTransaction({ txn: payment, signer });
  }

  const sp = { ...suggestedParams, fee: 2_000, flatFee: true };
  atc.addMethodCall({
    appID: Number(appId),
    method: arc75.appClient.getABIMethod('setAppWhitelist')!,
    methodArgs: [ARC, BigInt(boxIndex), appIDs.map((c) => BigInt(c))],
    sender: senderAddr,
    signer,
    suggestedParams: sp,
    boxes: [getBoxRef(boxIndex, ARC)],
  });

  await atc.execute(algodClient, 3);
}

let id = 0;

describe('ARC75', function () {
  beforeAll(async function () {
    const acct = algosdk.generateAccount();

    await algokit.ensureFunded(
      { accountToFund: acct, minSpendingBalance: algokit.microAlgos(1_000_000), suppressLog: true },
      algodClient,
      kmdClient
    );
    senderAddr = acct.addr;

    signer = algosdk.makeBasicAccountTransactionSigner(acct);

    arc75 = new Arc75Client(
      {
        sender: { signer, addr: acct.addr },
        resolveBy: 'id',
        id: 0,
      },
      algodClient
    );

    await arc75.create.createApplication({ sendParams: { suppressLog: true } });

    const appRef = await arc75.appClient.getAppReference();
    appAddress = appRef.appAddress;
    appId = appRef.appId;

    const atc = new algosdk.AtomicTransactionComposer();
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: acct.addr,
      to: appAddress,
      amount: 100_000,
      suggestedParams: await algodClient.getTransactionParams().do(),
    });
    atc.addTransaction({ txn, signer });
    await atc.execute(algodClient, 3);
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

    const preBalance = (await algodClient.accountInformation(senderAddr).do()).amount;

    await setApps(0, id, [44]);

    const balance = (await algodClient.accountInformation(senderAddr).do()).amount;

    const boxValue = await getBoxValue(id, ARC);
    expect(boxValue).toEqual([BigInt(44)]);

    expect(balance - preBalance).toEqual(3200 * 2 - 2_000);
  });

  test('deleteWhitelist', async function () {
    const preBalance = (await algodClient.accountInformation(senderAddr).do()).amount;

    await setApps(23300 + 3200 * 2, id, [11, 22, 33]);

    await arc75.deleteWhitelist(
      { arc: ARC, boxIndex: id },
      {
        boxes: [getBoxRef(id, ARC)],
        sendParams: { fee: algokit.microAlgos(2_000), suppressLog: true },
      }
    );

    const balance = (await algodClient.accountInformation(senderAddr).do()).amount;

    expect(preBalance - balance).toEqual(5_000);
  });

  test('deleteApp', async function () {
    await setApps(23300 + 3200 * 2, id, [11, 22, 33]);

    const preBalance = (await algodClient.accountInformation(senderAddr).do()).amount;

    await arc75.deleteAppFromWhitelist(
      {
        arc: ARC,
        boxIndex: id,
        appID: BigInt(22),
        index: BigInt(1),
      },
      {
        boxes: [getBoxRef(id, ARC)],
        sendParams: { fee: algokit.microAlgos(2_000), suppressLog: true },
      }
    );

    const balance = (await algodClient.accountInformation(senderAddr).do()).amount;

    const boxValue = await getBoxValue(id, ARC);
    expect(boxValue).toEqual([BigInt(11), BigInt(33)]);

    expect(balance - preBalance).toEqual(3_200 - 2_000);
  });
});
