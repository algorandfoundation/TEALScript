# Storage

## Accessing State

For each storage type (local, global, and box) there are two classes that can be used to interact with application state: `Reference` and `Map`. `Reference` indicates the given property only accesses one specific key-value pair and `Map` indicates any number of keys can be accessed through the property provided they align with the key's expected type. 

To access state, first, a property must be defined with the instantiation of the respective storage class. The storage classes are generic types and use types arguments to define the types for the values and/or keys. Once the property is defined, `.get` and `.put` can be called on the property to read/write state.

## Example

```ts
class CounterApp extends Contract {
    // A global counter incremeneted on each call stored in global state
    counter = new GlobalReference<number>();

    // A counter for a specific account incremented on each call stored in a box
    accountCounter = new BoxMap<Account, number>();

    increment(): void {
        // increment global counter
        this.counter.put(this.counter.get() + 1)

        // increment box counter for senders
        this.accountCounter[this.txn.sender].set(
            this.accountCounter[this.txn.sender].get() + 1
        ) 
    }
}
```

## Other Methods

Storage classess also offer methods for functionality beyond `get`/`put`. 

### Exists

`.exists` will check if the given key has been created. 

```ts
class CounterApp extends Contract {
    boxVal = new BoxReference<number>();

    logExistance(): void {
        if (boxVal.exists()) {
            log('boxVal exists!')
        } else { 
            log('boxVal does not exist!')
        }
    }
}
```

### Delete

`.delete` will delete the key-value pair.

```ts
class CounterApp extends Contract {
    boxVal = new BoxReference<number>();

    deleteIfExists(): void {
        boxVal.exists() ? boxVal.delete() : log('boxVal does not exist!')
    }
}
```