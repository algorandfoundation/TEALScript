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

  const addResult = await appClient.add({ a: 123n, b: 456n });
  console.log(`add worked?: ${addResult.value === 123n + 456n}`);

  const subResult = await appClient.sub({ a: 5n, b: 3n });
  console.log(`sub worked?: ${subResult.value === 5n - 3n}`);

  // TODO: Make this actual test
  if (
    counter !== 3 || addResult.value !== 123n + 456n || subResult.value !== 5n - 3n
  ) process.extest(1);
}());
