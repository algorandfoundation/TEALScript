/* eslint-disable object-shorthand */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */

import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class ContactsApp extends Contract {
  contacts = new BoxMap<Account, {name: string, company: string}>();

  myContact = new GlobalReference<{name: string, company: string}>();

  @createApplication
  create(): void {}

  setMyContact(name: string, company: string): void {
    const contact: {name: string, company: string} = { name: name, company: company };

    this.myContact.put(contact);
    this.contacts.put(this.txn.sender, contact);
  }

  addContact(name: string, company: string, address: Account): void {
    const contact: {name: string, company: string} = { name: name, company: company };
    this.contacts.put(address, contact);
  }

  updateContactField(field: string, value: string, address: Account): void {
    if (field === 'name') {
      this.contacts.get(address).name = value;
    } else if (field === 'company') {
      this.contacts.get(address).company = value;
    } else err();
  }

  verifyContactName(name: string, address: Account): void {
    assert(this.contacts.get(address).name === name);
  }
}
