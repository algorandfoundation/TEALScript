/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { expect } from 'chai';
import { sandbox, clients } from 'beaker-ts';
import { LoopsTest } from './contracts/clients/loopstest_client';
import { artifactsTest } from './common';

let appClient: LoopsTest;

artifactsTest('LoopsTest', 'tests/contracts/loops.algo.ts', 'tests/contracts/', 'LoopsTest');

describe('LoopsTest', function () {
  before(async function () {
    const acct = (await sandbox.getAccounts()).pop()!;

    appClient = new LoopsTest({
      client: clients.sandboxAlgod(),
      signer: acct.signer,
      sender: acct.addr,
    });

    await appClient.create();
  });

  it('whileLoop', async function () {
    const ret = await appClient.whileLoop();
    expect(ret.returnValue).to.equal(BigInt(10));
  });

  it('forLoop', async function () {
    const ret = await appClient.forLoop();
    expect(ret.returnValue).to.equal(BigInt(10));
  });
});
