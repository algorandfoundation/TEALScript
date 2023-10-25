---
title: Arrays and Objects
---

## Dynamic Arrays

Dynamic arrays are defined just like arrays in TypeScript. Dynamic arrays support `push`, `pop`, and `splice` and they function in the same way as the native JavaScript functions.

In TEALScript, arrays must ***always*** be defined with a type annotation

### Nested Array Limitations

Nested dynamic array elements cannot be accessed or updated. This means to update a nested dynamic array, the entire array must be reconstructed, rather than using the aforementioned methods or updating individual elements. For this reason, it is strongly recommended to use `StaticArray`s whenever possible. See the examples below for clarity. 

### Examples

#### Correct: Creating a dynamic array
```ts
const uint8Array: uint64[] = [1, 2, 3, 4, 5]
```

#### Correct: Updating a nested dynamic array
```ts
let stringArray: string[] = ["Hello", "World!"]
stringArray = ["foo", "bar"]
```

#### Incorrect: Missing type hint
```ts
const uint8Array = [1, 2, 3, 4, 5] // ERROR: missing type hint
```

#### Incorrect: Updating nested dyamic value
```ts
const stringArray: string[] = ["Hello", "World!"]
stringArray[0] = "Foo" // ERROR: cannot update nested dynamic type
```

## Static Arrays
Static arrays are arrays with a fixed length. Elements cannot be added or removed from StaticArrays, but they can be updated.

In TEALScript, arrays must ***always*** be defined with a type annotation

### Examples

#### Correct: Creating a StaticArray
```ts
const staticUint8Array: StaticArray<uint64, 3> = [1, 2, 3]
```

## Tuples

Tuples are arrays with multiple types. The same rules regarding nested dynamic types and type hints apply.

### Example

#### Correct: Creating a tuple
```ts
const tuple: [uint64, StaticArray<uint64, 3>, string] = [1, [2, 3, 4], 'Hello World!']
```


## Objects

Under the hood, objects are encoded as tuples but allow you to access the elements via named keys. The same rules regarding nested dyamic types and type hints apply. 

In TEALScript, tuples must ***always*** be defined with a type annotation and object-shorthand notation must ***not*** be used. Order of the keys in the type annotation defines the order of the value encoding. 

### Examples
#### Correct: Creating an object
```ts
const obj: { num: uint64, threeNumbers: StaticArray<uint64, 3>, message: string } = {
    num: 1, 
    threeNumbers: [2, 3, 4], 
    message: 'Hello World!'
}

obj.threeNumbers[1] // 3 
```

#### Incorrect: Object Shorthand
```ts
const num = 1
const obj: { num: uint64, threeNumbers: StaticArray<uint64, 3>, message: string } = {
    num, // ERROR: can't use shorthand
    threeNumbers: [2, 3, 4], 
    message: 'Hello World!'
}
```