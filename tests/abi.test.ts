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

  it('staticArray', async function () {
    const ret = await appClient.staticArray();
    expect(ret.returnValue).to.equal(BigInt(22));
  });

  it('returnStaticArray', async function () {
    const ret = await appClient.returnStaticArray();
    expect(ret.returnValue).to.deep.equal([BigInt(11), BigInt(22), BigInt(33)]);
  });

  it('staticArrayArg', async function () {
    const ret = await appClient.staticArrayArg({
      a: [BigInt(11), BigInt(22), BigInt(33)],
    });
    expect(ret.returnValue).to.deep.equal(BigInt(22));
  });

  it('nonLiteralStaticArrayElements', async function () {
    const ret = await appClient.nonLiteralStaticArrayElements();
    expect(ret.returnValue).to.equal(BigInt(22));
  });

  it('mixedStaticArrayElements', async function () {
    const ret = await appClient.mixedStaticArrayElements();
    expect(ret.returnValue).to.equal(BigInt(1 + 4 + 7));
  });

  it('nonLiteralStaticArrayAccess', async function () {
    const ret = await appClient.nonLiteralStaticArrayAccess();
    expect(ret.returnValue).to.equal(BigInt(22));
  });
});
