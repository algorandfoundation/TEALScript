/* eslint-disable no-console */

import * as algosdk from 'algosdk';
import * as algokit from '@algorandfoundation/algokit-utils';
import { FactoryCallerClient } from './FactoryCallerClient';

(async () => {
  const algodClient = new algosdk.Algodv2('a'.repeat(64), 'http://localhost', 4001);
  const kmdClient = new algosdk.Kmd('a'.repeat(64), 'http://localhost', 4002);
  const sender = await algokit.getLocalNetDispenserAccount(algodClient, kmdClient);

  const factoryCaller = new FactoryCallerClient(
    {
      sender,
      resolveBy: 'id',
      id: 0,
    },
    algodClient,
  );

  await factoryCaller.create.createApplication({});

  const { appAddress } = await factoryCaller.appClient.getAppReference();

  await factoryCaller.appClient.fundAppAccount(algokit.microAlgos(500_000));

  const asset = Number((await factoryCaller.mintAndGetAsset(
    {},
    {
      sendParams: { fee: algokit.microAlgos(8_000) },
    },
  )).return?.valueOf());

  const assetHolding = await algodClient.accountAssetInformation(
    appAddress,
    asset,
  ).do();

  console.log(`factoryCaller asset holding: ${JSON.stringify(assetHolding)}`);

  const assetInfo = await algodClient.getAssetByID(asset).do();

  console.log(`Asset info: ${JSON.stringify(assetInfo)}`);
})();
