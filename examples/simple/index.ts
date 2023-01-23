import * as bkr from 'beaker-ts';
import { Simple } from './simple_client';

(async function () {
  const acct = (await bkr.sandbox.getAccounts()).pop();
  if (acct === undefined) return;

  const appClient = new Simple({
    client: bkr.clients.sandboxAlgod(),
    signer: acct.signer,
    sender: acct.addr,
  });

  const { appId, appAddress, txId } = await appClient.create();
  console.log(`Created app ${appId} with address ${appAddress} in tx ${txId}`);

  await appClient.incr({ i: BigInt(1) });
  await appClient.incr({ i: BigInt(1) });
  await appClient.incr({ i: BigInt(1) });
  console.log(await appClient.getApplicationState());
}());
