import { describe, test, beforeAll, beforeEach, expect } from '@jest/globals';
// eslint-disable-next-line import/no-unresolved
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing';
import * as algokit from '@algorandfoundation/algokit-utils';
import algosdk from 'algosdk';
import { MockVrfBeaconClient } from './MockVRFBeaconClient';
import { NftRaffleClient } from './NFTRaffleClient';

const BOX_COST = 21_700;

describe('Raffle', () => {
  const fixture = algorandFixture();

  let appClient: NftRaffleClient;

  let asa: bigint;

  let alice: algosdk.Account;

  let bob: algosdk.Account;

  let randomnessOracle: bigint;

  beforeEach(fixture.beforeEach);

  beforeAll(async () => {
    await fixture.beforeEach();
    const { algod, testAccount } = fixture.context;

    const beaconClient = new MockVrfBeaconClient(
      {
        sender: testAccount,
        resolveBy: 'id',
        id: 0,
      },
      algod
    );

    await beaconClient.create.createApplication({});

    randomnessOracle = BigInt((await beaconClient.appClient.getAppReference()).appId);

    alice = testAccount;

    appClient = new NftRaffleClient(
      {
        sender: testAccount,
        resolveBy: 'id',
        id: 0,
      },
      algod
    );

    await appClient.create.createApplication({
      ticketPrice: 100,
      randomnessOracle,
    });

    const asaCreateTxn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      suggestedParams: await algod.getTransactionParams().do(),
      from: testAccount.addr,
      total: 1,
      decimals: 0,
      defaultFrozen: false,
    });

    const { confirmation } = await algokit.sendTransaction({ transaction: asaCreateTxn, from: testAccount }, algod);

    asa = BigInt(confirmation!.assetIndex!);

    await appClient.appClient.fundAppAccount(algokit.microAlgos(200_000));
  });

  test('setAsset', async () => {
    await appClient.setAsset({ asset: asa }, { sendParams: { fee: algokit.microAlgos(2_000) } });
  });

  test('startRaffle', async () => {
    const { algod } = fixture.context;

    const lastRound = BigInt((await algod.status().do())['last-round']);

    const axfer = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: alice.addr,
      assetIndex: Number(asa),
      to: (await appClient.appClient.getAppReference()).appAddress,
      suggestedParams: await algod.getTransactionParams().do(),
      amount: 1,
    });

    await appClient.startRaffle({ axfer, end: lastRound + BigInt(100), draw: lastRound + BigInt(101) });
  });

  test('buyTickets', async () => {
    const { algod, testAccount } = fixture.context;

    bob = testAccount;

    const ticketPrice = (await appClient.getGlobalState()).ticketPrice!.asNumber();
    const quantity = 50;

    const to = (await appClient.appClient.getAppReference()).appAddress;

    const alicePayment = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: alice.addr,
      to,
      suggestedParams: await algod.getTransactionParams().do(),
      amount: ticketPrice * quantity + BOX_COST,
    });

    await appClient.buyTickets(
      { payment: alicePayment, quantity: 50 },
      { boxes: [algosdk.decodeAddress(alice.addr).publicKey] }
    );

    const bobPayment = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: bob.addr,
      to,
      suggestedParams: await algod.getTransactionParams().do(),
      amount: ticketPrice * quantity + BOX_COST,
    });

    await appClient.buyTickets(
      { payment: bobPayment, quantity: 50 },
      { sender: bob, boxes: [algosdk.decodeAddress(bob.addr).publicKey] }
    );
  });

  test('draw', async () => {
    const result = await appClient.draw(
      { _oracleReference: randomnessOracle },
      { sendParams: { fee: algokit.microAlgos(2_000) } }
    );

    expect(result.return?.valueOf()).toBe(true);
  });
});
