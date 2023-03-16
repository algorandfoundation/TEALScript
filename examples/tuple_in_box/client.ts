/* eslint-disable no-console */
import * as bkr from 'beaker-ts';
import * as algosdk from 'algosdk';
import { ContactsApp } from './tealscript_artifacts/contactsapp_client';

function decodeContactsTuple(encodedTuple: Uint8Array) {
  const contactTupleType = algosdk.ABITupleType.from('(string,string)');
  const decodedTuple = contactTupleType.decode(encodedTuple).valueOf() as string[];

  return {
    name: decodedTuple[0],
    company: decodedTuple[1],
  };
}

async function printContacts(appClient: ContactsApp) {
  console.log('All Contacts:');

  const addresses = await appClient.getApplicationBoxNames();

  addresses.forEach(async (address) => {
    const encodedTuple = await appClient.getApplicationBox(address);
    const decodedTuple = decodeContactsTuple(encodedTuple);

    console.log(`  ${algosdk.encodeAddress(address)}: ${decodedTuple.name} (${decodedTuple.company})`);
  });
}

async function fundApp(appClient: ContactsApp, amount: number) {
  const suggestedParams = await appClient.getSuggestedParams();

  const fundATC = new algosdk.AtomicTransactionComposer();

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    suggestedParams,
    from: appClient.sender,
    to: appClient.appAddress,
    amount,
  });

  fundATC.addTransaction({ txn, signer: appClient.signer });
  await fundATC.execute(appClient.client, 3);
}

async function main() {
  const accounts = await bkr.sandbox.getAccounts();
  const alice = accounts[0];
  const bob = accounts[1];

  const appClient = new ContactsApp({
    client: bkr.clients.sandboxAlgod(),
    sender: alice.addr,
    signer: alice.signer,
  });

  await appClient.create();

  await fundApp(appClient, 100_000);

  await fundApp(appClient, 28100);
  await appClient.setMyContact(
    { name: 'Alice', company: 'Algorand Foundation' },
    { boxes: [{ appIndex: 0, name: algosdk.decodeAddress(alice.addr).publicKey }] },
  );

  const rawState = await appClient.getApplicationState(true);

  const myContact = decodeContactsTuple(rawState[Buffer.from('myContact').toString('hex')] as Uint8Array);

  console.log(`My Contact: ${JSON.stringify(myContact)}`);
  printContacts(appClient);

  console.log('Adding Bob...');

  await fundApp(appClient, 27300);
  await appClient.addContact(
    { name: 'Bob', company: 'Algorand Foundation', address: bob.addr },
    { boxes: [{ appIndex: 0, name: algosdk.decodeAddress(bob.addr).publicKey }] },
  );

  printContacts(appClient);

  console.log("Updating Bob's company...");

  await appClient.updateContactField(
    {
      field: 'company',
      value: 'Algorand Inc',
      address: bob.addr,
    },
    {
      boxes: [{ appIndex: 0, name: algosdk.decodeAddress(bob.addr).publicKey }],
    },
  );

  printContacts(appClient);

  console.log("Updating Bob's name...");

  await fundApp(appClient, 1200);
  await appClient.updateContactField(
    { field: 'name', value: 'Bob McBobface', address: bob.addr },
    { boxes: [{ appIndex: 0, name: algosdk.decodeAddress(bob.addr).publicKey }] },
  );

  printContacts(appClient);
  console.log("Verifying Bob's name...");

  await appClient.verifyContactName(
    { name: 'Bob McBobface', address: bob.addr },
    { boxes: [{ appIndex: 0, name: algosdk.decodeAddress(bob.addr).publicKey }] },
  );
}

main();
