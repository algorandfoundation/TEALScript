from beaker import *
from pyteal import *
from algosdk.abi import ABIType
from beaker.lib.storage import Mapping
from algosdk.encoding import decode_address, encode_address


# Essentially a dictionary with a name and company field.
# For example: {'name': 'Alice', 'company': 'Algorand Foundation'}
class Contact(abi.NamedTuple):
    name: abi.Field[abi.String]
    company: abi.Field[abi.String]


class ContactsApp(Application):
    # contacts will be a set of boxes with the key being an address and the value being a Contact
    # For example: NHXR2OXCCFNNDEP5WDX6NOYCAA6OIW6TMEHFSQEZOJ4C5T5IHACJL5SBI4: {'name': 'Alice', 'company': 'Algorand Foundation'}
    contacts = Mapping(key_type=abi.Address, value_type=Contact)

    # my_contact will be a global state value that stores the contact information for the app creator
    my_contact = ApplicationStateValue(stack_type=TealType.bytes)

    @external(authorize=Authorize.only(Global.creator_address()))
    def set_my_contact(self, name: abi.String, company: abi.String):
        return Seq(
            # Instantiate a new Contact instance, save it to contact variable, then call .set() to set fields
            (contact := Contact()).set(name, company),
            # Since ApplicationStateValue doesn't support ABI types, we must encode the Contact as bytes
            self.my_contact.set(contact.encode()),
            # Set the contact in the contacts mapping. Mapping does support ABI types, so we do not need to encode it manually
            self.contacts[Txn.sender()].set(contact),
        )

    @external(authorize=Authorize.only(Global.creator_address()))
    def add_contact(self, name: abi.String, company: abi.String, address: abi.Address):
        # We can also instantiate ABI instances outside of our sequences
        contact = Contact()
        return Seq(
            # If we didn't instantiate contact outside of the sequence, we would write the following:
            # (contact := Contact()).set(name, company),
            contact.set(name, company),
            self.contacts[address].set(contact),
        )

    @external(authorize=Authorize.only(Global.creator_address()))
    def update_contact_field(
        self, field: abi.String, value: abi.String, address: abi.Address
    ):
        new_contact = Contact()
        old_contact = Contact()
        old_company = abi.String()

        update_name = Seq(
            (self.contacts[address].store_into(old_contact)),
            (old_contact.company.store_into(old_company)),
            new_contact.set(value, old_company),
            self.contacts[address].set(new_contact),
        )

        update_company = Seq(
            (self.contacts[address].store_into(old_contact)),
            old_contact.name.use(lambda old_name: new_contact.set(old_name, value)),
            self.contacts[address].set(new_contact),
        )

        return Seq(
            Cond(
                [field.get() == Bytes("name"), update_name],
                [field.get() == Bytes("company"), update_company],
            ),
        )

    @external
    def verify_contact_name(self, name: abi.String, address: abi.Address):
        return Seq(
            (self.contacts[address].store_into(contact := Contact())),
            # We need to call .get() on both abi instances to properly compare the values
            contact.name.use(lambda n: Assert(n.get() == name.get())),
        )


def decode_contacts_tuple(encoded_tuple):
    # Create a type so we can properly decode the tuple
    contact_tuple_type = ABIType.from_string("(string,string)")
    decoded_tuple = contact_tuple_type.decode(encoded_tuple)

    return {
        "name": decoded_tuple[0],
        "company": decoded_tuple[1],
    }


def print_contacts(app_client):
    print("All Contacts:")

    addresses = app_client.get_box_names()

    for a in addresses:
        encoded_tuple = app_client.get_box_contents(a)
        print(f"    {encode_address(a)}: {decode_contacts_tuple(encoded_tuple)}")


ContactsApp().dump("beaker_artifacts")
accts = sandbox.get_accounts()
alice = accts[0]
bob = accts[1]

app_client = client.application_client.ApplicationClient(
    client=sandbox.clients.get_algod_client(),
    app=ContactsApp(),
    sender=alice.address,
    signer=alice.signer,
)

app_client.create()

# Fund app with account MBR (0.1 ALGO)
app_client.fund(amt=100_000)

# Fund app with box MBR
app_client.fund(amt=28100)
app_client.call(
    method=ContactsApp.set_my_contact,
    name="Alice",
    company="Algorand Foundation",
    boxes=[(0, decode_address(alice.address))],
)

# Get the raw global state so the SDK doesn't try to decode for us
raw_state = app_client.get_application_state(raw=True)

# Note the key for raw state is a bytes object, so we must use b"my_contact" to access it
my_contact = decode_contacts_tuple(raw_state[b"my_contact"])

print(f"My Contact: {my_contact}")
print_contacts(app_client)

print("Adding Bob...")

# Note the box MBR for Bob is smaller than Alice's since Bob's name is shorter
app_client.fund(amt=27300)
app_client.call(
    method=ContactsApp.add_contact,
    name="Bob",
    company="Algorand Foundation",
    address=bob.address,
    boxes=[(0, decode_address(bob.address))],
)

print_contacts(app_client)

print("Updating Bob's company...")

# Techinically since we're making Bob's company shorter, we could get a refund in MBR but the app is kept simple for this example
app_client.call(
    method=ContactsApp.update_contact_field,
    field="company",
    value="Algorand Inc",
    address=bob.address,
    boxes=[(0, decode_address(bob.address))],
)
print_contacts(app_client)

print("Updating Bob's name...")

# Need to provide more funds to the app for the box MBR since we're increasing the size of Bob's name
app_client.fund(amt=1200)
app_client.call(
    method=ContactsApp.update_contact_field,
    field="name",
    value="Bob McBobface",
    address=bob.address,
    boxes=[(0, decode_address(bob.address))],
)

print_contacts(app_client)
print("Verifying Bob's name...")

app_client.call(
    method=ContactsApp.verify_contact_name,
    name="Bob McBobface",
    address=bob.address,
    boxes=[(0, decode_address(bob.address))],
)

print("Bob verified!")
