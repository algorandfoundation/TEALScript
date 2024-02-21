---
title: On-Chain Storage
---

There are three storage types available for Algorand smart contracts: global, local, and box. To read more about these storage types, you can go to [this page](https://developer.algorand.org/docs/get-details/dapps/smart-contracts/apps/state/) on the developer portal.

In general, you want to use global storage for small values (< 128 byte) when you have a known amount of key/value pairs and otherwise use box storage. There are exceptions of course when local storage makes sense, but most developers should start with global and box storage.

For each storage type, there are two classess in TEALScript for interacting with contract state `Key` and `Map`. Classes ending with `Key` point to a single key in storage and `Map` is a mapping of an undefined amount of keys to their respective values.

## Key Declaration

All `Key` functions `GlobalStateKey`, `BoxKey`, `LocalStateKey`) are generic functions with one type argument that corresponds to the type of the value held in the respective value. 

These functions all take an optional argument `key`. By default, the property name will be used for the on-chain key name. The `key` property, however, can be used to override what value is used as the on-chain key. This is paticularly useful when you want small keys on-chain but longer more-descriptive keys in TEALScript. If you want the key to be a non-string value, use `Map`s

### Examples

#### Key Declaration

```ts
class MyApp extends Contract {
    someKey = GlobalStateKey<string>()

    setSomeKey(value: string): void {
        this.someKey.value = value // On chain: "someKey" now contains value
    }
}
```

#### Modified On-Chain Key

```ts
class MyApp extends Contract {
    someKey = GlobalStateKey<string>({ key: 'sk' })

    setSomeKey(value: string): void {
        this.someKey.value = value // On chain: "sk" now contains value
    }
}
```

## Map Declaration

All `Map` functions (`GlobalStateMap`, `BoxMap`,  `LocalStateMap`) are generic functions with two type arguments that corresponds to the type of the key and the type of the value, respectively. 

These functions all take an optional argument `prefix`. The value given to `prefix` is a string that will prefix each key accessed via this `Map`. This is useful when you have two different maps that might have the same key type. The compiler will throw an error if two `Map`s of the same storage type have the same key type and no prefix.

#### Map Declaration

```ts
class MyApp extends Contract {
    favoriteColor = BoxMap<Address, string>()

    setColor(color: string): void {
        this.favoriteColor(this.txn.sender).value = color // on chain: sender's address now points to their favorite color
    }
}
```

#### Map Prefix Declaration

```ts
class MyApp extends Contract {
    favoriteColor = BoxMap<Address, string>({ prefix: 'c' })
    favoriteNumber = BoxMap<Address, string>({ prefix: 'n' })

    setColor(color: string): void {
        this.favoriteColor(this.txn.sender).value = color // on chain: ("c" + sender's address) now points to their favorite color
    }

    setNumber(number: uint64): void {
        this.favoriteNumber(this.txn.sender).value = number // on chain: ("n" + sender's address) now points to their favorite number
    }
}
```

#### Incorrect: Overlapping Key Types

```ts
class MyApp extends Contract {
    favoriteColor = BoxMap<Address, string>() // ERROR: same key type as favoriteNumber and no prefix
    favoriteNumber = BoxMap<Address, string>() // ERROR: same key type as favoriteColor and no prefix
}
```

## Box defaultSize Parameter

`BoxKey` and `BoxMap` have an additional option that is not applicable to global or local storage.

`dynamicSize` is an optional parameter that indicates whether TEALScript should call `box_del` before each `box_put`. By default, this value will be false when the value type is static and true when the value type is dynamic. This means in most cases, you shouldn't need to manually set this parameter unless you want to manually manage box resizing via `.delete()`

## StateMap maxKeys Parameter

`GlobalStateMap` and `LocalStateMap` have an additional parameter `maxKeys`.

`maxKeys` is a required parameter that indicates how many keys should be reserved for this map.

```ts
// Reserve 3 keys for this map
class MyApp extends Contract {
  data = GlobalStateMap<bytes, bytes>({ maxKeys: 3 })
  
  createApplication(){
    this.data('name').value = 'MyApp'
    this.data('version').value = '1.0.0'
    this.data('author').value = 'Me'
  }
}
```
