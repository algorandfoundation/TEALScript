/* eslint-disable no-console */
/* eslint-disable func-names */
/* eslint-disable import/no-unresolved, import/extensions */
import { sandbox, clients } from 'beaker-ts';
import { Simple as Client } from './simple_client';

(async function () {
  const acct = (await sandbox.getAccounts()).pop();
  if (acct === undefined) return;

  const appClient = new Client({
    client: clients.sandboxAlgod(),
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

  // TODO: Make this actual test
  if (counter !== 3 || result.value !== 123n + 456n) process.exit(1);
}());
