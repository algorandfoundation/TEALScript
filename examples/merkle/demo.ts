import { sandbox, clients } from 'beaker-ts';
import fs from 'fs';
import { MerkleTree } from './artifacts/merkletree_client';

async function getRecords(fname: string): Promise<Uint8Array[][]> {
  const rawRecords: string[][] = fs.readFileSync(fname, 'utf8').split('\n').map((line) => line.trim().split(','));

  const records: Uint8Array[][] = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const record of rawRecords) {
    if (record.length === 4) {
      const [data, ...path] = record;
      records.push([Buffer.from(data, 'utf8'), ...path.map((p) => Buffer.from(p, 'hex'))]);
    } else if (record.length === 5) {
      const [oldData, newData, ...path] = record;
      records.push([Buffer.from(oldData, 'utf8'), Buffer.from(newData, 'utf8'), ...path.map((p) => Buffer.from(p, 'hex'))]);
    }
  }
  return records;
}

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

  const recordsToAppend = await getRecords('examples/merkle/append.csv');
  // eslint-disable-next-line no-restricted-syntax
  for (const record of recordsToAppend) {
    const result = appClient.appendLeaf({ data: record[0], path: record.slice(1) });
    console.log(result);
  }

  const recordsToVerify = await getRecords('examples/merkle/verify_appends.csv');
  // eslint-disable-next-line no-restricted-syntax
  for (const record of recordsToVerify) {
    const result = appClient.verify({ data: record[0], path: record.slice(1) });
    console.log(result);
  }

  const recordsToUpdate = await getRecords('examples/merkle/update.csv');
  // eslint-disable-next-line no-restricted-syntax
  for (const record of recordsToUpdate) {
    const result = appClient.updateLeaft({
      oldData: record[0], newData: record[1], path: record.slice(2),
    });
    console.log(result);
  }

  const recordsToVerifyAgain = await getRecords('examples/merkle/verify_updates.csv');
  // eslint-disable-next-line no-restricted-syntax
  for (const record of recordsToVerifyAgain) {
    const result = appClient.verify({ data: record[0], path: record.slice(1) });
    console.log(result);
  }
}

main();
