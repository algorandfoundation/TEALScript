For each storage type (local, global, and box) there are two classes that can be used to interact with application state: `Reference` and `Map`. `Reference` indicates the given property only accesses one specific key-value pair and `Map` indicates any number of keys can be accessed through the property provided they align with the key's expected type. 

To access state, first, a property must be defined with the instantiation of the respective storage class. The storage classes are generic types and use types arguments to define the types for the values and/or keys. Once the property is defined, `.get` and `.put` can be called on the property to read/write state. `.exists` can be used to determine if the key exists and `.delete` can be used to delete the state.

For `Map` storage properties, the first argument to every method must always be the key.

## Example

```ts
class CounterApp extends Contract {
    // A global counter incremeneted on each call stored in global state
    counter = new GlobalReference<number>();

    // A counter for a specific account incremented on each call stored in a box
    accountCounters = new BoxMap<Address, number>();

    @create
    create(): void {
        this.counter.put(0)
    }

    increment(): void {
        // increment global counter
        this.counter.put(this.counter.get() + 1)

        // Ensure the counter for the sender exists, otherwise .get() would throw an error 
        if (!this.accountCounters.exists(this.txn.sender)) {
            this.accountCounters.set(this.txn.sender, 0)
        }

        // increment box counter for sender
        this.accountCounters.set(
            this.txn.sender, this.accountCounters.get(this.txn.sender) + 1
        ) 
    }

    deleteAccountCounter(): void {
        this.accountCounters.delete(this.txn.sender)
    }
}
```