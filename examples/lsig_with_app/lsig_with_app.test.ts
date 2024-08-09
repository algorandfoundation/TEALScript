import { describe, test, beforeAll, beforeEach } from '@jest/globals';
// eslint-disable-next-line import/no-unresolved
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing';
import * as algokit from '@algorandfoundation/algokit-utils';
import algosdk from 'algosdk';
import { readFileSync } from 'fs';
import { CreatorVerifierClient } from './CreatorVerifierClient';

const optInLsigTeal = readFileSync(`${__dirname}/artifacts/OptInLsig.lsig.teal`, 'utf8');
algokit.Config.configure({ populateAppCallResources: true });

async function getLsigAccount(algod: algosdk.Algodv2, appID: bigint, tealTemplate: string) {
  // Replace the template variable in the lsig TEAL
  const teal = tealTemplate.replace('TMPL_APP_ID', `0x${appID.toString(16).padStart(16, '0')}`);

  // Compile the TEAL
  const result = await algod.compile(Buffer.from(teal)).do();
  const b64program = result.result;

  // Generate a LogicSigAccount object from the compiled program
  return new algosdk.LogicSigAccount(new Uint8Array(Buffer.from(b64program, 'base64')));
}

describe('Lsig With App', () => {
  const fixture = algorandFixture();

  let appClient: CreatorVerifierClient;

  let asa: bigint;

  let alice: algosdk.Account;

  let bob: algosdk.Account;

  let bobSignature: Uint8Array;

  beforeEach(fixture.beforeEach);

  beforeAll(async () => {
    await fixture.beforeEach();
    const { algod, testAccount } = fixture.context;

    alice = testAccount;

    appClient = new CreatorVerifierClient(
      {
        sender: testAccount,
        resolveBy: 'id',
        id: 0,
      },
      algod
    );

    await appClient.create.createApplication({});

    // Create an ASA to use in our tests
    const asaCreateTxn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      suggestedParams: await algod.getTransactionParams().do(),
      from: testAccount.addr,
      total: 1,
      decimals: 0,
      defaultFrozen: false,
    });

    const { confirmation } = await algokit.sendTransaction({ transaction: asaCreateTxn, from: testAccount }, algod);

    asa = BigInt(confirmation!.assetIndex!);

    await appClient.appClient.fundAppAccount(algokit.microAlgos(100_000));
  });

  test('Program signed by bob', async () => {
    const { algod, testAccount } = fixture.context;
    bob = testAccount;
    const { appId } = await appClient.appClient.getAppReference();

    const lsigAccount = await getLsigAccount(algod, BigInt(appId), optInLsigTeal);

    // Sign the program with bob's secret key
    // This will allow transactions to be sent from bob's account if the logic signature is used
    lsigAccount.sign(bob.sk);

    // Save bob's signature for later use
    bobSignature = lsigAccount.lsig.sig!;
  });

  test("bob allows opt ins for alice's ASAs", async () => {
    await appClient.appClient.fundAppAccount(algokit.microAlgos(28_500));

    // Using bob's account, call the app and tell it to allow opt ins from alice
    appClient.allowOptInsFrom(
      { creator: alice.addr },
      {
        sender: bob,
      }
    );
  });

  test('verifyCreator and opt in', async () => {
    const { algod } = fixture.context;
    const { appId } = await appClient.appClient.getAppReference();

    const lsigAccount = await getLsigAccount(algod, BigInt(appId), optInLsigTeal);

    // Specify that this will be a delegated account for bob by setting the sigkey to his publicKey
    lsigAccount.sigkey = algosdk.decodeAddress(bob.addr).publicKey;

    // Set bob's signature so the node knows that this was indeed signed by Bob
    lsigAccount.lsig.sig = bobSignature;

    // Form an opt in transaction from Bob
    const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: bob.addr,
      to: bob.addr,
      assetIndex: Number(asa),
      amount: 0,
      suggestedParams: { ...(await algod.getTransactionParams().do()), fee: 0, flatFee: true },
    });

    await appClient.verifyCreator(
      // Use the opt in transaction from Bob, but sign with the lsig account instead of Bob's account
      { optIn: { transaction: optInTxn, signer: lsigAccount }, _asaReference: asa },
      {
        // This transaction is being sent by alice, so bob is doing nothing to send this transaction since he alread signed the lsig
        sender: alice,
        sendParams: { fee: algokit.microAlgos(2_000) },
      }
    );
  });
});
