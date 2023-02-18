/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { expect } from 'chai';
import { sandbox, clients } from 'beaker-ts';
import { AbiTest } from './contracts/clients/abitest_client';

let appClient: AbiTest;

describe('ABI', function () {
  before(async function () {
    const acct = (await sandbox.getAccounts()).pop();

    appClient = new AbiTest({
      client: clients.sandboxAlgod(),
      signer: acct!.signer,
      sender: acct!.addr,
    });

    await appClient.create();
  });

  it('dynamicTupleArg runtime', async function () {
    const ret = await appClient.staticArray();
    expect(ret.returnValue).to.equal(BigInt(22));
  });
});
