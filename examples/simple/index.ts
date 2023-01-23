/* eslint-disable no-console */
import * as bkr from 'beaker-ts';
// eslint-disable-next-line import/no-unresolved, import/extensions
import { Simple as Client } from './simple_client';

// eslint-disable-next-line func-names
(async function () {
  const acct = (await bkr.sandbox.getAccounts()).pop();
  if (acct === undefined) return;

  const appClient = new Client({
    client: bkr.clients.sandboxAlgod(),
    signer: acct.signer,
    sender: acct.addr,
  });

  const { appId, appAddress, txId } = await appClient.create();
  console.log(`Created app ${appId} with address ${appAddress} in tx ${txId}`);

  await appClient.incr({ i: 1n });
  await appClient.incr({ i: 1n });
  await appClient.incr({ i: 1n });
  const { counter } = await appClient.getApplicationState();
  console.log(`counter == 3?: ${counter === 3}`);

  const result = await appClient.add({ a: 123n, b: 456n });
  console.log(`add worked?: ${result.value === 123n + 456n}`);
}());
