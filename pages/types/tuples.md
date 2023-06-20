## Array Referencing

It is important to know that TEALScript currently passes arrays by **value**, whereas JavaScript engines typically pass arrays by **references**

### Example

#### TypeScript
```ts
const arrayOne: number[] = [1, 2]
const arrayTwo = arrayOne
arrayTwo.push(3)

console.log(arrayOne) // [1, 2, 3]
console.log(arrayTwo) // [1, 2, 3]
```

#### TEALScript

```ts
const arrayOne: number[] = [1, 2]
const arrayTwo = arrayOne
arrayTwo.push(3)

log(arrayOne) // [1, 2] <= Note this does not have the 3!
log(arrayTwo) // [1, 2, 3]
```

## Dynamic Arrays

Dynamic arrays are defined just like arrays in TypeScript. Dynamic arrays support `push`, `pop`, and `splice` and they function in the same way as the native JavaScript functions.

**Note:** In TEALScript, arrays must ***always*** be defined with a typehint

### Nested Array Limitations

Nested dynamic arrays do not updates. This means the entire array must be reconstructed, rather than using the aforementioned methods or updating individual elements. For this reason, it is strongly recommended to use `StaticArray`s whenever possible. See the examples below for clarity. 

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
const uint8Array = [1, 2, 3, 4, 5] // <= Throws Error, missing type hint
```

#### Incorrect: Updating nested dyamic value
```ts
const stringArray: string[] = ["Hello", "World!"]
stringArray[0] = "Foo" // <= Throws Error, cannot update nested dynamic type
```

## Static Arrays
Static arrays are arrays with a fixed length. Elements cannot be added or removed from StaticArrays, but they can be updated.

**Note:** In TEALScript, arrays must ***always*** be defined with a typehint

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

**Note:** In TEALScript, tuples must ***always*** be defined with a typehint

### Examples
#### Correct: Creating an object
```ts
const obj: { num: uint64, threeNumbers: uint64<3>, message: string } = {
    num: 1, 
    threeNumbers: [2, 3, 4], 
    message: 'Hello World!'
}
```