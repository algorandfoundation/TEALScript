/* eslint-disable no-plusplus */
import * as algokit from '@algorandfoundation/algokit-utils';
import fs from 'fs';
// eslint-disable-next-line import/no-unresolved
import { ApplicationClient } from '@algorandfoundation/algokit-utils/types/app-client';
import { describe, test, expect, beforeAll } from '@jest/globals';
import algosdk from 'algosdk';
import { algodClient, kmdClient } from '../../tests/common';
import appSpec from './artifacts/BigBox.arc32.json';

algokit.Config.configure({ populateAppCallResources: true });

const COST_PER_BYTE = 400;
const COST_PER_BOX = 2500;

const BYTES_PER_CALL =
  2048 -
  4 - // 4 bytes for the method selector
  64 - // 64 bytes for the name
  8 - // 8 bytes for the box index
  8; // 8 bytes for the offset
type DataInfo = { start: BigInt; end: BigInt; status: BigInt; endSize: BigInt };

describe('Big Box', () => {
  let data: Buffer;
  let appClient: ApplicationClient;
  let sender: algosdk.Account;

  beforeAll(async () => {
    sender = await algokit.getDispenserAccount(algodClient, kmdClient);
    data = fs.readFileSync(`${__dirname}/TEAL.pdf`);

    appClient = new ApplicationClient(
      {
        resolveBy: 'id',
        id: 0,
        sender,
        app: JSON.stringify(appSpec),
      },
      algodClient
    );

    await appClient.create({
      method: 'createApplication',
      methodArgs: [],
      sendParams: { suppressLog: true },
    });
  });

  test('startUpload', async () => {
    const numBoxes = Math.ceil(data.byteLength / 32768);

    const endBoxSize = data.byteLength % 32768;

    const totalCost =
      numBoxes * COST_PER_BOX +
      (numBoxes - 1) * 32768 * COST_PER_BYTE +
      numBoxes * 64 * COST_PER_BYTE +
      endBoxSize * COST_PER_BYTE;

    const mbrPayment = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: sender.addr,
      to: (await appClient.getAppReference()).appAddress,
      amount: totalCost,
      suggestedParams: await algodClient.getTransactionParams().do(),
    });

    const dataName = new Uint8Array(Buffer.from('TEAL.pdf'));

    await appClient.call({
      method: 'startUpload',
      methodArgs: ['TEAL.pdf', numBoxes, endBoxSize, mbrPayment],
      sendParams: { suppressLog: true },
    });

    const res = (await appClient.getBoxValueFromABIType(
      dataName,
      algosdk.ABIType.from('(uint64,uint64,uint8,uint64)')
    )) as BigInt[];
    const dataInfo: DataInfo = {
      start: res[0] as BigInt,
      end: res[1] as BigInt,
      status: res[2] as BigInt,
      endSize: res[3] as BigInt,
    };

    expect(dataInfo.start).toBe(0n);
    expect(dataInfo.end).toBe(BigInt(numBoxes - 1));
    expect(dataInfo.status).toBe(0n);
    expect(dataInfo.endSize).toBe(BigInt(endBoxSize));
  });

  test('upload', async () => {
    const numBoxes = Math.floor(data.byteLength / 32768);
    const boxData: Buffer[] = [];

    for (let i = 0; i < numBoxes; i++) {
      const box = data.subarray(i * 32768, (i + 1) * 32768);
      boxData.push(box);
    }

    boxData.push(data.subarray(numBoxes * 32768, data.byteLength));

    const suggestedParams = await algodClient.getTransactionParams().do();
    const appID = Number((await appClient.getAppReference()).appId);

    const boxPromises = boxData.map(async (box, boxIndex) => {
      const numChunks = Math.ceil(box.byteLength / BYTES_PER_CALL);

      const chunks: Buffer[] = [];

      for (let i = 0; i < numChunks; i++) {
        chunks.push(box.subarray(i * BYTES_PER_CALL, (i + 1) * BYTES_PER_CALL));
      }

      const boxRef = { appIndex: 0, name: algosdk.encodeUint64(boxIndex) };
      const boxes: algosdk.BoxReference[] = new Array(7).fill(boxRef);

      boxes.push({ appIndex: 0, name: new Uint8Array(Buffer.from('TEAL.pdf')) });

      const firstGroup = chunks.slice(0, 8);
      const secondGroup = chunks.slice(8);

      const firstAtc = new algosdk.AtomicTransactionComposer();
      firstGroup.forEach((chunk, i) => {
        firstAtc.addMethodCall({
          method: appClient.getABIMethod('upload')!,
          methodArgs: [Buffer.from('TEAL.pdf'), boxIndex, BYTES_PER_CALL * i, chunk],
          boxes,
          suggestedParams,
          sender: sender.addr,
          signer: algosdk.makeBasicAccountTransactionSigner(sender),
          appID,
        });
      });

      await algokit.sendAtomicTransactionComposer({ atc: firstAtc }, algodClient);

      if (secondGroup.length === 0) return;

      const secondAtc = new algosdk.AtomicTransactionComposer();
      secondGroup.forEach((chunk, i) => {
        secondAtc.addMethodCall({
          method: appClient.getABIMethod('upload')!,
          methodArgs: [Buffer.from('TEAL.pdf'), boxIndex, BYTES_PER_CALL * (i + 8), chunk],
          boxes,
          suggestedParams,
          sender: sender.addr,
          signer: algosdk.makeBasicAccountTransactionSigner(sender),
          appID,
        });
      });

      await algokit.sendAtomicTransactionComposer({ atc: secondAtc }, algodClient);
    });

    await Promise.all(boxPromises);

    const boxValuePromises = boxData.map(async (_, boxIndex) => appClient.getBoxValue(algosdk.encodeUint64(boxIndex)));

    const boxValues = await Promise.all(boxValuePromises);

    boxValues.forEach((val, i) => {
      expect(Buffer.from(val).toString('hex')).toEqual(boxData[i].toString('hex'));
    });

    expect(Buffer.concat(boxValues).toString('hex')).toEqual(data.toString('hex'));
  });
});
