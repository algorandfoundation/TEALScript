/* eslint-disable no-console */
/* eslint-disable func-names */
import algosdk from 'algosdk';
import * as algokit from '@algorandfoundation/algokit-utils';
import { SimpleClient } from './SimpleClient';

(async function () {
  const algodClient = new algosdk.Algodv2('a'.repeat(64), 'http://localhost', 4001);
  const kmdClient = new algosdk.Kmd('a'.repeat(64), 'http://localhost', 4002);
  const acct = await algokit.getLocalNetDispenserAccount(algodClient, kmdClient);

  const simple = new SimpleClient(
    {
      sender: acct,
      resolveBy: 'id',
      id: 0,
    },
    algodClient,
  );

  const { appId, appAddress, transaction } = await simple.appClient.create();
  console.log(`Created app ${appId} with address ${appAddress} in tx ${transaction.txID()}`);

  await simple.incr({ i: 1n });
  await simple.incr({ i: 1n });
  await simple.incr({ i: 1n });
  const state = await simple.appClient.getGlobalState();

  const counter = state.counter.value;
  console.log(`counter == 3?: ${counter === 3}`);

  const addResult = await simple.add({ a: 123n, b: 456n });
  console.log(`add worked?: ${addResult.return?.valueOf() === 123n + 456n}`);

  const subResult = await simple.sub({ a: 5n, b: 3n });
  console.log(`sub worked?: ${subResult.return?.valueOf() === 5n - 3n}`);

  // TODO: Make this actual test
  if (
    counter !== 3
     || addResult.return?.valueOf() !== 123n + 456n
     || subResult.return?.valueOf() !== 5n - 3n
  ) process.exit(1);
}());
