/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
import fs from 'fs';
import algosdk from 'algosdk';
import * as algokit from '@algorandfoundation/algokit-utils';
import { MerkleTreeClient } from './MerkleTreeClient';

async function getRecords(fname: string): Promise<Uint8Array[][]> {
  const rawRecords: string[][] = fs.readFileSync(fname, 'utf8').split('\n').map((line) => line.trim().split(','));

  const records: Uint8Array[][] = [];
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
  const algodClient = new algosdk.Algodv2('a'.repeat(64), 'http://localhost', 4001);
  const kmdClient = new algosdk.Kmd('a'.repeat(64), 'http://localhost', 4002);

  const sender = await algokit.getLocalNetDispenserAccount(algodClient, kmdClient);

  const merkleTree = new MerkleTreeClient(
    {
      sender,
      resolveBy: 'id',
      id: 0,
    },
    algodClient,
  );
  await merkleTree.appClient.create();

  const state = await merkleTree.appClient.getGlobalState();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const root = Buffer.from(state.root.valueRaw).toString('hex');

  const expectedRoot = '80d1bf4dd6c1f75bba022337a3f0842078f5c2e7f3f59dfd33ccbb8e963367b2';

  console.log(`root match: ${root === expectedRoot}, root: ${root}, expected: ${expectedRoot}`);

  const recordsToAppend = await getRecords('examples/merkle/append.csv');
  for (const record of recordsToAppend) {
    const result = await merkleTree.appendLeaf({
      data: record[0],
      path: record.slice(1) as [Uint8Array, Uint8Array, Uint8Array],
    });
    console.log(`Appended ${record[0]} in ${result.transaction.txID()}`);
  }

  const recordsToVerify = await getRecords('examples/merkle/verify_appends.csv');
  for (const record of recordsToVerify) {
    const result = await merkleTree.verify({
      data: record[0],
      path: record.slice(1) as [Uint8Array, Uint8Array, Uint8Array],
    });
    console.log(`Verified ${record[0]} in ${result.transaction.txID()}`);
  }

  const recordsToUpdate = await getRecords('examples/merkle/update.csv');
  for (const record of recordsToUpdate) {
    const result = await merkleTree.updateLeaf({
      oldData: record[0],
      newData: record[1],
      path: record.slice(2) as [Uint8Array, Uint8Array, Uint8Array],
    });
    console.log(`Updated ${record[0]} to ${record[1]} in ${result.transaction.txID()}`);
  }

  const recordsToVerifyAgain = await getRecords('examples/merkle/verify_updates.csv');
  for (const record of recordsToVerifyAgain) {
    const result = await merkleTree.verify({
      data: record[0],
      path: record.slice(1) as [Uint8Array, Uint8Array, Uint8Array],
    });
    console.log(`Verified ${record[0]} in ${result.transaction.txID()}`);
  }
}

main();
