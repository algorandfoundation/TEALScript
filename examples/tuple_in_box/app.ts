/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */

import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class ContactsApp extends Contract {
  // TOOD: NamedTuple
  // NamedTuple will simply be a map of names in the compiler to indexes in the tuple
  // 0 index = name
  // 1 index = company
  contacts = new BoxMap<Account, [string, string]>();

  myContact = new GlobalReference<[string, string]>();

  @createApplication
  create(): void {}

  setMyContact(name: string, company: string): void {
    const contact: [string, string] = [name, company];

    this.myContact.put(contact);
    this.contacts.put(this.txn.sender, contact);
  }

  addContact(name: string, company: string, address: Account): void {
    const contact: [string, string] = [name, company];
    this.contacts.put(address, contact);
  }

  updateContactField(field: string, value: string, address: Account): void {
    if (field === 'name') {
      this.contacts.get(address)[0] = value;
    } else if (field === 'company') {
      this.contacts.get(address)[1] = value;
    } else err();
  }

  verifyContactName(name: string, address: Account): void {
    assert(this.contacts.get(address)[0] === name);
  }
}
