import { sandbox, clients } from 'beaker-ts';
import { MerkleTree } from './artifacts/merkletree_client';

async function main() {
  const acct = (await sandbox.getAccounts()).pop()!;

  const appClient = new MerkleTree({
    client: clients.sandboxAlgod(),
    signer: acct.signer,
    sender: acct.addr,
  });

  await appClient.create();

  const rawState = await appClient.getApplicationState(true);
  const rootKey = Buffer.from('root', 'utf8').toString('hex');
  const root = Buffer.from(rawState[rootKey] as Uint8Array).toString('hex');

  const expectedRoot = '80d1bf4dd6c1f75bba022337a3f0842078f5c2e7f3f59dfd33ccbb8e963367b2';

  console.log(`root match: ${root === expectedRoot}, root: ${root}, expected: ${expectedRoot}`);
}

main();
