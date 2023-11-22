import { describe, test, beforeAll, beforeEach } from '@jest/globals';
// eslint-disable-next-line import/no-unresolved
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing';
import * as algokit from '@algorandfoundation/algokit-utils';
import algosdk from 'algosdk';
import { readFileSync } from 'fs';
import { CreatorVerifierClient } from './CreatorVerifierClient';

const optInLsigTeal = readFileSync(`${__dirname}/artifacts/OptInLsig.lsig.teal`, 'utf8');

async function getLsigAccount(algod: algosdk.Algodv2, appID: bigint, tealTemplate: string) {
  const teal = tealTemplate.replace('TMPL_APP_ID', appID.toString());
  const result = await algod.compile(Buffer.from(teal)).do();
  const b64program = result.result;
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
    lsigAccount.sign(bob.sk);

    bobSignature = lsigAccount.lsig.sig!;
  });

  test("bob allows opt ins for alice's ASAs", async () => {
    await appClient.appClient.fundAppAccount(algokit.microAlgos(28_500));

    appClient.allowOptInsFrom(
      { creator: alice.addr },
      {
        sender: bob,
        boxes: [
          {
            appId: 0,
            name: new Uint8Array(
              Buffer.concat([algosdk.decodeAddress(bob.addr).publicKey, algosdk.decodeAddress(alice.addr).publicKey])
            ),
          },
        ],
      }
    );
  });

  test('verifyCreator and opt in', async () => {
    const { algod } = fixture.context;
    const { appId } = await appClient.appClient.getAppReference();

    const lsigAccount = await getLsigAccount(algod, BigInt(appId), optInLsigTeal);

    // Set the delegated account public key
    lsigAccount.sigkey = algosdk.decodeAddress(bob.addr).publicKey;

    // Set the program signature from the delegated account
    lsigAccount.lsig.sig = bobSignature;

    const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: bob.addr,
      to: bob.addr,
      assetIndex: Number(asa),
      amount: 0,
      suggestedParams: await algod.getTransactionParams().do(),
    });

    /*
    URLTokenBaseHTTPError: Network request error. Received status 400 (Bad Request): TransactionPool.Remember: 
    transaction 6RIO2CO2EDPMGILW3UJKTBUGUP4PAYTQWX2AJANIVTRMI24WV6WA: 
    should have been authorized by ${bob.addr} 
    but was actually authorized by ${alice.addr}
    */
    await appClient.verifyCreator(
      { optIn: { transaction: optInTxn, signer: lsigAccount }, _asaReference: asa },
      { sender: alice }
    );
  });
});
