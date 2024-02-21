/* eslint-disable no-console */
import algosdk from 'algosdk';
import * as algokit from '@algorandfoundation/algokit-utils';
import { ContactsAppClient } from './ContactsAppClient';

algokit.Config.configure({ populateAppCallResources: true });

const algodClient = new algosdk.Algodv2('a'.repeat(64), 'http://localhost', 4001);
const kmdClient = new algosdk.Kmd('a'.repeat(64), 'http://localhost', 4002);

function decodeContactsTuple(encodedTuple: Uint8Array) {
  const contactTupleType = algosdk.ABITupleType.from('(string,string)');
  const decodedTuple = contactTupleType.decode(encodedTuple).valueOf() as string[];

  return {
    name: decodedTuple[0],
    company: decodedTuple[1],
  };
}

async function printContacts(contacts: ContactsAppClient) {
  console.log('All Contacts:');

  const addresses = await contacts.appClient.getBoxNames();

  const promises = addresses.map(async (address) => {
    const encodedTuple = await contacts.appClient.getBoxValue(address);
    const decodedTuple = decodeContactsTuple(encodedTuple);

    console.log(`${algosdk.encodeAddress(address.nameRaw)}: ${decodedTuple.name} (${decodedTuple.company})`);
  });

  await Promise.all(promises);
}

async function main() {
  const alice = await algokit.getLocalNetDispenserAccount(algodClient, kmdClient);

  const bob = algosdk.generateAccount();

  const contacts = new ContactsAppClient(
    {
      sender: alice,
      resolveBy: 'id',
      id: 0,
    },
    algodClient
  );

  await contacts.create.createApplication({});

  await contacts.appClient.fundAppAccount(algokit.microAlgos(100_000));

  await contacts.appClient.fundAppAccount(algokit.microAlgos(28100));

  await contacts.setMyContact({ name: 'Alice', company: 'Algorand Foundation' });

  const state = await contacts.appClient.getGlobalState();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const myContact = decodeContactsTuple(state.myContact.valueRaw);

  console.log(`My Contact: ${JSON.stringify(myContact)}`);
  await printContacts(contacts);

  console.log('Adding Bob...');

  await contacts.appClient.fundAppAccount(algokit.microAlgos(27300));

  await contacts.addContact({ name: 'Bob', company: 'Algorand Foundation', address: bob.addr });

  await printContacts(contacts);

  console.log("Updating Bob's company...");

  await contacts.updateContactField(
    {
      field: 'company',
      value: 'Algorand Inc',
      address: bob.addr,
    },
    {}
  );

  await printContacts(contacts);

  console.log("Updating Bob's name...");

  await contacts.appClient.fundAppAccount(algokit.microAlgos(1200));

  await contacts.updateContactField({ field: 'name', value: 'Bob McBobface', address: bob.addr });

  await printContacts(contacts);
  console.log("Verifying Bob's name...");

  await contacts.verifyContactName({ name: 'Bob McBobface', address: bob.addr });
}

main();
