---
title: ABI Types
---

TEALScript supports every type defined in the ABI

* uintN
* ufixedNxM
* Tuples
* Dynamic Arrays
* Static Arrays
* Boolean

## Custom Types

Like typescript, you can define types in your TEALScript file. Currently, custom generics are not supported

### Examples

#### Defining Custom Type
```ts
type MyType = StaticArray<uint64, 3>
const a: MyType = [1, 2, 3]
```

## Reference Types

`Account`, `Asset`, and `Application` are all special types that indicate the given value must be added to the foreign reference array. TEALScript will automatically convert `Account` to `Address` (which is an alias for `byte[32]`) and `Asset`/`Application` to `uint64` where aplpicable. This means if you attempt to return one of these types or store in storage, it will converted automatically by the compiler to it's respective ABI type.

### Examples

#### Returning an Asset
```ts
foo(asa: Asset): Asset {
    return asa // returns the uint64 ID of the given asset
}
```