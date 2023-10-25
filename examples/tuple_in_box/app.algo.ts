import { Contract } from '../../src/lib/index';

type Contact = { name: string; company: string };

// eslint-disable-next-line no-unused-vars
class ContactsApp extends Contract {
  contacts = BoxMap<Address, Contact>();

  myContact = GlobalStateKey<Contact>();

  setMyContact(name: string, company: string): void {
    const contact: Contact = { name: name, company: company };

    this.myContact.value = contact;
    this.contacts(this.txn.sender).value = contact;
  }

  addContact(name: string, company: string, address: Address): void {
    const contact: Contact = { name: name, company: company };
    this.contacts(address).value = contact;
  }

  updateContactField(field: string, value: string, address: Address): void {
    if (field === 'name') {
      this.contacts(address).value.name = value;
    } else if (field === 'company') {
      this.contacts(address).value.company = value;
    } else throw Error('Invalid field');
  }

  verifyContactName(name: string, address: Address): void {
    assert(this.contacts(address).value.name === name);
  }
}
