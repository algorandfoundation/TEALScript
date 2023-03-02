/* eslint-disable no-console */

import { AtomicTransactionComposer } from 'algosdk';
import * as bkr from 'beaker-ts';
import * as algosdk from 'algosdk';
import { FactoryCaller } from './beaker-client/factorycaller_client';

(async () => {
  const client = bkr.clients.sandboxAlgod();
  const account = (await bkr.sandbox.getAccounts())[0];

  const factoryCaller = new FactoryCaller({
    client,
    sender: account.addr,
    signer: account.signer,
  });

  await factoryCaller.create();

  const atc = new AtomicTransactionComposer();
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    suggestedParams: await factoryCaller.getSuggestedParams(),
    from: account.addr,
    to: factoryCaller.appAddress,
    amount: 500_000,
  });

  atc.addTransaction({ txn, signer: account.signer });

  await atc.execute(factoryCaller.client, 3);

  const sp = await factoryCaller.getSuggestedParams();
  sp.fee = 8_000;
  sp.flatFee = true;

  const asset = (await factoryCaller.mintAndGetAsset({
    suggestedParams: sp,
  })).returnValue;

  const assetHolding = await factoryCaller.client.accountAssetInformation(
    factoryCaller.appAddress,
    asset!.valueOf() as number,
  ).do();

  console.log(`factoryCaller asset holding: ${JSON.stringify(assetHolding)}`);

  const assetInfo = await factoryCaller.client.getAssetByID(asset!.valueOf() as number).do();

  console.log(`Asset info: ${JSON.stringify(assetInfo)}`);
})();
